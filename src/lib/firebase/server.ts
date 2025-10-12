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
        console.error("Failed to initialize firebase-admin:", e);
        // Fallback for environments where the key might not be available
        // but we don't want the app to crash on build.
        app = initializeApp();
    }
} else {
    app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export function getFirebaseServer() {
    return { app, db, auth };
}
