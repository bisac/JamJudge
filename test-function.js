// Test Cloud Function z konsoli przeglądarki
// 1. Otwórz aplikację i zaloguj się jako organizer
// 2. Otwórz DevTools (F12) → Console
// 3. Skopiuj i wklej poniższy kod:

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./src/firebase";

const functions = getFunctions(app);
const forceUnlockProject = httpsCallable(functions, "forceUnlockProject");

// Test call
forceUnlockProject({
  projectId: "YOUR_PROJECT_ID", // Zamień na prawdziwe ID projektu
  reason: "Testing cloud function deployment",
  unlockMinutes: 60,
})
  .then((result) => {
    console.log("✅ SUCCESS:", result.data);
    console.log(
      "Project unlocked until:",
      new Date(result.data.forceUnlockUntil),
    );
  })
  .catch((error) => {
    console.error("❌ ERROR:", error.code, error.message);
  });
