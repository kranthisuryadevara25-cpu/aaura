
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import serviceAccount from './secrets/serviceAccountKey.json';

let adminApp: App;
let db: Firestore;
let auth: Auth;

/**
 * Initializes (or reuses) the Firebase Admin SDK app instance.
 * Uses a directly required service account key.
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      adminApp = initializeApp(
        {
          credential: cert(serviceAccount),
        }
      );
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error);
      throw new Error(`Firebase Admin SDK could not be initialized: ${error.message}`);
    }
  } else {
    adminApp = getApps()[0];
  }

  db = getFirestore(adminApp);
  auth = getAuth(adminApp);
}

// Initialize on module load
initializeFirebaseAdmin();


export { adminApp, db, auth };
