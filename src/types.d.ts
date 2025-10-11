// Types for Firestore-based entities, DTOs, and Command Models for JamJudge
// Derived from .ai/db-plan.md (entities) and .ai/api-plan.md (API contracts)

import type { Timestamp } from "firebase/firestore";

// ------------------------------------------------------
// Shared primitives
// ------------------------------------------------------

export type UserRole = "participant" | "jury" | "organizer";

export type ProjectStatus = "draft" | "submitted";

// Utility: map Firestore doc to a DTO with explicit id key
export type WithId<T, IdKey extends string = "id"> = T & {
  [K in IdKey]: string;
};

// ------------------------------------------------------
// Firestore Entity Models (Documents)
// Keep these aligned with db-plan.md. Extend only when API plan requires.
// ------------------------------------------------------

export interface UserDoc {
  uid: string; // docId in Firestore
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventDoc {
  // docId in Firestore is the logical event identifier
  name: string;
  timezone: string;
  registrationDeadline: Timestamp | null;
  submissionDeadline: Timestamp | null;
  ratingStartAt: Timestamp | null;
  ratingEndAt: Timestamp | null;
  resultsPublishedAt: Timestamp | null;
  createdBy: string; // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamDoc {
  eventId: string;
  name: string;
  nameNormalized: string;
  description: string | null;
  createdBy: string; // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamMemberDoc {
  // Subcollection: teams/{teamId}/members/{uid}
  role: string | null; // MVP uses 'member'
  addedBy: string; // uid
  createdAt: Timestamp;
}

export interface TeamNameReservationDoc {
  // docId: nameNormalized
  teamId: string;
  eventId: string;
  createdBy: string; // uid
  createdAt: Timestamp;
}

export interface ProjectDoc {
  eventId: string;
  teamId: string;
  name: string;
  description: string | null;
  repoUrl: string | null; // https:// validated client-side
  demoUrl: string | null; // https:// validated client-side
  status: ProjectStatus;
  submittedAt: Timestamp | null;
  createdBy: string; // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // The API plan references temporary unlock periods; represent as optional extension
  forceUnlockUntil?: Timestamp | null;
}

export interface ProjectAttachmentDoc {
  // Subcollection: projects/{projectId}/attachments/{attachmentId}
  name: string;
  storagePath: string; // e.g., projects/{projectId}/{uuid}
  createdBy: string; // uid
  createdAt: Timestamp;
}

export interface ProjectEvaluationDoc {
  // Subcollection: projects/{projectId}/evaluations/{jurorId}
  jurorId: string; // uid (duplicated for convenience)
  totalWeighted: number;
  scores?: Record<string, number>; // { [criterionId]: number }
  // API plan adds feedback; include as optional to preserve DB alignment + API needs
  feedback?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CriterionDoc {
  eventId: string;
  name: string;
  weight: number;
  createdBy: string; // uid
  createdAt: Timestamp;
  // API plan proposes configurable scales; keep optional to remain backward-compatible
  scaleMin?: number; // default 0 when absent
  scaleMax?: number; // default 10 when absent
}

export interface PublicResultDoc {
  eventId: string;
  projectId: string; // docId mirrors projectId
  totalScore: number;
  rank: number | null;
  updatedAt: Timestamp;
}

export type AuditAction =
  | "setUserRole"
  | "reserveTeamNameAndCreateTeam"
  | "submitProject"
  | "forceUnlockProject"
  | "lockProject"
  | "publishResults"
  | "republishResults";

export interface AuditDoc {
  action: AuditAction;
  actorUid: string;
  eventId: string | null;
  projectId: string | null;
  teamId: string | null;
  reason: string | null;
  payload?: Record<string, unknown> | null;
  createdAt: Timestamp;
}

// ------------------------------------------------------
// DTOs (Read Models)
// Shape returned/consumed by client per api-plan.md.
// ------------------------------------------------------

// Users → Read my profile
export type UserProfileDTO = Pick<
  UserDoc,
  | "uid"
  | "email"
  | "displayName"
  | "photoURL"
  | "role"
  | "createdAt"
  | "updatedAt"
>;

// Events → List/read events: response uses generic id (docId)
export type EventDTO = WithId<
  Pick<
    EventDoc,
    | "name"
    | "timezone"
    | "registrationDeadline"
    | "submissionDeadline"
    | "ratingStartAt"
    | "ratingEndAt"
    | "resultsPublishedAt"
    | "createdBy"
    | "createdAt"
    | "updatedAt"
  >
>;

// Teams → Read teams for event (fields are not strictly enumerated in API plan)
export type TeamDTO = WithId<
  Pick<
    TeamDoc,
    | "eventId"
    | "name"
    | "nameNormalized"
    | "description"
    | "createdBy"
    | "createdAt"
    | "updatedAt"
  >
>;

// Projects → List/read projects (Organizer/Jury; Team members see own)
export type ProjectDTO = WithId<
  Pick<
    ProjectDoc,
    | "eventId"
    | "teamId"
    | "name"
    | "description"
    | "repoUrl"
    | "demoUrl"
    | "status"
    | "submittedAt"
    | "createdBy"
    | "createdAt"
    | "updatedAt"
    | "forceUnlockUntil"
  >
>;

// Attachments (metadata documents read by client)
export type ProjectAttachmentDTO = WithId<
  Pick<ProjectAttachmentDoc, "name" | "storagePath" | "createdBy" | "createdAt">
>;

// Evaluations (jury)
export type ProjectEvaluationDTO = WithId<
  Pick<
    ProjectEvaluationDoc,
    | "jurorId"
    | "totalWeighted"
    | "scores"
    | "feedback"
    | "createdAt"
    | "updatedAt"
  >
>;

// Criteria (public read)
export type CriterionDTO = WithId<
  Pick<
    CriterionDoc,
    | "eventId"
    | "name"
    | "weight"
    | "createdBy"
    | "createdAt"
    | "scaleMin"
    | "scaleMax"
  >
>;

// Public leaderboard
export type PublicResultDTO = WithId<
  Pick<
    PublicResultDoc,
    "eventId" | "projectId" | "totalScore" | "rank" | "updatedAt"
  >
>;

export type AuditDTO = WithId<
  Pick<
    AuditDoc,
    | "action"
    | "actorUid"
    | "eventId"
    | "projectId"
    | "teamId"
    | "reason"
    | "payload"
    | "createdAt"
  >
>;

// ------------------------------------------------------
// Command Models (Callable Functions + client write payloads)
// These represent request/response payloads for actions defined in api-plan.md.
// ------------------------------------------------------

// 2.2 Users
export type UpdateMyProfileCommand = Partial<
  Pick<UserDoc, "displayName" | "photoURL">
>;

export interface SetUserRoleCommand {
  targetUid: string;
  role: UserRole;
}
export interface SetUserRoleResponse {
  success: true;
  uid: string;
  role: UserRole;
}

// 2.3 Events
export type UpsertEventCommand = Pick<
  EventDoc,
  | "name"
  | "timezone"
  | "registrationDeadline"
  | "submissionDeadline"
  | "ratingStartAt"
  | "ratingEndAt"
  | "resultsPublishedAt"
> & { id?: string };

// 2.4 Teams
export interface ReserveTeamNameAndCreateTeamCommand {
  eventId: string;
  name: string;
  description?: string;
}
export interface ReserveTeamNameAndCreateTeamResponse {
  teamId: string;
  name: string;
  nameNormalized: string;
  eventId: string;
}

export type UpdateTeamCommand = Partial<Pick<TeamDoc, "name" | "description">>;

// Organizer-only member management (client writes subcollection directly in MVP)
export type TeamMemberWrite = TeamMemberDoc;

// 2.5 Projects
export type UpsertProjectCommand = Pick<
  ProjectDoc,
  | "eventId"
  | "teamId"
  | "name"
  | "description"
  | "repoUrl"
  | "demoUrl"
  | "status"
  | "createdBy"
> & { projectId?: string };

export interface SubmitProjectCommand {
  projectId: string;
}
export interface SubmitProjectResponse {
  projectId: string;
  status: Extract<ProjectStatus, "submitted">;
  submittedAt: number | Timestamp; // API example shows epoch ms; Firestore uses Timestamp. Accept either for typing convenience.
}

export interface ForceUnlockProjectCommand {
  projectId: string;
  reason: string;
  unlockMinutes?: number;
}
export interface ForceUnlockProjectResponse {
  projectId: string;
  forceUnlockUntil: number | Timestamp; // epoch ms or Firestore Timestamp
}

export interface LockProjectCommand {
  projectId: string;
  reason?: string;
}
export interface LockProjectResponse {
  projectId: string;
  status: ProjectStatus;
}

// 2.6 Attachments (Files) — Firestore metadata document creation
export type CreateAttachmentMetadataCommand = Pick<
  ProjectAttachmentDoc,
  "name" | "storagePath" | "createdBy"
>;

// 2.7 Criteria
export type UpsertCriterionCommand = Pick<
  CriterionDoc,
  "eventId" | "name" | "weight" | "scaleMin" | "scaleMax"
> & { id?: string };

// 2.8 Evaluations (Jury)
export interface UpsertEvaluationCommand {
  jurorId: string; // should match current uid
  scores: Record<string, number>;
  feedback?: string | null;
  totalWeighted?: number; // client may compute for convenience; server recomputes on publish
}

// 2.9 Leaderboard publication
export interface PublishResultsCommand {
  eventId: string;
}
export interface PublishResultsResponse {
  eventId: string;
  published: number;
}

export interface RepublishResultsCommand {
  eventId: string;
  reason?: string;
}
export interface RepublishResultsResponse {
  eventId: string;
  published: number;
}

// ------------------------------------------------------
// Convenience aliases for Firestore document paths (optional for app usage)
// ------------------------------------------------------

export type UserId = string;
export type EventId = string;
export type TeamId = string;
export type ProjectId = string;
export type CriterionId = string;

// ------------------------------------------------------
// Context-specific types
// ------------------------------------------------------

export type EventStage =
  | "registration"
  | "work_in_progress"
  | "submission"
  | "rating"
  | "finished"
  | "unknown";

export interface EventContextType {
  event: EventDTO | null;
  currentStage: EventStage;
  deadlines: {
    submission: Timestamp | null;
    rating: Timestamp | null;
  };
  isLoading: boolean;
  error: Error | null;
}
