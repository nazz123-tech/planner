import { NextResponse } from "next/server";

// TEMPORARY diagnostic for the reminder-sweep 500. Delete once resolved.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const out: Record<string, unknown> = { nodeVersion: process.version };

    const describe = (e: unknown) =>
        e instanceof Error ? `${e.name}: ${e.message.slice(0, 300)}` : String(e);

    try {
        const { createRequire } = await import("node:module");
        createRequire(import.meta.url)("jose");
        out.requireJose = "ok";
    } catch (e) {
        out.requireJose = describe(e);
    }

    try {
        await import("firebase-admin/auth");
        out.importFirebaseAdminAuth = "ok";
    } catch (e) {
        out.importFirebaseAdminAuth = describe(e);
    }

    try {
        await import("firebase-admin/firestore");
        out.importFirebaseAdminFirestore = "ok";
    } catch (e) {
        out.importFirebaseAdminFirestore = describe(e);
    }

    // Does a real Node require() succeed where Turbopack's external shim fails?
    try {
        const { createRequire } = await import("node:module");
        const mod = createRequire(import.meta.url)("firebase-admin/auth");
        out.nodeRequireFirebaseAdminAuth =
            typeof mod?.getAuth === "function" ? "ok, getAuth present" : "loaded but no getAuth";
    } catch (e) {
        out.nodeRequireFirebaseAdminAuth = describe(e);
    }

    return NextResponse.json(out);
}
