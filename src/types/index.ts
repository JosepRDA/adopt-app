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
  age: number;
  description: string;
  protectorId: string;
  status: "available" | "adopted";
}
