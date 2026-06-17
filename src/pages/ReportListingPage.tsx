import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPetById } from "../services/petService";
import { createReport } from "../services/reportService";
import { useAuth } from "../hooks/useAuth";
import type { Pet, ReportReason } from "../types";
import Navbar from "../components/NavBar";

const REPORT_REASONS: ReportReason[] = [
  "Suspected animal abuse",
  "Fake listing",
  "Spam or bot listing",
  "Incorrect information",
  "Other",
];

export default function ReportListingPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!petId) return;

    async function loadPet() {
      try {
        const data = await fetchPetById(petId!);
        if (!data) {
          setLoadError("Pet not found.");
        } else {
          setPet(data);
        }
      } catch {
        setLoadError("Failed to load pet details.");
      } finally {
        setLoadingPet(false);
      }
    }

    loadPet();
  }, [petId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!description.trim()) {
      setSubmitError("Please describe the issue.");
      return;
    }
    if (!pet || !userProfile) return;

    setSubmitting(true);
    try {
      await createReport({
        petId: pet.id,
        petName: pet.name,
        reporterId: userProfile.uid,
        reporterName: userProfile.name,
        ownerId: pet.protectorId,
        reason,
        description: description.trim(),
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate(`/pets/${pet.id}`);
      }, 1500);
    } catch {
      setSubmitError("Failed to submit your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <button onClick={() => navigate(`/pets/${petId}`)} style={styles.backButton}>
          ← Back to pet details
        </button>

        {loadingPet && <p style={styles.status}>Loading…</p>}
        {loadError && <p style={styles.errorText}>{loadError}</p>}

        {pet && !submitted && (
          <div style={styles.card}>
            <h1 style={styles.title}>Report Listing</h1>
            <p style={styles.subtitle}>
              You're reporting <strong>{pet.name}</strong>. Our moderators will review this shortly.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  style={styles.select}
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  style={styles.textarea}
                  placeholder="Please provide as much detail as possible…"
                />
              </div>

              {submitError && <p style={styles.errorText}>{submitError}</p>}

              <button type="submit" disabled={submitting} style={styles.submitButton}>
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            </form>
          </div>
        )}

        {submitted && (
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Report Submitted</h2>
            <p style={styles.successText}>
              Thank you for helping keep the platform safe. Redirecting you back…
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "640px", margin: "0 auto", padding: "2rem 1.5rem" },
  backButton: {
    background: "none",
    border: "none",
    color: "#2e7d32",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: 0,
    marginBottom: "1.25rem",
  },
  status: { textAlign: "center", color: "#777", marginTop: "3rem" },
  errorText: { color: "#c62828", fontSize: "0.9rem", margin: 0 },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "1.75rem",
  },
  title: { margin: 0, fontSize: "1.4rem", color: "#222" },
  subtitle: { margin: "0.4rem 0 1.5rem", color: "#666", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#444" },
  select: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
  },
  submitButton: {
    padding: "0.75rem",
    backgroundColor: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 700,
  },
  successBox: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "2.5rem",
    textAlign: "center",
  },
  successTitle: { margin: 0, fontSize: "1.5rem", color: "#2e7d32" },
  successText: { marginTop: "0.75rem", color: "#555" },
};
