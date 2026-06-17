//
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase";
// import type { AdoptionRequest } from "../types";
//
// const ADOPTION_REQUESTS_COLLECTION = "adoptionRequests";
//
// // Shape of the data the form collects — everything except
// // fields we generate ourselves (id, status, createdAt)
// export type AdoptionRequestInput = Omit<
//   AdoptionRequest,
//   "id" | "status" | "createdAt"
// >;
//
// export async function createAdoptionRequest(
//   requestData: AdoptionRequestInput
// ): Promise<string> {
//   const docRef = await addDoc(collection(db, ADOPTION_REQUESTS_COLLECTION), {
//     ...requestData,
//     status: "pending",
//     createdAt: serverTimestamp(),
//   });
//   return docRef.id;
// }

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { AdoptionRequest } from "../types";

const ADOPTION_REQUESTS_COLLECTION = "adoptionRequests";
const PETS_COLLECTION = "pets";

// Shape of the data the form collects — everything except
// fields we generate ourselves (id, status, createdAt)
export type AdoptionRequestInput = Omit<
  AdoptionRequest,
  "id" | "status" | "createdAt"
>;

export async function createAdoptionRequest(
  requestData: AdoptionRequestInput
): Promise<string> {
  const docRef = await addDoc(collection(db, ADOPTION_REQUESTS_COLLECTION), {
    ...requestData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// All requests submitted by a given user — used by MyRequestsPage
export async function fetchRequestsByApplicant(
  applicantId: string
): Promise<AdoptionRequest[]> {
  const q = query(
    collection(db, ADOPTION_REQUESTS_COLLECTION),
    where("applicantId", "==", applicantId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as AdoptionRequest[];
}

// All requests for pets owned by a given protector — used by ManageRequestsPage
export async function fetchRequestsByOwner(
  ownerId: string
): Promise<AdoptionRequest[]> {
  const q = query(
    collection(db, ADOPTION_REQUESTS_COLLECTION),
    where("ownerId", "==", ownerId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as AdoptionRequest[];
}

// Approve a request: mark it approved, mark the pet unavailable,
// and reject every other pending request for that same pet.
// All three writes happen in one batch so they succeed or fail together.
export async function approveAdoptionRequest(
  request: AdoptionRequest
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Approve this request
  const requestRef = doc(db, ADOPTION_REQUESTS_COLLECTION, request.id);
  batch.update(requestRef, { status: "approved" });

  // 2. Mark the pet as no longer available
  const petRef = doc(db, PETS_COLLECTION, request.petId);
  batch.update(petRef, { available: false });

  // 3. Find every other pending request for this same pet and reject them
  const otherPendingQuery = query(
    collection(db, ADOPTION_REQUESTS_COLLECTION),
    where("petId", "==", request.petId),
    where("status", "==", "pending")
  );
  const otherPendingSnapshot = await getDocs(otherPendingQuery);

  otherPendingSnapshot.docs.forEach((document) => {
    if (document.id === request.id) return; // Skip the one we're approving
    batch.update(doc(db, ADOPTION_REQUESTS_COLLECTION, document.id), {
      status: "rejected",
    });
  });

  await batch.commit();
}

// Reject a single request — does not touch the pet or any other request
export async function rejectAdoptionRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, ADOPTION_REQUESTS_COLLECTION, requestId);
  await writeBatch(db).update(requestRef, { status: "rejected" }).commit();
}
