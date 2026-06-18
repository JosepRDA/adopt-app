import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Chat, ChatMessage } from "../types";

const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";

async function findExistingChat(petId: string, userId: string): Promise<Chat | null> {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where("petId", "==", petId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const document = snapshot.docs[0];
  return { id: document.id, ...document.data() } as Chat;
}

async function createChat(petId: string, userId: string, protectorId: string): Promise<Chat> {
  const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
    petId,
    userId,
    protectorId,
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
  return { id: docRef.id } as unknown as Chat;
  // ChatPage immediately re-reads via fetchChatById so the sentinel
  // timestamps are resolved before any rendering happens
}

// Used only by users — protectors never create chats
export async function findOrCreateChat(
  petId: string,
  userId: string,
  protectorId: string
): Promise<Chat> {
  const existing = await findExistingChat(petId, userId);
  if (existing) return existing;
  return createChat(petId, userId, protectorId);
}

// Used by protectors opening a chat from their conversation list
export async function fetchChatById(chatId: string): Promise<Chat | null> {
  const snapshot = await getDoc(doc(db, CHATS_COLLECTION, chatId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Chat;
}

export async function fetchChatsForUser(userId: string): Promise<Chat[]> {
  const q = query(collection(db, CHATS_COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Chat[];
}

export async function fetchChatsForProtector(protectorId: string): Promise<Chat[]> {
  const q = query(collection(db, CHATS_COLLECTION), where("protectorId", "==", protectorId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Chat[];
}

export function subscribeToMessages(
  chatId: string,
  onMessages: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ChatMessage[];
    onMessages(messages);
  });
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message cannot be empty.");

  await addDoc(collection(db, MESSAGES_COLLECTION), {
    chatId,
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
    lastMessageAt: serverTimestamp(),
  });
}
