import { useEffect, useState } from "react";
import { collection, query, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { EventDTO } from "../types";

export const useActiveEvent = () => {
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const eventsCollection = collection(db, "events");
    // For MVP, we assume there's only one event and we fetch it.
    const q = query(eventsCollection, limit(1));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          setEvent(null);
          setError(new Error("No active event found."));
        } else {
          const eventDoc = querySnapshot.docs[0];
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data(),
          } as EventDTO);
          setError(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching active event:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { event, isLoading, error };
};
