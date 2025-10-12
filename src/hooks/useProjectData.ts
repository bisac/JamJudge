import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthContext } from "./useAuthContext";
import { useEventContext } from "./useEventContext";
import type { ProjectAttachmentDTO, ProjectDTO, ProjectId } from "../types";

interface UseProjectDataResult {
  projectId: ProjectId | null;
  project: ProjectDTO | null;
  attachments: ProjectAttachmentDTO[];
  isLoading: boolean;
  error: Error | null;
}

export const useProjectData = (): UseProjectDataResult => {
  const { user } = useAuthContext();
  const { event } = useEventContext();

  const [projectId, setProjectId] = useState<ProjectId | null>(null);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [attachments, setAttachments] = useState<ProjectAttachmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Resolve participant's project for the active event
  useEffect(() => {
    if (!user?.uid || !event?.id) {
      setProjectId(null);
      setProject(null);
      setAttachments([]);
      setIsLoading(false);
      return;
    }

    // MVP heuristic: assume project is owned by the participant (createdBy)
    const projectsCollection = collection(db, "projects");
    const q = query(
      projectsCollection,
      where("eventId", "==", event.id),
      where("createdBy", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          if (querySnapshot.empty) {
            setProjectId(null);
            setProject(null);
            setAttachments([]);
            setError(null);
            setIsLoading(false);
            return;
          }

          const projectDoc = querySnapshot.docs[0];
          const projectData = {
            id: projectDoc.id,
            ...projectDoc.data(),
          } as ProjectDTO;

          setProjectId(projectDoc.id);
          setProject(projectData);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          setError(err as Error);
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid, event?.id]);

  // Subscribe to attachments for the resolved project
  useEffect(() => {
    if (!projectId) {
      setAttachments([]);
      return;
    }

    const attachmentsCollection = collection(
      db,
      "projects",
      projectId,
      "attachments",
    );
    const q = query(attachmentsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ProjectAttachmentDTO[];
          setAttachments(data);
        } catch (err) {
          setError(err as Error);
        }
      },
      (err) => setError(err),
    );

    return () => unsubscribe();
  }, [projectId]);

  return { projectId, project, attachments, isLoading, error };
};
