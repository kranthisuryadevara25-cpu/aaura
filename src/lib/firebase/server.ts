
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let adminApp: App;
let db: Firestore;
let auth: Auth;

/**
 * Initializes (or reuses) Firebase Admin SDK.
 * Loads credentials from FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 */
export function getFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin')!;
  } else {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

      adminApp = initializeApp(
        {
          credential: cert(serviceAccount),
        },
        'firebase-admin'
      );
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error);
      throw new Error(`Firebase Admin SDK could not be initialized: ${error.message}`);
    }
  }
  
  db = getFirestore(adminApp);
  auth = getAuth(adminApp);

  return { adminApp, db, auth };
}
