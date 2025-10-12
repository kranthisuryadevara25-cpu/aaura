
'use server';

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

let adminApp: App;
let db: Firestore;
let auth: Auth;

function getFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin')!;
    db = getFirestore(adminApp);
    auth = getAuth(adminApp);
  } else {
    try {
      const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credentialsString) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set or empty. Please check your .env file.");
      }
      
      const serviceAccount = JSON.parse(credentialsString);

      adminApp = initializeApp({
        credential: cert(serviceAccount)
      }, 'firebase-admin');
      
      db = getFirestore(adminApp);
      auth = getAuth(adminApp);
      
      console.log("Firebase Admin SDK initialized successfully.");

    } catch (error: any) {
      console.error("Firebase Admin SDK initialization failed:", error.message);
      // In a real app, you might want to handle this more gracefully
      // For now, we throw to make the configuration error obvious.
      throw new Error(`Firebase Admin SDK could not be initialized: ${error.message}`);
    }
  }
  return { adminApp, db, auth };
}

export { getFirebaseAdmin };
