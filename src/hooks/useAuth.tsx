import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { fetchUserProfile, logoutUser } from "../services/authService";
import type { UserProfile } from "../types";

interface AuthContextValue {
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// We start with undefined so we can detect if someone uses the hook outside the provider
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires once on mount (with the persisted session if any)
    // and again whenever the user logs in or out
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // necessary for the state machine

    try {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  async function logout() {
    await logoutUser();
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider value={{ userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — throws a clear error if used outside AuthProvider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
