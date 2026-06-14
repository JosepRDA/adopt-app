import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Pet } from "../types";

const PETS_COLLECTION = "pets";

// Fetch all pets — filtering happens client-side in the hook
export async function fetchAllPets(): Promise<Pet[]> {
  const snapshot = await getDocs(collection(db, PETS_COLLECTION));
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Pet[];
}

// Fetch a single pet by ID
export async function fetchPetById(petId: string): Promise<Pet | null> {
  const snapshot = await getDoc(doc(db, PETS_COLLECTION, petId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Pet;
}

// Create a new pet listing — protector only
export async function createPet(petData: Omit<Pet, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, PETS_COLLECTION), petData);
  return docRef.id;
}

// Update an existing pet — protector only
export async function updatePet(
  petId: string,
  petData: Partial<Omit<Pet, "id">>
): Promise<void> {
  await updateDoc(doc(db, PETS_COLLECTION, petId), petData);
}

// Delete a pet listing — protector only
export async function deletePet(petId: string): Promise<void> {
  await deleteDoc(doc(db, PETS_COLLECTION, petId));
}
