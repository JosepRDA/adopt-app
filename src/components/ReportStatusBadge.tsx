import type { ReportStatus } from "../types";

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; background: string }> = {
  open: { label: "Open", color: "#8a6d00", background: "#fff3cd" },
  resolved: { label: "Resolved", color: "#1b5e20", background: "#e6f4ea" },
  dismissed: { label: "Dismissed", color: "#555", background: "#eee" },
};

export default function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      style={{
        ...styles.badge,
        color: config.color,
        backgroundColor: config.background,
      }}
    >
      {config.label}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: "inline-block",
    padding: "3px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
};
