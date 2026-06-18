import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPetById } from "../services/petService";
import {
  findOrCreateChat,
  fetchChatById,
  subscribeToMessages,
  sendMessage,
} from "../services/chatService";
import { fetchUserProfile } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import type { Chat, ChatMessage, Pet, UserProfile } from "../types";
import Navbar from "../components/NavBar";

export default function ChatPage() {
  // The route is either /pets/:petId/chat (user entry) or /chats/:chatId (protector entry)
  const { petId, chatId } = useParams<{ petId?: string; chatId?: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Step 1: resolve the chat document, then the pet, then the other participant's profile
  useEffect(() => {
    if (!userProfile) return;

    async function setupChat() {
      try {
        let resolvedChat: Chat | null = null;

        if (userProfile!.role === "user" && petId) {
          // Users: fetch the pet first to get protectorId, then find-or-create the chat
          const petData = await fetchPetById(petId);
          if (!petData) {
            setError("Pet not found.");
            return;
          }
          setPet(petData);
          resolvedChat = await findOrCreateChat(petData.id, userProfile!.uid, petData.protectorId);

        } else if (userProfile!.role === "protector" && chatId) {
          // Protectors: the chat already exists — they opened it from their list
          resolvedChat = await fetchChatById(chatId);
          if (!resolvedChat) {
            setError("Conversation not found.");
            return;
          }
          const petData = await fetchPetById(resolvedChat.petId);
          setPet(petData);

        } else {
          setError("Invalid navigation. Please go back and try again.");
          return;
        }

        if (!resolvedChat) {
          setError("Could not open this conversation.");
          return;
        }
        setChat(resolvedChat);

        // Resolve the other participant's name for the chat header.
        // For a user, the other participant is the protector (resolvedChat.protectorId).
        // For a protector, it's the user who started the chat (resolvedChat.userId).
        const otherUid =
          userProfile!.role === "user"
            ? resolvedChat.protectorId
            : resolvedChat.userId;

        const otherProfile = await fetchUserProfile(otherUid);
        setOtherParticipant(otherProfile);

      } catch {
        setError("Failed to open this conversation. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    setupChat();
  }, [petId, chatId, userProfile]);

  // Step 2: subscribe to messages in real time once we have the chat ID
  useEffect(() => {
    if (!chat) return;
    const unsubscribe = subscribeToMessages(chat.id, setMessages);
    return () => unsubscribe();
  }, [chat]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chat || !userProfile || !messageText.trim()) return;

    setSending(true);
    try {
      await sendMessage(chat.id, userProfile.uid, messageText);
      setMessageText("");
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <button onClick={() => navigate("/chats")} style={styles.backButton}>
          ← Back to conversations
        </button>

        {loading && <p style={styles.status}>Loading conversation…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {chat && !error && (
          <div style={styles.chatCard}>
            <div style={styles.header}>
              {/* Show the other person's name, falling back gracefully while loading */}
              <h1 style={styles.headerTitle}>
                {otherParticipant ? otherParticipant.name : "Loading…"}
              </h1>
              {pet && (
                <p style={styles.headerSubtitle}>About: {pet.name}</p>
              )}
            </div>

            <div style={styles.messageList}>
              {messages.length === 0 && (
                <p style={styles.emptyState}>No messages yet. Say hello!</p>
              )}

              {messages.map((message) => {
                const isOwn = message.senderId === userProfile?.uid;
                return (
                  <div
                    key={message.id}
                    style={{
                      ...styles.bubbleRow,
                      justifyContent: isOwn ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        ...(isOwn ? styles.ownBubble : styles.otherBubble),
                      }}
                    >
                      <p style={styles.bubbleText}>{message.text}</p>
                      <span style={styles.bubbleTime}>
                        {message.createdAt?.toDate
                          ? message.createdAt.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Sending…"}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={styles.inputRow}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message…"
                style={styles.input}
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                style={styles.sendButton}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" },
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
  errorText: { textAlign: "center", color: "#c62828", marginTop: "3rem" },
  chatCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    display: "flex",
    flexDirection: "column",
    height: "70vh",
    overflow: "hidden",
  },
  header: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #eee",
  },
  headerTitle: { margin: 0, fontSize: "1.2rem", color: "#222" },
  headerSubtitle: { margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#888" },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  emptyState: { textAlign: "center", color: "#999", marginTop: "2rem" },
  bubbleRow: { display: "flex", width: "100%" },
  bubble: {
    maxWidth: "70%",
    padding: "0.6rem 0.9rem",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  ownBubble: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  otherBubble: {
    backgroundColor: "#f0f0f0",
    color: "#222",
    borderBottomLeftRadius: "4px",
  },
  bubbleText: { margin: 0, fontSize: "0.92rem", lineHeight: 1.4, wordBreak: "break-word" },
  bubbleTime: { fontSize: "0.68rem", opacity: 0.75, alignSelf: "flex-end" },
  inputRow: {
    display: "flex",
    gap: "0.6rem",
    padding: "1rem",
    borderTop: "1px solid #eee",
  },
  input: {
    flex: 1,
    padding: "0.65rem 0.9rem",
    border: "1px solid #ccc",
    borderRadius: "20px",
    fontSize: "0.92rem",
  },
  sendButton: {
    padding: "0.65rem 1.4rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
};
