import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { userProfile, loading } = useAuth();

  // Don't redirect while auth state is being resolved
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Carregando…</p>;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
