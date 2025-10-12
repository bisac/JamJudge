import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProjectDTO, TeamDTO, ProjectEvaluationDTO } from "../types";
import { useAuthContext } from "./useAuthContext";

export type EvaluationStatus = "complete" | "in_progress" | "pending";

export interface ProjectListItemViewModel {
  id: string;
  name: string;
  teamName: string;
  teamId: string;
  status: "draft" | "submitted";
  submittedAt: Timestamp | null;
  myEvaluationStatus: EvaluationStatus;
}

// Extended evaluation type with projectId reference
interface EvaluationWithProjectId extends ProjectEvaluationDTO {
  projectId: string;
}

interface UseJuryProjectsListResult {
  projects: ProjectListItemViewModel[];
  isLoading: boolean;
  error: Error | null;
}

export const useJuryProjectsList = (
  eventId: string | null,
): UseJuryProjectsListResult => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationWithProjectId[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch teams
  useEffect(() => {
    if (!eventId) {
      setTeams([]);
      return;
    }

    const teamsCollection = collection(db, "teams");
    const q = query(teamsCollection, where("eventId", "==", eventId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const teamsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamDTO[];

        setTeams(teamsData);
      },
      (err) => {
        console.error("Error fetching teams:", err);
        setError(err);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  // Fetch projects (only submitted ones)
  useEffect(() => {
    if (!eventId) {
      setProjects([]);
      return;
    }

    const projectsCollection = collection(db, "projects");
    const q = query(
      projectsCollection,
      where("eventId", "==", eventId),
      where("status", "==", "submitted"),
      orderBy("submittedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectDTO[];

        setProjects(projectsData);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError(err);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  // Fetch my evaluations for all projects
  useEffect(() => {
    if (!eventId || !user) {
      setEvaluations([]);
      setIsLoading(false);
      return;
    }

    const fetchEvaluations = async () => {
      try {
        // Create a map to store evaluations by project ID
        const evaluationsMap = new Map<string, EvaluationWithProjectId>();

        // For each project, check if I have an evaluation
        for (const project of projects) {
          const evaluationQuery = query(
            collection(db, `projects/${project.id}/evaluations`),
            where("jurorId", "==", user.uid),
          );
          const evaluationSnapshot = await getDocs(evaluationQuery);

          if (!evaluationSnapshot.empty) {
            // Should only be one evaluation per juror per project
            const doc = evaluationSnapshot.docs[0];
            evaluationsMap.set(project.id, {
              id: doc.id,
              projectId: project.id, // Add projectId for reference
              ...doc.data(),
            } as EvaluationWithProjectId);
          }
        }

        setEvaluations(Array.from(evaluationsMap.values()));
        setError(null);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projects.length > 0) {
      fetchEvaluations();
    } else {
      setIsLoading(false);
    }
  }, [projects, user, eventId]);

  // Combine data into view models
  const projectListItems = useMemo(() => {
    // Create a map for quick team lookup
    const teamsMap = new Map(teams.map((team) => [team.id, team]));

    // Create a map for evaluation lookup by project ID
    const evaluationsMap = new Map<string, EvaluationWithProjectId>();
    evaluations.forEach((evaluation) => {
      evaluationsMap.set(evaluation.projectId, evaluation);
    });

    return projects.map((project): ProjectListItemViewModel => {
      const team = teamsMap.get(project.teamId);
      const teamName = team?.name || "Unknown Team";

      // Find evaluation for this project
      const evaluation = evaluationsMap.get(project.id);

      // Determine evaluation status
      let myEvaluationStatus: EvaluationStatus = "pending";
      if (evaluation) {
        // Check if evaluation has scores for criteria
        if (evaluation.scores && Object.keys(evaluation.scores).length > 0) {
          myEvaluationStatus = "complete";
        } else {
          myEvaluationStatus = "in_progress";
        }
      }

      return {
        id: project.id,
        name: project.name,
        teamName,
        teamId: project.teamId,
        status: project.status,
        submittedAt: project.submittedAt,
        myEvaluationStatus,
      };
    });
  }, [projects, teams, evaluations]);

  return {
    projects: projectListItems,
    isLoading,
    error,
  };
};
