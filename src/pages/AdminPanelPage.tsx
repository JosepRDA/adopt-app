import { useEffect, useState } from "react";
import {
  fetchAllReports,
  markReportResolved,
  dismissReport,
} from "../services/reportService";
import { removeReportedPet } from "../services/petService";
import type { Report } from "../types";
import Navbar from "../components/NavBar";
import ReportStatusBadge from "../components/ReportStatusBadge";

export default function AdminPanelPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllReports();
      setReports(data);
    } catch {
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const openReports = reports.filter((r) => r.status === "open");
  const resolvedReports = reports.filter((r) => r.status === "resolved");

  async function handleMarkResolved(report: Report) {
    setProcessingId(report.id);
    try {
      await markReportResolved(report.id);
      await loadReports();
    } catch {
      alert("Failed to update the report. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDismiss(report: Report) {
    setProcessingId(report.id);
    try {
      await dismissReport(report.id);
      await loadReports();
    } catch {
      alert("Failed to update the report. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRemoveListing(report: Report) {
    const confirmed = window.confirm(
      `Remove "${report.petName}"? This will permanently delete the listing and resolve this report. Any pending adoption requests for this pet will be rejected.`
    );
    if (!confirmed) return;

    setProcessingId(report.id);
    try {
      await removeReportedPet(report.petId);
      await markReportResolved(report.id);
      await loadReports();
    } catch {
      alert("Failed to remove the listing. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.subtitle}>Review reported listings and moderate the platform.</p>

        {loading && <p style={styles.status}>Loading…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Summary stats */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{openReports.length}</span>
                <span style={styles.statLabel}>Open Reports</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{resolvedReports.length}</span>
                <span style={styles.statLabel}>Resolved Reports</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{reports.length}</span>
                <span style={styles.statLabel}>Total Reports</span>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Recent Reports</h2>

            {reports.length === 0 && (
              <p style={styles.status}>No reports have been submitted yet.</p>
            )}

            <div style={styles.list}>
              {reports.map((report) => (
                <div key={report.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.petName}>{report.petName}</h3>
                      <p style={styles.meta}>
                        Reported by {report.reporterName} ·{" "}
                        {report.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <ReportStatusBadge status={report.status} />
                  </div>

                  <div style={styles.detailGrid}>
                    <DetailBlock label="Reason" text={report.reason} />
                    <DetailBlock label="Description" text={report.description} />
                  </div>

                  {report.status === "open" && (
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleMarkResolved(report)}
                        disabled={processingId === report.id}
                        style={styles.resolveButton}
                      >
                        {processingId === report.id ? "Processing…" : "Mark Resolved"}
                      </button>
                      <button
                        onClick={() => handleDismiss(report)}
                        disabled={processingId === report.id}
                        style={styles.dismissButton}
                      >
                        {processingId === report.id ? "Processing…" : "Dismiss Report"}
                      </button>
                      <button
                        onClick={() => handleRemoveListing(report)}
                        disabled={processingId === report.id}
                        style={styles.removeButton}
                      >
                        {processingId === report.id ? "Processing…" : "Remove Listing"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

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
  status: { textAlign: "center", color: "#777", marginTop: "2rem" },
  errorText: { textAlign: "center", color: "#c62828", marginTop: "2rem" },
  statsRow: { display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" },
  statCard: {
    flex: "1 1 160px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
  },
  statNumber: { fontSize: "1.8rem", fontWeight: 800, color: "#2e7d32" },
  statLabel: { fontSize: "0.8rem", color: "#777", fontWeight: 600, textTransform: "uppercase" },
  sectionTitle: { fontSize: "1.15rem", color: "#222", marginBottom: "1rem" },
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
  petName: { margin: 0, fontSize: "1.1rem", color: "#222" },
  meta: { margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#888" },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  actions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  resolveButton: {
    padding: "0.55rem 1.1rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  dismissButton: {
    padding: "0.55rem 1.1rem",
    backgroundColor: "#fff",
    color: "#555",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  removeButton: {
    padding: "0.55rem 1.1rem",
    backgroundColor: "#fff",
    color: "#c62828",
    border: "1px solid #c62828",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
};

const detailStyles: Record<string, React.CSSProperties> = {
  block: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  label: { fontSize: "0.72rem", color: "#999", fontWeight: 700, textTransform: "uppercase" },
  text: { margin: 0, fontSize: "0.88rem", color: "#444", lineHeight: 1.5 },
};
