"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "./firebase-config";

// auth.currentUser is null for a moment after every page load while Firebase
// restores the session, so pages must wait for onAuthStateChanged instead of
// reading auth.currentUser directly.
export function subscribeToAuthUser(firebaseAuth, { onUser, onSignedOut }, listen = onAuthStateChanged) {
  return listen(firebaseAuth, (user) => {
    if (user) {
      onUser(user);
    } else {
      onSignedOut();
    }
  });
}

// Returns { user, loading }. Signed-out visitors are sent to redirectTo.
export default function useAuthUser(redirectTo = "/login") {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToAuthUser(auth, {
      onUser: (signedInUser) => {
        setUser(signedInUser);
        setLoading(false);
      },
      onSignedOut: () => {
        setUser(null);
        setLoading(false);
        router.replace(redirectTo);
      },
    });
  }, [router, redirectTo]);

  return { user, loading };
}
