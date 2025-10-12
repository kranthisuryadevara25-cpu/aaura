
// This is a server-side only file.
import { initializeApp, getApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

// The Firebase Admin SDK will automatically use the GOOGLE_APPLICATION_CREDENTIALS
// environment variable if it's available. This is the standard and secure way
// to provide credentials in a Google Cloud environment.
if (!getApps().length) {
    try {
        app = initializeApp();
    } catch (e: any) {
        console.error("!!! CRITICAL: Failed to initialize Firebase Admin SDK. This is likely because the GOOGLE_APPLICATION_CREDENTIALS environment variable is not set correctly. Error:", e.message);
        // Set app to undefined to ensure getFirebaseServer throws a clear error.
        app = undefined as any; 
    }
} else {
    app = getApp();
}

const db = app ? getFirestore(app) : undefined;
const auth = app ? getAuth(app) : undefined;

export function getFirebaseServer() {
    if (!app || !db || !auth) {
        throw new Error("Firebase Admin SDK has not been initialized. Check server logs for a critical error message regarding credentials.");
    }
    return { app, db, auth };
}
