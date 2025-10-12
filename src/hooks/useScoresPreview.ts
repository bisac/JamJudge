import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProjectDTO, TeamDTO, ProjectEvaluationDoc } from "../types";

export interface ScorePreviewViewModel {
  projectId: string;
  projectName: string;
  teamName: string;
  evaluationsCount: number;
  averageScore: number;
}

export const useScoresPreview = (eventId: string | null) => {
  const [scores, setScores] = useState<ScorePreviewViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    let unsubscribeProjects: (() => void) | null = null;

    const setupRealtimeScores = async () => {
      try {
        setIsLoading(true);

        // Fetch teams once (they don't change often)
        const teamsCollection = collection(db, "teams");
        const teamsQuery = query(
          teamsCollection,
          where("eventId", "==", eventId),
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamsMap = new Map<string, TeamDTO>();
        teamsSnapshot.forEach((teamDoc) => {
          teamsMap.set(teamDoc.id, {
            id: teamDoc.id,
            ...teamDoc.data(),
          } as TeamDTO);
        });

        // Subscribe to projects in real-time
        const projectsCollection = collection(db, "projects");
        const projectsQuery = query(
          projectsCollection,
          where("eventId", "==", eventId),
        );

        unsubscribeProjects = onSnapshot(
          projectsQuery,
          async (projectsSnapshot) => {
            const projects = projectsSnapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as ProjectDTO[];

            // For each project, fetch evaluations
            const scoresPromises = projects.map(async (project) => {
              const evaluationsCollection = collection(
                db,
                "projects",
                project.id,
                "evaluations",
              );
              const evaluationsSnapshot = await getDocs(evaluationsCollection);

              const evaluations = evaluationsSnapshot.docs.map((docSnap) =>
                docSnap.data(),
              ) as ProjectEvaluationDoc[];

              const evaluationsCount = evaluations.length;
              const averageScore =
                evaluationsCount > 0
                  ? evaluations.reduce(
                      (sum, evaluation) => sum + evaluation.totalWeighted,
                      0,
                    ) / evaluationsCount
                  : 0;

              const team = teamsMap.get(project.teamId);

              return {
                projectId: project.id,
                projectName: project.name,
                teamName: team?.name || "Unknown Team",
                evaluationsCount,
                averageScore,
              };
            });

            const scoresData = await Promise.all(scoresPromises);

            // Sort by average score descending
            scoresData.sort((a, b) => b.averageScore - a.averageScore);

            setScores(scoresData);
            setError(null);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error in scores preview subscription:", err);
            setError(err);
            setIsLoading(false);
          },
        );
      } catch (err) {
        console.error("Error setting up scores preview:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    setupRealtimeScores();

    return () => {
      if (unsubscribeProjects) {
        unsubscribeProjects();
      }
    };
  }, [eventId]);

  return { scores, isLoading, error };
};
