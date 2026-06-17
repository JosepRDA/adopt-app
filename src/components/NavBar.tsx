import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav style={styles.nav}>
      <span onClick={() => navigate("/")} style={styles.brand}>
        🐾 PetAdopt
      </span>

      <div style={styles.right}>
        {userProfile?.role === "user" && (
          <span onClick={() => navigate("/my-requests")} style={styles.navLink}>
            My Requests
          </span>
        )}

        {userProfile?.role === "protector" && (
          <span onClick={() => navigate("/manage-requests")} style={styles.navLink}>
            Manage Requests
          </span>
        )}

        {/* Only admins see this link */}
        {userProfile?.role === "admin" && (
          <span onClick={() => navigate("/admin")} style={styles.navLink}>
            Admin Panel
          </span>
        )}

        {userProfile && (
          <span style={styles.greeting}>
            Hi, {userProfile.name}
            <span style={styles.role}>{userProfile.role}</span>
          </span>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.85rem 2rem",
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  brand: { fontSize: "1.2rem", fontWeight: 700, color: "#2e7d32", cursor: "pointer" },
  right: { display: "flex", alignItems: "center", gap: "1.25rem" },
  navLink: { fontSize: "0.9rem", color: "#444", fontWeight: 600, cursor: "pointer" },
  greeting: { fontSize: "0.9rem", color: "#444", display: "flex", alignItems: "center", gap: "0.5rem" },
  role: {
    fontSize: "0.7rem",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  logoutButton: {
    padding: "0.4rem 0.9rem",
    backgroundColor: "transparent",
    color: "#c62828",
    border: "1px solid #c62828",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
};
