// Script to add organizer role to a user
// Usage: node scripts/addOrganizer.js <email>

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = process.argv[2];
const uid = process.argv[3];

if (!email || !uid) {
  console.error("❌ Usage: node scripts/addOrganizer.js <email> <uid>");
  console.log("\n📝 Example:");
  console.log("   node scripts/addOrganizer.js admin@test.com abc123def456\n");
  console.log("💡 Find UID in Firebase Console → Authentication → Users");
  process.exit(1);
}

async function addOrganizer() {
  try {
    console.log("🔄 Adding organizer role to user...");
    console.log("   Email:", email);
    console.log("   UID:", uid);

    const userRef = doc(db, "users", uid);

    await setDoc(
      userRef,
      {
        uid: uid,
        email: email,
        displayName: email.split("@")[0],
        photoURL: null,
        role: "organizer",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    console.log("✅ SUCCESS! User is now an organizer!");
    console.log("\n📊 Document path: users/" + uid);
    console.log(
      "🌐 View in console: https://console.firebase.google.com/project/jamjudge/firestore/data/users/" +
        uid,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

addOrganizer();
