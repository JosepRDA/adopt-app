import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPetById } from "../services/petService";
import { useAuth } from "../hooks/useAuth";
import  petPlaceholder  from "../assets/pet_placeholder.svg";
import type { Pet } from "../types";
import Navbar from "../components/NavBar";

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner =
    userProfile?.role === "protector" && pet?.protectorId === userProfile?.uid;

  useEffect(() => {
    if (!id) return;

    async function loadPet() {
      try {
        const data = await fetchPetById(id!);
        if (!data) {
          setError("Pet not found.");
        } else {
          setPet(data);
        }
      } catch {
        setError("Failed to load pet details.");
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [id]);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to listings
        </button>

        {loading && <p style={styles.status}>Carregando…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {pet && (
          <div style={styles.card}>
            <img
              src={pet.imageUrl || petPlaceholder}
              alt={pet.name}
              style={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = petPlaceholder
              }}
            />

            <div style={styles.body}>
              <div style={styles.topRow}>
                <h1 style={styles.name}>{pet.name}</h1>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: pet.available ? "#2e7d32" : "#c62828",
                  }}
                >
                  {pet.available ? "Available" : "Adopted"}
                </span>
              </div>

              <div style={styles.meta}>
                <MetaItem label="Species" value={pet.species} />
                <MetaItem label="Breed" value={pet.breed} />
                <MetaItem label="Size" value={pet.size} />
                <MetaItem label="Age" value={`${pet.age} ${pet.age === 1 ? "year" : "years"}`} />
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>About {pet.name}</h2>
                <p style={styles.description}>{pet.description}</p>
              </div>

              <div style={styles.buttonRow}>
                {/* Adoption request will be wired up in the next phase */}
                {/* To implement. The button should redirect to AdoptionForm.tsx defined in ../components/ */}
                {userProfile?.role === "user" && pet.available && (
                  <button 
                  onClick={() => navigate(`/pets/${pet.id}/adopt`)}
                  style={styles.adoptButton}>
                    Request Adoption
                  </button>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/pets/${pet.id}/edit`)}
                      style={styles.editButton}
                    >
                      Edit Listing
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Small helper component — avoids repeating the same label+value markup 4 times
function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaStyles.item}>
      <span style={metaStyles.label}>{label}</span>
      <span style={metaStyles.value}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" },
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
  errorText: { textAlign: "center", color: "#c62828", marginTop: "3rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
    overflow: "hidden",
  },
  image: { width: "100%", height: "360px", objectFit: "cover", display: "block" },
  body: { padding: "1.75rem" },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
    gap: "1rem",
    flexWrap: "wrap",
  },
  name: { margin: 0, fontSize: "1.8rem", color: "#222" },
  badge: {
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "4px 14px",
    borderRadius: "20px",
  },
  meta: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #eee",
  },
  section: { marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#333", marginBottom: "0.5rem" },
  description: { color: "#555", lineHeight: 1.7, margin: 0 },
  buttonRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  adoptButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
  },
  editButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#fff",
    color: "#2e7d32",
    border: "1px solid #2e7d32",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
  },
};

const metaStyles: Record<string, React.CSSProperties> = {
  item: { display: "flex", flexDirection: "column", gap: "2px" },
  label: { fontSize: "0.72rem", color: "#999", fontWeight: 600, textTransform: "uppercase" },
  value: { fontSize: "0.95rem", color: "#333", fontWeight: 500, textTransform: "capitalize" },
};
