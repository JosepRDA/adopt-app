import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "protector" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  size: "small" | "medium" | "large";
  age: number;
  description: string;
  imageUrl: string;
  available: boolean;
  protectorId: string;
}

export type AdoptionRequestStatus = "pending" | "approved" | "rejected";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  applicantId: string;
  applicantName: string;
  ownerId: string;
  motivation: string;
  housingDescription: string;
  petExperience: string;
  status: AdoptionRequestStatus;
  createdAt: Timestamp; // Firestore Timestamp — see note in adoptionService.ts
}

export type ReportReason =
  | "Suspected animal abuse"
  | "Fake listing"
  | "Spam or bot listing"
  | "Incorrect information"
  | "Other";

export type ReportStatus = "open" | "resolved" | "dismissed";

export interface Report {
  id: string;
  petId: string;
  petName: string;
  reporterId: string;
  reporterName: string;
  ownerId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Timestamp;
}

export interface Chat {
  id: string;
  petId: string;
  userId: string;
  protectorId: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
