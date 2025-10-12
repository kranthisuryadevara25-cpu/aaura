
// This is a server-side only file.
import { initializeApp, getApp, getApps, type App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

let app: App;

if (!getApps().length) {
    try {
        const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!serviceAccountString) {
            throw new Error("The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Please check your .env file.");
        }
        
        const serviceAccount = JSON.parse(serviceAccountString);

        app = initializeApp({
            credential: cert(serviceAccount)
        });
        console.log("Firebase Admin SDK initialized successfully.");

    } catch (error: any) {
        console.error("Firebase Admin SDK initialization failed:", error.message);
        // We throw an error here to halt the application if Firebase Admin fails to initialize.
        // This prevents downstream errors from a non-functional SDK.
        throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
    }
} else {
    app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export function getFirebaseServer() {
    return { app, db, auth };
}
