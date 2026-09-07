import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebaseAdmin";
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

    // Admin init and the collection-group query both fail loudly on bad config
    // (malformed service account, missing index) — report that as JSON rather
    // than letting the route throw an opaque 500.
    let db: ReturnType<typeof adminDb>;
    let snapshot;
    try {
        db = adminDb();
        snapshot = await db
            .collectionGroup("tasks")
            .where("reminderSentAt", "==", null)
            .where("remindAt", ">", now - LOOKBACK_MS)
            .where("remindAt", "<=", now)
            .get();
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

    // Group by owner so a user with three things due gets one email, not three.
    const byUser = new Map<string, { id: string; task: DueTask }[]>();

    for (const docSnap of snapshot.docs) {
        const uid = docSnap.ref.parent.parent?.id;
        if (!uid) continue;

        const data = docSnap.data();
        if (data.isDone) continue;

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    let sent = 0;
    let skipped = 0;
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
            const profile = await db.doc(`users/${uid}`).get();
            if (profile.exists && profile.data()?.remindersEnabled === false) {
                skipped += items.length;
                await stamp();
                continue;
            }

            const user = await adminAuth().getUser(uid);
            if (!user.email) {
                skipped += items.length;
                await stamp();
                continue;
            }

            const email = buildReminderEmail({
                name: user.displayName ?? null,
                tasks: items.map((item) => item.task),
                appUrl,
            });

            await sendEmail({
                to: user.email,
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
        checked: snapshot.size,
        recipients: byUser.size,
        sent,
        skipped,
        failures,
    });
}
