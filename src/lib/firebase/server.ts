
'use server';

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import serviceAccount from '../../../serviceAccountKey.json';

let adminApp: App;
let db: Firestore;
let auth: Auth;

function getFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin')!;
  } else {
    try {
        adminApp = initializeApp({
            credential: cert(serviceAccount as any)
        }, 'firebase-admin');
    } catch (error: any) {
      console.error("Firebase Admin SDK initialization failed:", error.message);
      throw new Error(`Firebase Admin SDK could not be initialized. Error: ${error.message}`);
    }
  }
  
  db = getFirestore(adminApp);
  auth = getAuth(adminApp);

  return { adminApp, db, auth };
}

export { getFirebaseAdmin };
