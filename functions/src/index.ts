import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Types
interface ForceUnlockProjectRequest {
  projectId: string;
  reason: string;
  unlockMinutes?: number;
}

interface ForceUnlockProjectResponse {
  projectId: string;
  forceUnlockUntil: number; // epoch ms
}

/**
 * Force unlock a submitted project temporarily
 * Organizer only
 */
export const forceUnlockProject = functions.https.onCall(
  async (request): Promise<ForceUnlockProjectResponse> => {
    const { auth, data } = request;

    // Authentication check
    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    // Authorization check - must be organizer
    const userDoc = await db.collection("users").doc(auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "organizer") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only organizers can unlock projects",
      );
    }

    // Validate request
    const {
      projectId,
      reason,
      unlockMinutes = 60,
    } = data as ForceUnlockProjectRequest;

    if (!projectId || typeof projectId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "projectId is required",
      );
    }

    if (!reason || typeof reason !== "string" || reason.length < 10) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reason is required and must be at least 10 characters",
      );
    }

    if (typeof unlockMinutes !== "number" || unlockMinutes < 1) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "unlockMinutes must be a positive number",
      );
    }

    // Get project
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const projectData = projectDoc.data();
    if (projectData?.status !== "submitted") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Only submitted projects can be unlocked",
      );
    }

    // Calculate unlock expiry
    const forceUnlockUntil = admin.firestore.Timestamp.fromMillis(
      Date.now() + unlockMinutes * 60 * 1000,
    );

    // Update project with unlock timestamp
    await projectRef.update({
      forceUnlockUntil,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create audit log entry
    await db.collection("audits").add({
      action: "forceUnlockProject",
      actorUid: auth.uid,
      eventId: projectData.eventId || null,
      projectId,
      teamId: projectData.teamId || null,
      reason,
      payload: {
        unlockMinutes,
        forceUnlockUntil: forceUnlockUntil.toMillis(),
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      projectId,
      forceUnlockUntil: forceUnlockUntil.toMillis(),
    };
  },
);
