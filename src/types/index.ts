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
