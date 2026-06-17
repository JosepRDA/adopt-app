import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createPet } from "../services/petService";
import type { PetFormData } from "../components/PetForm";
import PetForm from "../components/PetForm";
import Navbar from "../components/NavBar";

export default function AddPetPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Guard: only protectors should reach this page
  // PrivateRoute handles auth; this handles role
  if (userProfile?.role !== "protector") {
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Access denied.</p>;
  }

  async function handleSubmit(data: PetFormData) {
    await createPet({
      ...data,
      protectorId: userProfile!.uid,
    });
    navigate("/");
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.title}>Add a New Pet</h1>
        <p style={styles.subtitle}>Fill in the details to create a new adoption listing.</p>
        <div style={styles.card}>
          <PetForm onSubmit={handleSubmit} submitLabel="Anunciar" />
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" },
  title: { margin: 0, fontSize: "1.6rem", color: "#222" },
  subtitle: { color: "#666", marginTop: "0.25rem", marginBottom: "1.5rem" },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
  },
};
