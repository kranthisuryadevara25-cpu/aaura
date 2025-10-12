
// This is a server-side only file.
import { initializeApp, getApp, getApps, type App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (!getApps().length) {
    try {
        const serviceAccount = require('../../../serviceAccountKey.json');
        app = initializeApp({
            credential: cert(serviceAccount)
        });
    } catch (e) {
        console.error("!!! CRITICAL: Failed to load service account key. The file 'serviceAccountKey.json' may be missing or malformed. Server-side Firebase services will not work. Error:", e);
        // Fallback for environments where the key might not be available
        // but we don't want the app to crash on build. This will likely
        // fail on any server-side Firebase calls, but it prevents a build crash.
        // A better approach in production is to use environment variables.
        if (process.env.GCP_PROJECT) {
             app = initializeApp();
        } else {
             // To prevent crashing in local dev if the key is missing.
             // The next call to getFirebaseServer will throw a useful error.
             app = undefined as any;
        }
    }
} else {
    app = getApp();
}

const db = app ? getFirestore(app) : undefined;
const auth = app ? getAuth(app) : undefined;

export function getFirebaseServer() {
    if (!app || !db || !auth) {
        throw new Error("Firebase Admin SDK has not been initialized. Check for errors in 'serviceAccountKey.json' or environment configuration.");
    }
    return { app, db, auth };
}
