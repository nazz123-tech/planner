import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebaseAdmin";
import { buildReminderEmail, type DueTask } from "./email";
import { emailProvider, sendEmail } from "./send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Don't chase reminders that went stale while the cron was down — a message
 * about something that already started is noise, not a reminder.
 */
const LOOKBACK_MS = 6 * 60 * 60 * 1000;

function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json(
            { error: "CRON_SECRET is not configured" },
            { status: 500 },
        );
    }
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
        return unauthorized();
    }

    const provider = emailProvider();
    if (!provider) {
        return NextResponse.json(
            { error: "GMAIL_USER and GMAIL_APP_PASSWORD must be set" },
            { status: 500 },
        );
    }

    const now = Date.now();

    /*
     * Walks users and queries each one's own tasks subcollection, rather than
     * a collectionGroup("tasks") query across all of them.
     *
     * A collection-group query needs a collection-group-scoped index even on a
     * single field — Firestore only creates single-field indexes automatically
     * at collection scope — so the group form failed in production with
     * FAILED_PRECONDITION until someone built that index by hand. A range over
     * one collection uses the automatic index, so this needs no Firestore
     * configuration at all.
     *
     * Walking users is also the honest shape now: since the address comes from
     * users/{uid}, an account with no profile document could never be emailed
     * anyway.
     *
     * `reminderSentAt` and `isDone` stay in-memory checks: the window is at
     * most LOOKBACK_MS wide, so this is a handful of documents per user.
     */
    let db: ReturnType<typeof adminDb>;
    let profiles;
    try {
        db = adminDb();
        profiles = (await db.collection("users").get()).docs;
    } catch (error) {
        console.error("Reminder sweep could not read users", error);
        return NextResponse.json(
            {
                error: "Could not read users",
                detail:
                    error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 },
        );
    }

    // Grouped by owner so a user with three things due gets one email.
    const byUser = new Map<string, { id: string; task: DueTask }[]>();
    const profileById = new Map<string, FirebaseFirestore.DocumentData>();
    let checked = 0;

    try {
        for (const profile of profiles) {
            const uid = profile.id;
            profileById.set(uid, profile.data() ?? {});

            const snapshot = await db
                .collection(`users/${uid}/tasks`)
                .where("remindAt", ">", now - LOOKBACK_MS)
                .where("remindAt", "<=", now)
                .get();

            checked += snapshot.size;

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                if (data.isDone) continue;
                // reminderSentAt holds the send timestamp once sent, and is
                // null or absent while the reminder is still owed.
                if (data.reminderSentAt != null) continue;

                const bucket = byUser.get(uid) ?? [];
                bucket.push({
                    id: docSnap.ref.path,
                    task: {
                        title: String(data.title ?? "Untitled task"),
                        date: String(data.date ?? ""),
                        time: String(data.time ?? ""),
                        description:
                            typeof data.description === "string"
                                ? data.description
                                : undefined,
                    },
                });
                byUser.set(uid, bucket);
            }
        }
    } catch (error) {
        console.error("Reminder sweep could not read tasks", error);
        return NextResponse.json(
            {
                error: "Could not read tasks",
                detail:
                    error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 },
        );
    }

    // Trim a trailing slash so email links don't come out as "…app//calendar".
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

    let sent = 0;
    let skipped = 0;
    let noAddress = 0;
    const failures: string[] = [];

    for (const [uid, items] of byUser) {
        // Mark first-or-last? Last: only stamp when we know the outcome, but
        // always stamp so a permanently-failing address can't loop forever.
        const stamp = async () => {
            const batch = db.batch();
            for (const { id } of items) {
                batch.update(db.doc(id), { reminderSentAt: Date.now() });
            }
            await batch.commit();
        };

        try {
            // Already loaded in the pass above; no second read.
            const data = profileById.get(uid);

            if (data?.remindersEnabled === false) {
                skipped += items.length;
                await stamp();
                continue;
            }

            // AuthContext mirrors this on sign-in. Absent means the account
            // hasn't opened the app since that shipped — a temporary state,
            // so leave the reminder unstamped and let a later sweep send it
            // rather than silently burning it.
            const address =
                typeof data?.email === "string" ? data.email : null;
            if (!address) {
                skipped += items.length;
                noAddress += items.length;
                continue;
            }

            const email = buildReminderEmail({
                name:
                    typeof data?.displayName === "string"
                        ? data.displayName
                        : null,
                tasks: items.map((item) => item.task),
                appUrl,
            });

            await sendEmail({
                to: address,
                subject: email.subject,
                text: email.text,
                html: email.html,
            });

            sent += items.length;
            await stamp();
        } catch (error) {
            failures.push(
                `${uid}: ${error instanceof Error ? error.message : "unknown"}`,
            );
        }
    }

    return NextResponse.json({
        provider,
        checked,
        recipients: byUser.size,
        sent,
        skipped,
        // Non-zero means an account hasn't signed in since the address
        // started being mirrored; those reminders are still pending.
        noAddress,
        failures,
    });
}
