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

/**
 * Publish results for an event
 * Aggregates evaluations, calculates rankings, and creates publicResults
 * Organizer only
 */
export const publishResults = functions.https.onCall(
  async (request): Promise<{ eventId: string; published: number }> => {
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
        "Only organizers can publish results",
      );
    }

    // Validate request
    const { eventId } = data as { eventId: string };

    if (!eventId || typeof eventId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "eventId is required",
      );
    }

    // Get event
    const eventRef = db.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Event not found");
    }

    // Get all submitted projects for the event
    const projectsSnapshot = await db
      .collection("projects")
      .where("eventId", "==", eventId)
      .where("status", "==", "submitted")
      .get();

    if (projectsSnapshot.empty) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "No submitted projects found for this event",
      );
    }

    // Get criteria for weight calculation
    const criteriaSnapshot = await db
      .collection("criteria")
      .where("eventId", "==", eventId)
      .get();

    const criteriaMap = new Map<string, { name: string; weight: number }>();
    criteriaSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      criteriaMap.set(doc.id, {
        name: data.name,
        weight: data.weight,
      });
    });

    // Calculate aggregated scores for each project
    const projectScores: Array<{
      projectId: string;
      projectName: string;
      teamId: string;
      teamName: string;
      totalScore: number;
      evaluationCount: number;
    }> = [];

    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      const projectId = projectDoc.id;

      // Get team data for denormalization
      const teamDoc = await db
        .collection("teams")
        .doc(projectData.teamId)
        .get();
      const teamData = teamDoc.exists ? teamDoc.data() : null;

      // Get all evaluations for this project
      const evaluationsSnapshot = await db
        .collection("projects")
        .doc(projectId)
        .collection("evaluations")
        .get();

      if (evaluationsSnapshot.empty) {
        // No evaluations - skip or add with score 0
        projectScores.push({
          projectId,
          projectName: projectData.name || "Unnamed Project",
          teamId: projectData.teamId,
          teamName: teamData?.name || "Unknown Team",
          totalScore: 0,
          evaluationCount: 0,
        });
        continue;
      }

      // Calculate average weighted score across all evaluations
      let totalWeightedSum = 0;
      let evaluationCount = 0;

      evaluationsSnapshot.docs.forEach((evalDoc) => {
        const evalData = evalDoc.data();
        const scores = evalData.scores || {};

        // Calculate weighted score for this evaluation
        let weightedScore = 0;
        let totalWeight = 0;

        Object.entries(scores).forEach(([criterionId, score]) => {
          const criterion = criteriaMap.get(criterionId);
          if (criterion) {
            weightedScore += (score as number) * criterion.weight;
            totalWeight += criterion.weight;
          }
        });

        // Normalize by total weight if needed
        const normalizedScore =
          totalWeight > 0 ? weightedScore / totalWeight : 0;
        totalWeightedSum += normalizedScore;
        evaluationCount++;
      });

      const averageScore =
        evaluationCount > 0 ? totalWeightedSum / evaluationCount : 0;

      projectScores.push({
        projectId,
        projectName: projectData.name || "Unnamed Project",
        teamId: projectData.teamId,
        teamName: teamData?.name || "Unknown Team",
        totalScore: averageScore,
        evaluationCount,
      });
    }

    // Sort by totalScore descending
    projectScores.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    projectScores.forEach((project, index) => {
      (project as typeof project & { rank: number }).rank = index + 1;
    });

    // Write to publicResults collection (batch write for atomicity)
    const batch = db.batch();

    // Clear existing publicResults for this event
    const existingResultsSnapshot = await db
      .collection("publicResults")
      .where("eventId", "==", eventId)
      .get();

    existingResultsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Write new results
    projectScores.forEach((project) => {
      const resultRef = db.collection("publicResults").doc(project.projectId);
      batch.set(resultRef, {
        eventId,
        projectId: project.projectId,
        projectName: project.projectName,
        teamName: project.teamName,
        totalScore: project.totalScore,
        rank: (project as typeof project & { rank: number }).rank,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Update event resultsPublishedAt
    batch.update(eventRef, {
      resultsPublishedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Commit batch
    await batch.commit();

    // Create audit log
    await db.collection("audits").add({
      action: "publishResults",
      actorUid: auth.uid,
      eventId,
      projectId: null,
      teamId: null,
      reason: null,
      payload: {
        projectCount: projectScores.length,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      eventId,
      published: projectScores.length,
    };
  },
);

/**
 * Republish results for an event (with reason)
 * Organizer only
 */
export const republishResults = functions.https.onCall(
  async (request): Promise<{ eventId: string; published: number }> => {
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
        "Only organizers can republish results",
      );
    }

    // Validate request
    const { eventId, reason } = data as { eventId: string; reason?: string };

    if (!eventId || typeof eventId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "eventId is required",
      );
    }

    // Create audit log for republish
    await db.collection("audits").add({
      action: "republishResults",
      actorUid: auth.uid,
      eventId,
      projectId: null,
      teamId: null,
      reason: reason || "Manual republish",
      payload: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Call publishResults with same logic
    return publishResults.run(request);
  },
);
