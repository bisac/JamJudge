import React, { useEffect, useState, useMemo } from "react";
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
            // No profile doc
            console.warn(
              "[AuthProvider] User profile not found in Firestore. User may need activation.",
            );
            setUserProfile(null);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("[AuthProvider] Error fetching user profile:", error);
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

  // Calculate hasMultipleRoles dynamically
  const hasMultipleRoles = useMemo(() => {
    if (!userProfile) return false;

    // If user has roles array with multiple roles
    if (userProfile.roles && userProfile.roles.length > 1) {
      return true;
    }

    // For MVP, we assume single role unless roles array exists
    return false;
  }, [userProfile]);

  const value: AuthContextType = {
    user: userProfile,
    firebaseUser,
    isLoading,
    hasMultipleRoles,
    login,
    signUp,
    resetPassword,
    signOut,
  };

  // Show loading spinner only for a brief moment during initial auth check
  // After that, let the app render even if still loading
  if (isLoading && !firebaseUser && userProfile === null) {
    // Only show spinner on very first load
    return (
      <AuthContext.Provider value={value}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              🏆
            </div>
            <div style={{ fontSize: "16px", color: "#666" }}>
              Loading JamJudge...
            </div>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
