import type { AdoptionRequestStatus } from "../types";

interface StatusBadgeProps {
  status: AdoptionRequestStatus;
}

const STATUS_CONFIG: Record<AdoptionRequestStatus, { label: string; color: string; background: string }> = {
  pending: { label: "Pending", color: "#8a6d00", background: "#fff3cd" },
  approved: { label: "Approved", color: "#1b5e20", background: "#e6f4ea" },
  rejected: { label: "Rejected", color: "#b71c1c", background: "#fdecea" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
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
