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

// Default Firebase configuration (fallback if env vars are not available)
// These are public values and safe to include in client-side code
const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: "AIzaSyCGWOFpBL1devnWqA9SSbBkHBM-Ent8OYM",
  authDomain: "studio-9632556640-bd58d.firebaseapp.com",
  projectId: "studio-9632556640-bd58d",
  storageBucket: "studio-9632556640-bd58d.firebasestorage.app",
  messagingSenderId: "435313355929",
  appId: "1:435313355929:web:c3266137390bee318f5c08",
};

let cachedConfig: FirebaseClientConfig | null = null;
let cachedResources: FirebaseClientResources | null = null;

function resolveFirebaseConfig(): FirebaseClientConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Always use the default config - this ensures it works in all environments
  // The default config contains the Firebase configuration values that are safe to include in client-side code
  // Environment variables are preferred when available, but since Next.js replaces them at build time
  // and they might not be available in all environments, we use the hardcoded default as a reliable fallback
  cachedConfig = DEFAULT_FIREBASE_CONFIG;
  return cachedConfig;
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
