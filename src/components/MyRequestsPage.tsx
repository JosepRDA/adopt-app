import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchRequestsByApplicant } from "../services/adoptionService";
import type { AdoptionRequest } from "../types";
import Navbar from "../components/NavBar";
import StatusBadge from "../components/StatusBadge";

export default function MyRequestsPage() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    async function loadRequests() {
      try {
        const data = await fetchRequestsByApplicant(userProfile!.uid);
        // Show the most recently submitted requests first
        data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setRequests(data);
      } catch {
        setError("Failed to load your requests. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [userProfile]);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.title}>My Adoption Requests</h1>
        <p style={styles.subtitle}>Track the status of pets you've applied to adopt.</p>

        {loading && <p style={styles.status}>Loading…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <p style={styles.status}>You haven't submitted any adoption requests yet.</p>
        )}

        {!loading && !error && requests.length > 0 && (
          <div style={styles.list}>
            {requests.map((request) => (
              <div key={request.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <h2 style={styles.petName}>{request.petName}</h2>
                  <p style={styles.date}>
                    Submitted on {request.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" },
  title: { margin: 0, fontSize: "1.6rem", color: "#222" },
  subtitle: { margin: "0.25rem 0 1.5rem", color: "#666", fontSize: "0.9rem" },
  status: { textAlign: "center", color: "#777", marginTop: "2.5rem" },
  errorText: { textAlign: "center", color: "#c62828", marginTop: "2.5rem" },
  list: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
    padding: "1.1rem 1.4rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  cardLeft: { display: "flex", flexDirection: "column", gap: "0.2rem" },
  petName: { margin: 0, fontSize: "1.05rem", color: "#222" },
  date: { margin: 0, fontSize: "0.82rem", color: "#888" },
};
