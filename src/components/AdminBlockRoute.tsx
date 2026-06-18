// import { Navigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
interface AdminBlockRouteProps {
  children: React.ReactNode;
}

// Used for chat routes: any authenticated non-admin may proceed.
// Admins are redirected home — they don't participate in chats at all.
export default function AdminBlockRoute({ children }: AdminBlockRouteProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile.role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
