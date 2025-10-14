import type { APIRequestContext } from "@playwright/test";

// The Auth emulator uses the Google Identity Toolkit API.
// Any non-empty string is a valid API key for the emulator.
const AUTH_EMULATOR_URL =
  "http://localhost:9098/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key";
const FIRESTORE_EMULATOR_URL =
  "http://localhost:8081/v1/projects/demo-test/databases/(default)/documents";

/**
 * Creates a user in the Firebase Auth emulator but NOT in Firestore.
 * This is useful for testing scenarios where a user's profile document is missing.
 * @param request - The Playwright APIRequestContext.
 * @param email - The user's email.
 * @param password - The user's password.
 */
export async function seedUserInAuthOnly(
  request: APIRequestContext,
  { email, password }: { email: string; password: string },
) {
  const response = await request.post(AUTH_EMULATOR_URL, {
    data: {
      email,
      password,
      returnSecureToken: true,
    },
  });

  if (!response.ok()) {
    const errorBody = await response.text();
    // Don't throw if the user already exists, as this can happen in retries.
    if (errorBody.includes("EMAIL_EXISTS")) {
      console.warn(
        `User ${email} already exists in Auth emulator. Proceeding...`,
      );
      return;
    }
    throw new Error(`Failed to create user in Auth emulator: ${errorBody}`);
  }
}

/**
 * Creates a user in the Firebase Auth emulator AND a corresponding profile in Firestore.
 * This simulates a fully registered user.
 * @param request - The Playwright APIRequestContext.
 */
export async function seedUser(
  request: APIRequestContext,
  {
    email,
    password,
    displayName,
    role,
  }: { email: string; password: string; displayName: string; role: string },
) {
  // 1. Create user in Auth
  const authResponse = await request.post(AUTH_EMULATOR_URL, {
    data: { email, password, returnSecureToken: true },
  });

  if (!authResponse.ok()) {
    const errorBody = await authResponse.text();
    if (errorBody.includes("EMAIL_EXISTS")) {
      // This can happen on test retries, which is fine. We don't need the UID in that case,
      // as we assume the profile was created correctly the first time.
      // For a robust solution, one would look up the user first. For this test, we assume globalSetup keeps it clean.
      console.warn(
        `User ${email} already exists in Auth emulator. Assuming profile exists.`,
      );
      return;
    }
    throw new Error(`Failed to create user in Auth emulator: ${errorBody}`);
  }

  const authData = await authResponse.json();
  const uid = authData.localId;
  if (!uid) {
    throw new Error("Could not get UID from Auth emulator response.");
  }

  // 2. Create user document in Firestore
  const firestoreResponse = await request.post(
    `${FIRESTORE_EMULATOR_URL}/users?documentId=${uid}`,
    {
      data: {
        fields: {
          uid: { stringValue: uid },
          email: { stringValue: email },
          displayName: { stringValue: displayName },
          photoURL: { nullValue: null },
          role: { stringValue: role },
          createdAt: { timestampValue: new Date().toISOString() },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      },
    },
  );

  if (!firestoreResponse.ok()) {
    throw new Error(
      `Failed to create Firestore profile: ${await firestoreResponse.text()}`,
    );
  }
}
