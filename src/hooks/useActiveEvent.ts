import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthContext } from "./useAuthContext";
import type { EventDTO, UpsertEventCommand } from "../types";

export const useActiveEvent = () => {
  const { user } = useAuthContext();
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("[useActiveEvent] Hook initialized");
    const eventsCollection = collection(db, "events");
    // For MVP, we assume there's only one event and we fetch it.
    const q = query(eventsCollection, limit(1));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log(
          "[useActiveEvent] Snapshot received, empty:",
          querySnapshot.empty,
        );
        if (querySnapshot.empty) {
          console.log("[useActiveEvent] No events found - ready for creation");
          setEvent(null);
          setError(null); // No error when empty - allow creation
        } else {
          const eventDoc = querySnapshot.docs[0];
          const eventData = {
            id: eventDoc.id,
            ...eventDoc.data(),
          } as EventDTO;
          console.log(
            "[useActiveEvent] Event found:",
            eventData.id,
            eventData.name,
          );
          setEvent(eventData);
          setError(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("[useActiveEvent] Error fetching active event:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const createEvent = useCallback(
    async (data: UpsertEventCommand) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to create event");
      }

      const eventsCollection = collection(db, "events");

      // Convert timestamps
      const firestoreData: Record<string, string | Timestamp | null> = {
        name: data.name,
        timezone: data.timezone,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Convert nullable timestamp fields
      const timestampFields = [
        "registrationDeadline",
        "submissionDeadline",
        "ratingStartAt",
        "ratingEndAt",
        "resultsPublishedAt",
      ] as const;

      timestampFields.forEach((field) => {
        const value = data[field];
        if (value === null || value === undefined) {
          firestoreData[field] = null;
        } else if (value instanceof Date) {
          firestoreData[field] = Timestamp.fromDate(value);
        } else if (typeof value === "object" && "toDate" in value) {
          firestoreData[field] = Timestamp.fromDate(
            (value as { toDate: () => Date }).toDate(),
          );
        }
      });

      const docRef = await addDoc(eventsCollection, firestoreData);
      return docRef.id;
    },
    [user?.uid],
  );

  const updateEvent = useCallback(
    async (updates: Partial<UpsertEventCommand>) => {
      if (!event) {
        throw new Error("No active event to update");
      }

      const eventRef = doc(db, "events", event.id);

      // Convert null values and Date objects to Firestore Timestamps
      const firestoreUpdates: Record<
        string,
        string | Timestamp | null | undefined
      > = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert nullable timestamp fields
      const timestampFields = [
        "registrationDeadline",
        "submissionDeadline",
        "ratingStartAt",
        "ratingEndAt",
        "resultsPublishedAt",
      ] as const;

      timestampFields.forEach((field) => {
        if (field in updates) {
          const value = updates[field];
          if (value === null) {
            firestoreUpdates[field] = null;
          } else if (value instanceof Date) {
            firestoreUpdates[field] = Timestamp.fromDate(value);
          } else if (value && typeof value === "object" && "toDate" in value) {
            // Already a Timestamp or Dayjs that can be converted
            firestoreUpdates[field] = Timestamp.fromDate(
              (value as { toDate: () => Date }).toDate(),
            );
          }
        }
      });

      await updateDoc(eventRef, firestoreUpdates);
    },
    [event],
  );

  return { event, isLoading, error, createEvent, updateEvent };
};
