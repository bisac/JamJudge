import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfileDTO, UserDoc } from "../types";
import { AuthContext, type AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] Initializing auth listener");
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log(
        "[AuthProvider] Auth state changed - user:",
        user?.uid || "null",
      );
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
      console.log(
        "[AuthProvider] Setting up profile listener for:",
        firebaseUser.uid,
      );
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const unsubscribeProfile = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const profile = {
              uid: docSnap.id,
              ...docSnap.data(),
            } as UserProfileDTO;
            console.log(
              "[AuthProvider] Profile loaded - role:",
              profile.role,
              "displayName:",
              profile.displayName,
            );
            setUserProfile(profile);
          } else {
            // Handle case where user exists in Auth but not in Firestore
            // Set user profile to null - this will be handled by RequireAuth
            console.warn(
              "[AuthProvider] User profile not found in Firestore. User may need activation.",
            );
            setUserProfile(null);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("[AuthProvider] Error fetching user profile:", error);
          // In case of error, set profile to null
          setUserProfile(null);
          setIsLoading(false);
        },
      );

      return () => unsubscribeProfile();
    }
  }, [firebaseUser]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create user profile document in Firestore
      const userDoc: UserDoc = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName,
        photoURL: null,
        role: "participant", // Default role
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value: AuthContextType = {
    user: userProfile,
    firebaseUser,
    isLoading,
    hasMultipleRoles: false, // Placeholder
    login,
    signUp,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
