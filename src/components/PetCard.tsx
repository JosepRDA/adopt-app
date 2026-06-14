import { useNavigate } from "react-router-dom";
import type { Pet } from "../types";

interface PetCardProps {
  pet: Pet;
  // These are only passed when the viewer is the pet's protector
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

export default function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      <div style={styles.imageWrapper}>
        <img
          src={pet.imageUrl || "https://placehold.co/400x240?text=No+Image"}
          alt={pet.name}
          style={styles.image}
          onError={(e) => {
            // Fallback if the image URL is broken
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x240?text=No+Image";
          }}
        />
        <span style={{ ...styles.badge, backgroundColor: pet.available ? "#2e7d32" : "#c62828" }}>
          {pet.available ? "Available" : "Adopted"}
        </span>
      </div>

      <div style={styles.body}>
        <h2 style={styles.name}>{pet.name}</h2>

        <div style={styles.meta}>
          <span style={styles.tag}>{pet.species}</span>
          <span style={styles.tag}>{pet.breed}</span>
          <span style={styles.tag}>{pet.size}</span>
          <span style={styles.tag}>{pet.age} {pet.age === 1 ? "yr" : "yrs"}</span>
        </div>

        <p style={styles.description}>{pet.description}</p>

        <div style={styles.actions}>
          <button
            onClick={() => navigate(`/pets/${pet.id}`)}
            style={styles.primaryButton}
          >
            View Details
          </button>

          {/* Only rendered when the logged-in user is this pet's protector */}
          {onEdit && (
            <button onClick={() => onEdit(pet)} style={styles.secondaryButton}>
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(pet)} style={styles.dangerButton}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s",
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },
  badge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "20px",
  },
  body: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    flex: 1,
  },
  name: { margin: 0, fontSize: "1.2rem", color: "#222" },
  meta: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  tag: {
    backgroundColor: "#f0f4f0",
    color: "#444",
    fontSize: "0.75rem",
    padding: "3px 8px",
    borderRadius: "4px",
    textTransform: "capitalize",
  },
  description: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#666",
    // Clamp to 3 lines so cards are uniform height
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  actions: { display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem" },
  primaryButton: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  secondaryButton: {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#fff",
    color: "#2e7d32",
    border: "1px solid #2e7d32",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  dangerButton: {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#fff",
    color: "#c62828",
    border: "1px solid #c62828",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
};
