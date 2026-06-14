import type { PetFilters } from "../hooks/usePets";

interface PetFiltersProps {
  filters: PetFilters;
  onChange: (updated: Partial<PetFilters>) => void;
}

// These could come from Firestore in a more advanced version,
// but hardcoding is appropriate for this project scope
const SPECIES_OPTIONS = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const SIZE_OPTIONS = ["small", "medium", "large"];

export default function PetFiltersBar({ filters, onChange }: PetFiltersProps) {
  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search by name, breed or species…"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        style={styles.searchInput}
      />

      <select
        value={filters.species}
        onChange={(e) => onChange({ species: e.target.value })}
        style={styles.select}
      >
        <option value="">All species</option>
        {SPECIES_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.size}
        onChange={(e) => onChange({ size: e.target.value })}
        style={styles.select}
      >
        <option value="">All sizes</option>
        {SIZE_OPTIONS.map((s) => (
          <option key={s} value={s} style={{ textTransform: "capitalize" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },
  searchInput: {
    flex: "1 1 240px",
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
  },
  select: {
    flex: "0 1 160px",
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
    backgroundColor: "#fff",
  },
};
