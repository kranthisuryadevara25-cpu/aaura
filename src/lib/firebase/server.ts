
'use server';

import { config } from 'dotenv';
config();

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App;
let db: Firestore;
let auth: Auth;

function getFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin')!;
  } else {
    try {
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!credentialsJson) {
            throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
        }
        const serviceAccount = JSON.parse(credentialsJson);

        adminApp = initializeApp({
            credential: cert(serviceAccount)
        }, 'firebase-admin');

    } catch (error: any) {
      console.error("Firebase Admin SDK initialization failed:", error.message);
      throw new Error(`Firebase Admin SDK could not be initialized. Please check your environment variables. Error: ${error.message}`);
    }
  }
  
  db = getFirestore(adminApp);
  auth = getAuth(adminApp);

  return { adminApp, db, auth };
}

export { getFirebaseAdmin };
