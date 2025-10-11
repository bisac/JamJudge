import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { CriterionDTO, UpsertCriterionCommand } from "../types";
import { useAuthContext } from "./useAuthContext";

interface UseEventCriteriaResult {
  criteria: CriterionDTO[];
  isLoading: boolean;
  error: Error | null;
  addCriterion: (
    criterion: Omit<UpsertCriterionCommand, "eventId">,
  ) => Promise<string>;
  updateCriterion: (
    id: string,
    updates: Partial<UpsertCriterionCommand>,
  ) => Promise<void>;
  deleteCriterion: (id: string) => Promise<void>;
}

export const useEventCriteria = (
  eventId: string | null,
): UseEventCriteriaResult => {
  const { user } = useAuthContext();
  const [criteria, setCriteria] = useState<CriterionDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to criteria collection for the active event
  useEffect(() => {
    if (!eventId) {
      setCriteria([]);
      setIsLoading(false);
      return;
    }

    const criteriaCollection = collection(db, "criteria");
    const q = query(criteriaCollection, where("eventId", "==", eventId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const criteriaData: CriterionDTO[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CriterionDTO[];

        setCriteria(criteriaData);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching criteria:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  const addCriterion = useCallback(
    async (
      criterion: Omit<UpsertCriterionCommand, "eventId">,
    ): Promise<string> => {
      if (!eventId) {
        throw new Error("No active event to add criterion to");
      }
      if (!user?.uid) {
        throw new Error("User must be authenticated to add criteria");
      }

      const criteriaCollection = collection(db, "criteria");
      const newCriterion = {
        eventId,
        name: criterion.name,
        weight: criterion.weight,
        scaleMin: criterion.scaleMin ?? 0,
        scaleMax: criterion.scaleMax ?? 10,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(criteriaCollection, newCriterion);
      return docRef.id;
    },
    [eventId, user?.uid],
  );

  const updateCriterion = useCallback(
    async (
      id: string,
      updates: Partial<UpsertCriterionCommand>,
    ): Promise<void> => {
      if (!eventId) {
        throw new Error("No active event");
      }

      const criterionRef = doc(db, "criteria", id);

      // Only update allowed fields
      const allowedUpdates: Record<string, string | number | undefined> = {};
      if (updates.name !== undefined) allowedUpdates.name = updates.name;
      if (updates.weight !== undefined) allowedUpdates.weight = updates.weight;
      if (updates.scaleMin !== undefined)
        allowedUpdates.scaleMin = updates.scaleMin;
      if (updates.scaleMax !== undefined)
        allowedUpdates.scaleMax = updates.scaleMax;

      await updateDoc(criterionRef, allowedUpdates);
    },
    [eventId],
  );

  const deleteCriterion = useCallback(
    async (id: string): Promise<void> => {
      if (!eventId) {
        throw new Error("No active event");
      }

      const criterionRef = doc(db, "criteria", id);
      await deleteDoc(criterionRef);
    },
    [eventId],
  );

  return {
    criteria,
    isLoading,
    error,
    addCriterion,
    updateCriterion,
    deleteCriterion,
  };
};
