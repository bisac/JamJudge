import fetch from "node-fetch";

async function clearFirestore() {
  const url =
    "http://localhost:8081/emulator/v1/projects/demo-test/databases/(default)/documents";
  try {
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      console.log("Successfully cleared Firestore emulator data.");
    } else {
      const errorBody = await response.text();
      console.error(
        `Failed to clear Firestore emulator data. Status: ${response.status}, Body: ${errorBody}`,
      );
    }
  } catch (error) {
    console.error(
      "Error connecting to Firestore emulator to clear data. Is it running?",
      error,
    );
  }
}

async function clearAuth() {
  const url = "http://localhost:9098/emulator/v1/projects/demo-test/accounts";
  try {
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      console.log("Successfully cleared Auth emulator data.");
    } else {
      const errorBody = await response.text();
      console.error(
        `Failed to clear Auth emulator data. Status: ${response.status}, Body: ${errorBody}`,
      );
    }
  } catch (error) {
    console.error(
      "Error connecting to Auth emulator to clear data. Is it running?",
      error,
    );
  }
}

async function globalSetup() {
  // Run cleanup operations in parallel for speed
  await Promise.all([clearFirestore(), clearAuth()]);
}

export default globalSetup;
