
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

// Since this file is only ever imported on the server, we can directly require the JSON.
const serviceAccount = require('./secrets/serviceAccountKey.json');

let adminApp: App;
let db: Firestore;
let auth: Auth;

/**
 * Initializes (or reuses) the Firebase Admin SDK app instance.
 * Uses a directly required service account key.
 */
function initializeFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin')!;
  } else {
    try {
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
}

initializeFirebaseAdmin();

export { adminApp, db, auth };
