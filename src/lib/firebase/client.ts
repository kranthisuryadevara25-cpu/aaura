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

type FirebaseClientResources = {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
};

let cachedConfig: FirebaseClientConfig | null = null;
let cachedResources: FirebaseClientResources | null = null;

function resolveFirebaseConfig(): FirebaseClientConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
  } = process.env;

  const apiKey = NEXT_PUBLIC_FIREBASE_API_KEY ?? FIREBASE_API_KEY;
  const authDomain = NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? FIREBASE_AUTH_DOMAIN;
  const projectId = NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? FIREBASE_PROJECT_ID;
  const storageBucket = NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? FIREBASE_MESSAGING_SENDER_ID;
  const appId = NEXT_PUBLIC_FIREBASE_APP_ID ?? FIREBASE_APP_ID;

  if (apiKey && projectId) {
    cachedConfig = {
      apiKey,
      authDomain: authDomain ?? "",
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
    return cachedConfig;
  }

  const webConfig = process.env.FIREBASE_WEBAPP_CONFIG;
  if (webConfig) {
    try {
      const parsed = JSON.parse(webConfig) as Record<string, string>;
      if (parsed?.apiKey && parsed?.projectId) {
        cachedConfig = {
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain ?? "",
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket,
          messagingSenderId: parsed.messagingSenderId,
          appId: parsed.appId,
        };
        return cachedConfig;
      }
    } catch (error) {
      console.warn("Failed to parse FIREBASE_WEBAPP_CONFIG", error);
    }
  }

  throw new Error(
    "Firebase configuration is missing. Set NEXT_PUBLIC_FIREBASE_* variables or FIREBASE_WEBAPP_CONFIG."
  );
}

function initializeResources(): FirebaseClientResources {
  if (cachedResources) {
    return cachedResources;
  }

  const config = resolveFirebaseConfig();
  const app = getApps().length ? getApp() : initializeApp(config);

  const canUsePersistentCache =
    typeof indexedDB !== "undefined" && typeof caches !== "undefined";

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

  const auth = getAuth(app);
  const storage = getStorage(app);

  cachedResources = { app, db, auth, storage };
  return cachedResources;
}

export function getFirebaseClient(): FirebaseClientResources {
  return initializeResources();
}
