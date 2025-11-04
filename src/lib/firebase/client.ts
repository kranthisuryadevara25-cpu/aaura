'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function resolveFirebaseConfig(): FirebaseClientConfig {
  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
  } = process.env;

  if (NEXT_PUBLIC_FIREBASE_API_KEY && NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  const webConfig = process.env.FIREBASE_WEBAPP_CONFIG;
  if (webConfig) {
    try {
      const parsed = JSON.parse(webConfig) as Record<string, string>;
      if (parsed?.apiKey && parsed?.projectId) {
        return {
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain ?? "",
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket,
          messagingSenderId: parsed.messagingSenderId,
          appId: parsed.appId,
        };
      }
    } catch (error) {
      console.warn("Failed to parse FIREBASE_WEBAPP_CONFIG", error);
    }
  }

  throw new Error(
    "Firebase configuration is missing. Set NEXT_PUBLIC_FIREBASE_* variables or FIREBASE_WEBAPP_CONFIG."
  );
}

const firebaseConfig = resolveFirebaseConfig();

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const isBrowser = typeof window !== "undefined";
const canUsePersistentCache =
  isBrowser && typeof indexedDB !== "undefined" && typeof caches !== "undefined";

let db: Firestore;

if (canUsePersistentCache) {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch (error) {
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

export { app, db, auth, storage };
