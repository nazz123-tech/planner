import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin/app";

/**
 * Server-only Firebase Admin access, used by the reminder sweep.
 * Never import this from a client component.
 */
function serviceAccount(): ServiceAccount {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
    }

    const parsed = JSON.parse(raw);
    // Hosting dashboards commonly store the key with escaped newlines.
    if (typeof parsed.private_key === "string") {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }

    return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
    };
}

function adminApp() {
    return getApps().length
        ? getApp()
        : initializeApp({ credential: cert(serviceAccount()) });
}

export const adminDb = () => getFirestore(adminApp());

/**
 * Deliberately no adminAuth here. firebase-admin/auth pulls in jwks-rsa,
 * which require()s the ESM-only jose; Turbopack's external-module loader
 * throws ERR_REQUIRE_ESM on it and the whole route module fails to import.
 * The reminder sweep reads the address off users/{uid} instead.
 */
