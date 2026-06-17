// src/pages/AdoptionRequestPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPetById } from "../services/petService";
import { createAdoptionRequest } from "../services/adoptionService";
import { useAuth } from "../hooks/useAuth";
import type { Pet } from "../types";
import Navbar from "../components/NavBar";

interface AdoptionFormState {
  motivation: string;
  housingDescription: string;
  petExperience: string;
}

const EMPTY_FORM: AdoptionFormState = {
  motivation: "",
  housingDescription: "",
  petExperience: "",
};

export default function AdoptionRequestPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AdoptionFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Load the pet so we can display its details and validate availability
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

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Validation: required + no empty/whitespace-only strings
  function validate(): string | null {
    if (!formData.motivation.trim()) {
      return "Please tell us why you'd like to adopt this pet.";
    }
    if (!formData.housingDescription.trim()) {
      return "Please describe your housing situation.";
    }
    if (!formData.petExperience.trim()) {
      return "Please describe your experience with pets.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!pet || !userProfile) return;

    setSubmitting(true);
    try {
      await createAdoptionRequest({
        petId: pet.id,
        petName: pet.name,
        applicantId: userProfile.uid,
        applicantName: userProfile.name,
        ownerId: pet.protectorId,
        motivation: formData.motivation.trim(),
        housingDescription: formData.housingDescription.trim(),
        petExperience: formData.petExperience.trim(),
      });

      setSubmitted(true);
      // Give the user a moment to see the confirmation before redirecting
      setTimeout(() => {
        navigate(`/pets/${pet.id}`);
      }, 1500);
    } catch {
      setSubmitError("Failed to submit your request. Please try again.");
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
          <div style={styles.layout}>
            {/* Pet summary card */}
            <div style={styles.petSummary}>
              <img
                src={pet.imageUrl || "https://placehold.co/400x300?text=No+Image"}
                alt={pet.name}
                style={styles.petImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x300?text=No+Image";
                }}
              />
              <h2 style={styles.petName}>{pet.name}</h2>
              <p style={styles.petMeta}>
                {pet.breed} · {pet.age} {pet.age === 1 ? "year" : "years"} old
              </p>
            </div>

            {/* Adoption request form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              <h1 style={styles.formTitle}>Adoption Request</h1>
              <p style={styles.formSubtitle}>
                Tell {pet.name}'s caretaker a bit about yourself.
              </p>

              <Field label="Why would you like to adopt this pet?">
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={4}
                  style={styles.textarea}
                  placeholder="Share your motivation for adopting…"
                />
              </Field>

              <Field label="Describe your housing situation">
                <textarea
                  name="housingDescription"
                  value={formData.housingDescription}
                  onChange={handleChange}
                  rows={4}
                  style={styles.textarea}
                  placeholder="e.g. house with a yard, apartment, do you have other pets…"
                />
              </Field>

              <Field label="Describe your experience with pets">
                <textarea
                  name="petExperience"
                  value={formData.petExperience}
                  onChange={handleChange}
                  rows={4}
                  style={styles.textarea}
                  placeholder="Have you owned pets before? Any relevant experience…"
                />
              </Field>

              {submitError && <p style={styles.errorText}>{submitError}</p>}

              <button type="submit" disabled={submitting} style={styles.submitButton}>
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {submitted && (
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Request Sent! 🎉</h2>
            <p style={styles.successText}>
              Your adoption request has been submitted. Redirecting you back to the pet's page…
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Small layout helper, consistent with PetForm.tsx
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#444" }}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" },
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
  layout: {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  petSummary: {
    flex: "0 0 260px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    overflow: "hidden",
    textAlign: "center",
    paddingBottom: "1.25rem",
  },
  petImage: { width: "100%", height: "200px", objectFit: "cover", display: "block" },
  petName: { margin: "1rem 0 0.25rem", fontSize: "1.3rem", color: "#222" },
  petMeta: { margin: 0, color: "#666", fontSize: "0.9rem", textTransform: "capitalize" },
  form: {
    flex: "1 1 420px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  formTitle: { margin: 0, fontSize: "1.4rem", color: "#222" },
  formSubtitle: { margin: "0.25rem 0 0.5rem", color: "#666", fontSize: "0.9rem" },
  textarea: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  submitButton: {
    padding: "0.75rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: "0.5rem",
  },
  successBox: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: "2.5rem",
    textAlign: "center",
    maxWidth: "500px",
    margin: "2rem auto",
  },
  successTitle: { margin: 0, fontSize: "1.5rem", color: "#2e7d32" },
  successText: { marginTop: "0.75rem", color: "#555" },
};
