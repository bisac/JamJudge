import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthContext } from "./useAuthContext";
import { useEventContext } from "./useEventContext";
import type { TeamDTO, TeamId } from "../types";

export interface CreateTeamPayload {
  name: string;
  description?: string;
}

export const normalizeName = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

export const useParticipantTeam = () => {
  const { user } = useAuthContext();
  const { event } = useEventContext();
  const [team, setTeam] = useState<TeamDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to the participant's team within the active event
  useEffect(() => {
    if (!user?.uid || !event?.id) {
      setTeam(null);
      setIsLoading(false);
      return;
    }

    const teamsCol = collection(db, "teams");
    const q = query(
      teamsCol,
      where("eventId", "==", event.id),
      where("createdBy", "==", user.uid),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setTeam(null);
        } else {
          const d = snapshot.docs[0];
          setTeam({ id: d.id, ...d.data() } as TeamDTO);
        }
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid, event?.id]);

  const createTeam = useCallback(
    async ({ name, description }: CreateTeamPayload): Promise<TeamId> => {
      if (!user?.uid || !event?.id)
        throw new Error("Not authenticated or no active event");
      const nameNormalized = normalizeName(name);

      const reservationRef = doc(
        db,
        "teamNameReservations",
        `${event.id}__${nameNormalized}`,
      );
      const teamsCol = collection(db, "teams");

      const teamId = await runTransaction(db, async (tx) => {
        const reservationSnap = await tx.get(reservationRef);
        if (reservationSnap.exists()) {
          throw new Error("This team name is already taken in this event.");
        }

        const teamRef = doc(teamsCol);
        const now = Timestamp.now();
        tx.set(teamRef, {
          eventId: event.id,
          name,
          nameNormalized,
          description: description ?? null,
          createdBy: user.uid,
          createdAt: now,
          updatedAt: now,
        });

        tx.set(reservationRef, {
          teamId: teamRef.id,
          eventId: event.id,
          createdBy: user.uid,
          createdAt: now,
        });

        return teamRef.id;
      });

      // Important: write member AFTER team exists so rules can read parent team
      const memberRef = doc(db, "teams", teamId, "members", user.uid);
      await setDoc(memberRef, {
        role: "member",
        addedBy: user.uid,
        createdAt: Timestamp.now(),
      });

      return teamId;
    },
    [user?.uid, event?.id],
  );

  return { team, isLoading, error, createTeam };
};
