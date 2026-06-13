import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfile, UserRole } from "../types";

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<void> {
  // 1. Create the user in Firebase Authentication
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // 2. Save the user profile in Firestore
  // We store role and name here because Firebase Auth doesn't support custom fields
  const userProfile: UserProfile = { uid, name, email, role };
  await setDoc(doc(db, "users", uid), userProfile);
}

export async function loginUser(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}
