import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optional: connect emulators in dev
// if (
//   import.meta.env.DEV &&
//   import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true"
// ) {
//   const host = import.meta.env.VITE_EMULATOR_HOST || "localhost";
//   const authPort = Number(import.meta.env.VITE_EMULATOR_AUTH_PORT || 9099);
//   const fsPort = Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT || 8080);
//   const stPort = Number(import.meta.env.VITE_EMULATOR_STORAGE_PORT || 9199);

//   try {
//     connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
//   } catch {}
//   try {
//     connectFirestoreEmulator(db, host, fsPort);
//   } catch {}
//   try {
//     connectStorageEmulator(storage, host, stPort);
//   } catch {}
// }

export { app, auth, db, storage };
