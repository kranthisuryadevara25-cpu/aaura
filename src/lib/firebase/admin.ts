
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App;
let db: Firestore;
let auth: Auth;

/**
 * Initializes (or reuses) the Firebase Admin SDK app instance.
 * It will try to use environment variables first.
 */
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
  } else {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        console.warn(
          "Firebase Admin SDK not initialized. The `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is not set. Server-side features like `getPersonalizedFeed` may not work."
        );
        // Create a dummy app to avoid crashing if it's used where not expected
        adminApp = initializeApp();
      }
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error);
      // Create a dummy app to avoid crashing
      adminApp = initializeApp();
    }
  }

  db = getFirestore(adminApp);
  auth = getAuth(adminApp);
}

// Initialize on module load
initializeFirebaseAdmin();

export { adminApp, db, auth };
