
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App;
let db: Firestore;
let auth: Auth;

/**
 * Initializes (or reuses) the Firebase Admin SDK app instance.
 * It will try to use environment variables first, then fall back to a local key file.
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      // Production-ready: Use environment variables
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        // Fallback for local development if you were to re-add the key file (not recommended for git)
        try {
            const serviceAccount = require('./secrets/serviceAccountKey.json');
             adminApp = initializeApp({
                credential: cert(serviceAccount),
             });
        } catch (e) {
            console.warn("Could not initialize Firebase Admin SDK. Service account key file not found or environment variables not set. Some server-side features may not work.");
            // Create a dummy app to avoid crashing the server
            adminApp = initializeApp();
        }
      }
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error);
      // Create a dummy app to avoid crashing the server on failed init
      adminApp = initializeApp();
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
