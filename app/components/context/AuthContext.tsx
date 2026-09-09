"use client";

import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);

      /**
       * Mirror the address onto the profile doc so the reminder sweep can
       * read it from Firestore. It used to call adminAuth().getUser(), but
       * importing firebase-admin/auth crashes the serverless function:
       * jwks-rsa require()s jose, which is ESM-only, and Turbopack's external
       * loader can't bridge that. firebase-admin/firestore is unaffected.
       */
      if (currentUser?.email) {
        void setDoc(
          doc(db, `users/${currentUser.uid}`),
          {
            email: currentUser.email,
            displayName: currentUser.displayName ?? null,
          },
          { merge: true },
        ).catch(() => {
          // A failed mirror only delays a reminder; never block sign-in.
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
