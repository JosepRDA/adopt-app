import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchRequestsByOwner,
  approveAdoptionRequest,
  rejectAdoptionRequest,
} from "../services/adoptionService";
import type { AdoptionRequest } from "../types";
import Navbar from "../components/NavBar";
import StatusBadge from "../components/StatusBadge";

export default function ManageRequestsPage() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tracks which request is currently being approved/rejected, to disable its buttons only
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    loadRequests();
  }, [userProfile]);

  async function loadRequests() {
    if (!userProfile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRequestsByOwner(userProfile.uid);
      data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setRequests(data);
    } catch {
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request: AdoptionRequest) {
    const confirmed = window.confirm(
      `Approve ${request.applicantName} for ${request.petName}? All other pending requests for this pet will be automatically rejected.`
    );
    if (!confirmed) return;

    setProcessingId(request.id);
    try {
      await approveAdoptionRequest(request);
      await loadRequests(); // Refresh so the cascade effect is visible immediately
    } catch {
      alert("Failed to approve this request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(request: AdoptionRequest) {
    const confirmed = window.confirm(
      `Reject ${request.applicantName}'s request for ${request.petName}?`
    );
    if (!confirmed) return;

    setProcessingId(request.id);
    try {
      await rejectAdoptionRequest(request.id);
      await loadRequests();
    } catch {
      alert("Failed to reject this request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.title}>Manage Adoption Requests</h1>
        <p style={styles.subtitle}>Review applications for the pets you're caring for.</p>

        {loading && <p style={styles.status}>Loading…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <p style={styles.status}>No adoption requests have been submitted yet.</p>
        )}

        {!loading && !error && requests.length > 0 && (
          <div style={styles.list}>
            {requests.map((request) => (
              <div key={request.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.applicant}>{request.applicantName}</h2>
                    <p style={styles.petName}>wants to adopt <strong>{request.petName}</strong></p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div style={styles.detailGrid}>
                  <DetailBlock label="Motivation" text={request.motivation} />
                  <DetailBlock label="Housing Situation" text={request.housingDescription} />
                  <DetailBlock label="Pet Experience" text={request.petExperience} />
                </div>

                {request.status === "pending" && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      style={styles.approveButton}
                    >
                      {processingId === request.id ? "Processing…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={processingId === request.id}
                      style={styles.rejectButton}
                    >
                      {processingId === request.id ? "Processing…" : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Small helper to avoid repeating the label+text block three times per card
function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div style={detailStyles.block}>
      <span style={detailStyles.label}>{label}</span>
      <p style={detailStyles.text}>{text}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" },
  title: { margin: 0, fontSize: "1.6rem", color: "#222" },
  subtitle: { margin: "0.25rem 0 1.5rem", color: "#666", fontSize: "0.9rem" },
  status: { textAlign: "center", color: "#777", marginTop: "2.5rem" },
  errorText: { textAlign: "center", color: "#c62828", marginTop: "2.5rem" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #eee",
  },
  applicant: { margin: 0, fontSize: "1.1rem", color: "#222" },
  petName: { margin: "0.2rem 0 0", fontSize: "0.9rem", color: "#666" },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  actions: { display: "flex", gap: "0.75rem" },
  approveButton: {
    padding: "0.55rem 1.25rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  rejectButton: {
    padding: "0.55rem 1.25rem",
    backgroundColor: "#fff",
    color: "#c62828",
    border: "1px solid #c62828",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
};

const detailStyles: Record<string, React.CSSProperties> = {
  block: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  label: { fontSize: "0.72rem", color: "#999", fontWeight: 700, textTransform: "uppercase" },
  text: { margin: 0, fontSize: "0.88rem", color: "#444", lineHeight: 1.5 },
};
