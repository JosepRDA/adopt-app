import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

// Wraps PrivateRoute's job (auth check) with an additional role check.
// Used for /admin — non-admins are redirected home rather than to /login,
// since they ARE authenticated, just not authorized for this page.
export default function AdminRoute({ children }: AdminRouteProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>;
  }

  if (!userProfile || userProfile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
