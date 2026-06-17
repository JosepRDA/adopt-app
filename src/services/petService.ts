import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Pet } from "../types";

const PETS_COLLECTION = "pets";
const ADOPTION_REQUESTS_COLLECTION = "adoptionRequests";

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

// Delete a pet listing — protector only (deleting their own pet, no pending requests expected
// in the normal flow, but this stays a plain delete to match existing behavior)
export async function deletePet(petId: string): Promise<void> {
  await deleteDoc(doc(db, PETS_COLLECTION, petId));
}

// Admin-only: remove a listing that has been reported.
// Deletes the pet AND rejects any still-pending adoption requests for it,
// so no request is left "pending" for a pet that no longer exists.
export async function removeReportedPet(petId: string): Promise<void> {
  const batch = writeBatch(db);

  // 1. Delete the pet itself
  batch.delete(doc(db, PETS_COLLECTION, petId));

  // 2. Find any pending adoption requests for this pet and reject them
  const pendingRequestsQuery = query(
    collection(db, ADOPTION_REQUESTS_COLLECTION),
    where("petId", "==", petId),
    where("status", "==", "pending")
  );
  const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery);

  pendingRequestsSnapshot.docs.forEach((document) => {
    batch.update(doc(db, ADOPTION_REQUESTS_COLLECTION, document.id), {
      status: "rejected",
    });
  });

  await batch.commit();
}
