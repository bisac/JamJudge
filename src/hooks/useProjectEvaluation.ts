import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { message } from "antd";
import type { ProjectDTO, CriterionDTO, ProjectEvaluationDTO } from "../types";
import { useAuthContext } from "./useAuthContext";
import { useEventCriteria } from "./useEventCriteria";

export interface EvaluationFormData {
  scores: Record<string, number>;
  feedback: string | null;
}

interface UseProjectEvaluationResult {
  project: ProjectDTO | null;
  criteria: CriterionDTO[];
  evaluation: ProjectEvaluationDTO | null;
  saveEvaluation: (data: EvaluationFormData) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useProjectEvaluation = (
  projectId: string | null,
  eventId: string | null,
): UseProjectEvaluationResult => {
  const { user } = useAuthContext();
  const { criteria, isLoading: criteriaLoading } = useEventCriteria(eventId);

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [evaluation, setEvaluation] = useState<ProjectEvaluationDTO | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch project data
  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    const loadProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as ProjectDTO);
        } else {
          setProject(null);
          setError(new Error("Project not found"));
        }
      } catch (err) {
        console.error("Error loading project:", err);
        setError(err as Error);
      }
    };

    loadProject();
  }, [projectId]);

  // Real-time listener for evaluation
  useEffect(() => {
    if (!projectId || !user) {
      setEvaluation(null);
      setIsLoading(false);
      return;
    }

    const evaluationRef = doc(
      db,
      "projects",
      projectId,
      "evaluations",
      user.uid,
    );

    const unsubscribe = onSnapshot(
      evaluationRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setEvaluation({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as ProjectEvaluationDTO);
        } else {
          setEvaluation(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error listening to evaluation:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [projectId, user]);

  // Set loading state based on both project and criteria
  useEffect(() => {
    setIsLoading(criteriaLoading || (!project && !!projectId));
  }, [criteriaLoading, project, projectId]);

  // Save evaluation function
  const saveEvaluation = useCallback(
    async (data: EvaluationFormData) => {
      if (!projectId || !user) {
        throw new Error("Missing project ID or user");
      }

      setIsSaving(true);
      try {
        const evaluationData = {
          jurorId: user.uid,
          scores: data.scores,
          feedback: data.feedback,
          totalWeighted: 0, // Will be calculated on results publication
          updatedAt: Timestamp.now(),
          createdAt: evaluation?.createdAt || Timestamp.now(),
        };

        await setDoc(
          doc(db, "projects", projectId, "evaluations", user.uid),
          evaluationData,
          { merge: true },
        );

        // Success notification is handled by the component using this hook
      } catch (err) {
        console.error("Error saving evaluation:", err);
        message.error("Failed to save evaluation");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [projectId, user, evaluation?.createdAt],
  );

  return {
    project,
    criteria,
    evaluation,
    saveEvaluation,
    isSaving,
    isLoading,
    error,
  };
};
