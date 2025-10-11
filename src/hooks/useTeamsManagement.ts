import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { TeamDTO, UserProfileDTO } from "../types";
import { message } from "antd";

export interface TeamWithMembersViewModel extends TeamDTO {
  members: UserProfileDTO[];
}

export const useTeamsManagement = (eventId: string | null) => {
  const [teams, setTeams] = useState<TeamWithMembersViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const teamsCollection = collection(db, "teams");
    const q = query(
      teamsCollection,
      where("eventId", "==", eventId),
      orderBy("name", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        try {
          const teamsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TeamDTO[];

          // Fetch all users once
          const usersCollection = collection(db, "users");
          const usersSnapshot = await getDocs(usersCollection);
          const usersMap = new Map<string, UserProfileDTO>();
          usersSnapshot.forEach((userDoc) => {
            usersMap.set(userDoc.id, {
              uid: userDoc.id,
              ...userDoc.data(),
            } as UserProfileDTO);
          });

          // For each team, fetch members from subcollection
          const teamsWithMembers = await Promise.all(
            teamsData.map(async (team) => {
              const membersCollection = collection(
                db,
                `teams/${team.id}/members`,
              );
              const membersSnapshot = await getDocs(membersCollection);
              const members = membersSnapshot.docs
                .map((memberDoc) => {
                  const userProfile = usersMap.get(memberDoc.id);
                  return userProfile || null;
                })
                .filter((member): member is UserProfileDTO => member !== null);

              return {
                ...team,
                members,
              };
            }),
          );

          setTeams(teamsWithMembers);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching teams with members:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error subscribing to teams:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  const assignUser = async (
    userId: string,
    teamId: string,
    addedBy: string,
  ) => {
    try {
      const memberDocRef = doc(db, `teams/${teamId}/members/${userId}`);
      const memberData = {
        role: "member" as const,
        addedBy,
        createdAt: serverTimestamp(),
      };

      await setDoc(memberDocRef, memberData);
      message.success("User assigned to team successfully");
    } catch (err) {
      console.error("Error assigning user to team:", err);
      message.error("Failed to assign user to team");
      throw err;
    }
  };

  return { teams, assignUser, isLoading, error };
};
