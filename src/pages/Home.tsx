import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePets } from "../hooks/usePets";
import { deletePet } from "../services/petService";
import type { Pet } from "../types";
import Navbar from "../components/NavBar";
import PetCard from "../components/PetCard";
import PetFiltersBar from "../components/PetFilters";

export default function HomePage() {
  const { userProfile } = useAuth();
  const { pets, loading, error, filters, setFilters, refetch } = usePets();
  const navigate = useNavigate();

  const isProtector = userProfile?.role === "protector";

  async function handleDelete(pet: Pet) {
    const confirmed = window.confirm(
      `Certeza de que deseja deletar "${pet.name}"? Isso sera permanente.`
    );
    if (!confirmed) return;

    try {
      await deletePet(pet.id);
      refetch(); // Re-fetch the list after deletion
    } catch {
      alert("Failed to delete pet. Please try again.");
    }
  }

  function handleEdit(pet: Pet) {
    navigate(`/pets/${pet.id}/edit`);
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Find Your Perfect Pet</h1>
            <p style={styles.subtitle}>
              {pets.length} {pets.length === 1 ? "pet" : "pets"} available for adoption
            </p>
          </div>

          {/* Only protectors see this button */}
          {isProtector && (
            <button
              onClick={() => navigate("/pets/new")}
              style={styles.addButton}
            >
              + Add Pet
            </button>
          )}
        </div>

        <PetFiltersBar
          filters={filters}
          onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        />

        {loading && <p style={styles.status}>Loading pets…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && pets.length === 0 && (
          <p style={styles.status}>No pets match your search. Try adjusting the filters.</p>
        )}

        {!loading && !error && pets.length > 0 && (
          <div style={styles.grid}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                // Only pass edit/delete handlers if this protector owns the listing
                onEdit={isProtector && pet.protectorId === userProfile?.uid ? handleEdit : undefined}
                onDelete={isProtector && pet.protectorId === userProfile?.uid ? handleDelete : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: { margin: 0, fontSize: "1.8rem", color: "#222" },
  subtitle: { margin: "0.25rem 0 0", color: "#666", fontSize: "0.95rem" },
  addButton: {
    padding: "0.65rem 1.25rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.25rem",
  },
  status: { textAlign: "center", color: "#777", marginTop: "3rem" },
  errorText: { textAlign: "center", color: "#c62828", marginTop: "3rem" },
};
