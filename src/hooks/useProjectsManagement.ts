import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase";
import type {
  ProjectDTO,
  TeamDTO,
  ForceUnlockProjectCommand,
  ForceUnlockProjectResponse,
} from "../types";
import { message } from "antd";

export interface ProjectDetailsViewModel extends ProjectDTO {
  teamName: string;
}

export const useProjectsManagement = (eventId: string | null) => {
  const [projects, setProjects] = useState<ProjectDetailsViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const projectsCollection = collection(db, "projects");
    const q = query(
      projectsCollection,
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        try {
          const projectsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ProjectDTO[];

          // Fetch all teams once to denormalize team names
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

          // Combine projects with team names
          const projectsWithTeamNames = projectsData.map((project) => {
            const team = teamsMap.get(project.teamId);
            return {
              ...project,
              teamName: team?.name || "Unknown Team",
            };
          });

          setProjects(projectsWithTeamNames);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error subscribing to projects:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  const forceUnlock = async (
    projectId: string,
    reason: string,
    unlockMinutes: number = 60,
  ) => {
    try {
      const functions = getFunctions();
      const forceUnlockProject = httpsCallable<
        ForceUnlockProjectCommand,
        ForceUnlockProjectResponse
      >(functions, "forceUnlockProject");

      const result = await forceUnlockProject({
        projectId,
        reason,
        unlockMinutes,
      });

      message.success("Project unlocked successfully");
      return result.data;
    } catch (err) {
      console.error("Error force-unlocking project:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unlock project";
      message.error(errorMessage);
      throw err;
    }
  };

  return { projects, forceUnlock, isLoading, error };
};
