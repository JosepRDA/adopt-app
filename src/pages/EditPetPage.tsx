import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPetById, updatePet } from "../services/petService";
import { useAuth } from "../hooks/useAuth";
import type { Pet } from "../types";
import type { PetFormData } from "../components/PetForm";
import PetForm from "../components/PetForm";
import Navbar from "../components/NavBar";

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadPet() {
      try {
        const data = await fetchPetById(id!);
        if (!data) {
          setError("Pet not found.");
          return;
        }
        // Prevent a protector from editing another protector's listing
        if (data.protectorId !== userProfile?.uid) {
          setError("You don't have permission to edit this listing.");
          return;
        }
        setPet(data);
      } catch {
        setError("Failed to load pet.");
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [id, userProfile]);

  async function handleSubmit(data: PetFormData) {
    await updatePet(id!, data);
    navigate(`/pets/${id}`);
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>

        {loading && <p style={styles.status}>Loading…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {pet && (
          <>
            <h1 style={styles.title}>Edit Listing — {pet.name}</h1>
            <div style={styles.card}>
              <PetForm
                // Pre-fill the form with the existing pet data
                initialData={{
                  name: pet.name,
                  species: pet.species,
                  breed: pet.breed,
                  size: pet.size,
                  age: pet.age,
                  description: pet.description,
                  imageUrl: pet.imageUrl,
                  available: pet.available,
                }}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" },
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
  title: { margin: "0 0 1.25rem", fontSize: "1.6rem", color: "#222" },
  status: { textAlign: "center", color: "#777" },
  errorText: { textAlign: "center", color: "#c62828" },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
  },
};
