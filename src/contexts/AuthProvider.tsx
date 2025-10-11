import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfileDTO } from "../types";
import { AuthContext, type AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const unsubscribeProfile = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({
              uid: docSnap.id,
              ...docSnap.data(),
            } as UserProfileDTO);
          } else {
            // Handle case where user exists in Auth but not in Firestore
            console.error("User profile not found in Firestore.");
            setUserProfile(null);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching user profile:", error);
          setIsLoading(false);
        },
      );

      return () => unsubscribeProfile();
    }
  }, [firebaseUser]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value: AuthContextType = {
    user: userProfile,
    firebaseUser,
    isLoading,
    hasMultipleRoles: false, // Placeholder
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
