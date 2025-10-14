import type { APIRequestContext } from "@playwright/test";

const BASE_URL =
  "http://localhost:8081/v1/projects/demo-test/databases/(default)/documents";

export async function seedPublishedLeaderboard(request: APIRequestContext) {
  // Create event with published results
  const eventResponse = await request.post(
    `${BASE_URL}/events?documentId=test-event-1`,
    {
      data: {
        fields: {
          name: { stringValue: "JamJudge Open 2025" },
          resultsPublishedAt: { timestampValue: "2025-01-01T12:00:00Z" },
          timezone: { stringValue: "UTC" },
          createdBy: { stringValue: "test-admin" },
          createdAt: { timestampValue: "2025-01-01T10:00:00Z" },
          updatedAt: { timestampValue: "2025-01-01T10:00:00Z" },
        },
      },
    },
  );
  if (!eventResponse.ok()) {
    throw new Error(`Failed to create event: ${await eventResponse.text()}`);
  }

  // Create public result 1
  const result1Response = await request.post(
    `${BASE_URL}/publicResults?documentId=result-1`,
    {
      data: {
        fields: {
          eventId: { stringValue: "test-event-1" },
          projectId: { stringValue: "project-alpha" },
          rank: { integerValue: "1" },
          projectName: { stringValue: "Project Alpha" },
          teamName: { stringValue: "Team A" },
          totalScore: { doubleValue: 92.34 },
          updatedAt: { timestampValue: "2025-01-01T12:00:00Z" },
        },
      },
    },
  );
  if (!result1Response.ok()) {
    throw new Error(
      `Failed to create result 1: ${await result1Response.text()}`,
    );
  }

  // Create public result 2
  const result2Response = await request.post(
    `${BASE_URL}/publicResults?documentId=result-2`,
    {
      data: {
        fields: {
          eventId: { stringValue: "test-event-1" },
          projectId: { stringValue: "project-beta" },
          rank: { integerValue: "2" },
          projectName: { stringValue: "Project Beta" },
          teamName: { stringValue: "Team B" },
          totalScore: { doubleValue: 88.1 },
          updatedAt: { timestampValue: "2025-01-01T12:00:00Z" },
        },
      },
    },
  );
  if (!result2Response.ok()) {
    throw new Error(
      `Failed to create result 2: ${await result2Response.text()}`,
    );
  }

  // Verification step: Ensure the data is readable
  const verificationResponse = await request.get(
    `${BASE_URL}/events/test-event-1`,
  );
  if (!verificationResponse.ok()) {
    throw new Error(
      "Verification failed: Could not read back event data after seeding.",
    );
  }
}
