import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import type { EventDTO, ProjectDTO } from "../types";

interface UseProjectGuardsResult {
  isReadOnly: boolean;
  reason: string | null;
}

const isAfter = (a: Timestamp | null | undefined, b: Timestamp): boolean => {
  if (!a) return false;
  const aDate = a.toDate();
  const bDate = b.toDate();
  return aDate.getTime() > bDate.getTime();
};

export const useProjectGuards = (
  project: ProjectDTO | null,
  event: EventDTO | null,
): UseProjectGuardsResult => {
  return useMemo(() => {
    if (!project) {
      return { isReadOnly: false, reason: null };
    }

    const now = Timestamp.now();

    // Force unlock window overrides submitted state
    const forceUnlockActive =
      project.forceUnlockUntil && isAfter(project.forceUnlockUntil, now);

    if (project.status === "submitted" && !forceUnlockActive) {
      return { isReadOnly: true, reason: "Project has been submitted." };
    }

    const submissionDeadline = event?.submissionDeadline || null;
    if (submissionDeadline && !isAfter(submissionDeadline, now)) {
      // now >= submissionDeadline
      return {
        isReadOnly: true,
        reason: "Submission deadline has passed.",
      };
    }

    return { isReadOnly: false, reason: null };
  }, [project, event]);
};
