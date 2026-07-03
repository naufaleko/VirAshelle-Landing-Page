import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithId = async (id: string, pass: string) => {
    setError(null);
    if (id === 'VirAshelle' && pass === 'nfmj@04290126') {
      const email = 'admin@virashelle.com';
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        try {
          await createUserWithEmailAndPassword(auth, email, pass);
        } catch (createErr: any) {
          setError(createErr.message);
        }
      }
    } else {
      setError("Invalid ID or password");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return { user, loading, error, loginWithId, logout };
}
