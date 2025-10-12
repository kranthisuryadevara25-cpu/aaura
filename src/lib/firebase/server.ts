
// This is a server-side only file.
import { initializeApp, getApp, getApps, type App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (!getApps().length) {
    try {
        // Explicitly initialize with credentials from the environment variable.
        // This is the most robust method for this environment.
        const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!serviceAccountString) {
            throw new Error("The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. The server cannot authenticate with Firebase.");
        }
        const serviceAccount = JSON.parse(serviceAccountString);
        
        app = initializeApp({
            credential: cert(serviceAccount)
        });

    } catch (e: any) {
        // Provide a clearer error message if initialization fails.
        console.error("!!! CRITICAL: Failed to initialize Firebase Admin SDK. This might be due to missing or invalid GOOGLE_APPLICATION_CREDENTIALS. Error:", e.message);
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
