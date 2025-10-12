import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ProjectDTO, TeamDTO } from "../types";

export interface StorageUsageViewModel {
  projectId: string;
  projectName: string;
  teamName: string;
  filesCount: number;
}

export const useStorageMonitoring = (eventId: string | null) => {
  const [storageData, setStorageData] = useState<StorageUsageViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const fetchStorageData = async () => {
      try {
        setIsLoading(true);

        // Fetch all projects for the event
        const projectsCollection = collection(db, "projects");
        const projectsQuery = query(
          projectsCollection,
          where("eventId", "==", eventId),
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ProjectDTO[];

        // Fetch all teams for the event to denormalize team names
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

        // For each project, count attachments using getCountFromServer
        const storagePromises = projects.map(async (project) => {
          const attachmentsCollection = collection(
            db,
            "projects",
            project.id,
            "attachments",
          );

          // Use getCountFromServer for efficient counting
          const countSnapshot = await getCountFromServer(attachmentsCollection);
          const filesCount = countSnapshot.data().count;

          const team = teamsMap.get(project.teamId);

          return {
            projectId: project.id,
            projectName: project.name,
            teamName: team?.name || "Unknown Team",
            filesCount,
          };
        });

        const storage = await Promise.all(storagePromises);

        // Sort by files count descending
        storage.sort((a, b) => b.filesCount - a.filesCount);

        setStorageData(storage);
        setError(null);
      } catch (err) {
        console.error("Error fetching storage data:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageData();
  }, [eventId]);

  return { storageData, isLoading, error };
};
