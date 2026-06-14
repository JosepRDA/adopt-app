import { useState } from "react";
import type { Pet } from "../types";

// We omit id and protectorId because those are set by the service, not the form
export type PetFormData = Omit<Pet, "id" | "protectorId">;

interface PetFormProps {
  initialData?: Partial<PetFormData>;
  onSubmit: (data: PetFormData) => Promise<void>;
  submitLabel: string;
}

const EMPTY_FORM: PetFormData = {
  name: "",
  species: "",
  breed: "",
  size: "medium",
  age: 1,
  description: "",
  imageUrl: "",
  available: true,
};

export default function PetForm({ initialData, onSubmit, submitLabel }: PetFormProps) {
  const [formData, setFormData] = useState<PetFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "age"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <Field label="Pet Name">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="e.g. Buddy"
          />
        </Field>

        <Field label="Species">
          <input
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="e.g. Dog"
          />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Breed">
          <input
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="e.g. Golden Retriever"
          />
        </Field>

        <Field label="Age (years)">
          <input
            name="age"
            type="number"
            min={0}
            value={formData.age}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </Field>
      </div>

      <div style={styles.row}>
        <Field label="Size">
          <select name="size" value={formData.size} onChange={handleChange} style={styles.input}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>

        <Field label="Status">
          <select
            name="available"
            value={formData.available ? "true" : "false"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, available: e.target.value === "true" }))
            }
            style={styles.input}
          >
            <option value="true">Available</option>
            <option value="false">Adopted</option>
          </select>
        </Field>
      </div>

      <Field label="Image URL">
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          style={styles.input}
          placeholder="https://example.com/pet-photo.jpg"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          style={{ ...styles.input, resize: "vertical" }}
          placeholder="Tell potential adopters about this pet's personality…"
        />
      </Field>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.submitButton}>
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

// Tiny layout wrapper — keeps the form code readable
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#444" }}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  row: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  input: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  error: { color: "#c62828", fontSize: "0.85rem", margin: 0 },
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
};
