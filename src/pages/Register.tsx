import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import type { UserRole } from "../types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(email, password, name, role);
      navigate("/"); // Redirect home after successful registration
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create an Account</h1>
        <p style={styles.subtitle}>Join our pet adoption community</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Jane Doe"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Role selection — this is the core UX decision at registration */}
          <div style={styles.field}>
            <label style={styles.label}>I want to…</label>
            <div style={styles.roleGroup}>
              <label style={styles.roleOption}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                />
                <span>
                  <strong>Adopt a pet</strong>
                  <small>Browse and request adoptions</small>
                </span>
              </label>

              <label style={styles.roleOption}>
                <input
                  type="radio"
                  name="role"
                  value="protector"
                  checked={role === "protector"}
                  onChange={() => setRole("protector")}
                />
                <span>
                  <strong>List pets for adoption</strong>
                  <small>I care for animals and want to find them homes</small>
                </span>
              </label>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  title: { margin: 0, fontSize: "1.5rem", color: "#222" },
  subtitle: { marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#444" },
  input: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
  },
  roleGroup: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" },
  roleOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: { color: "#c0392b", fontSize: "0.85rem", margin: 0 },
  button: {
    padding: "0.75rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  footer: { marginTop: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#555" },
  link: { color: "#2e7d32", fontWeight: 600 },
};
