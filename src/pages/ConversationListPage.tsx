import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchChatsForUser, fetchChatsForProtector } from "../services/chatService";
import { fetchPetById } from "../services/petService";
import { fetchUserProfile } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import type { Chat } from "../types";
import Navbar from "../components/NavBar";

interface ConversationRow {
  chat: Chat;
  petName: string;
  otherParticipantName: string;
}

export default function ConversationListPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    async function loadConversations() {
      try {
        const chats =
          userProfile!.role === "protector"
            ? await fetchChatsForProtector(userProfile!.uid)
            : await fetchChatsForUser(userProfile!.uid);

        const enrichedRows = await Promise.all(
          chats.map(async (chat) => {
            const pet = await fetchPetById(chat.petId);

            // For users, the other participant is the protector.
            // For protectors, it's the user who opened the chat.
            const otherUid =
              userProfile!.role === "user" ? chat.protectorId : chat.userId;
            const otherProfile = await fetchUserProfile(otherUid);

            return {
              chat,
              petName: pet?.name ?? "Deleted listing",
              otherParticipantName: otherProfile?.name ?? "Unknown user",
            };
          })
        );

        enrichedRows.sort(
          (a, b) => b.chat.lastMessageAt.toMillis() - a.chat.lastMessageAt.toMillis()
        );

        setRows(enrichedRows);
      } catch {
        setError("Failed to load your conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [userProfile]);

  function openChat(chat: Chat) {
    if (userProfile?.role === "protector") {
      // Protectors navigate by chat ID — avoids triggering findOrCreateChat
      navigate(`/chats/${chat.id}`);
    } else {
      // Users navigate by pet ID — consistent with the "Chat with Protector" button
      navigate(`/pets/${chat.petId}/chat`);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.title}>My Conversations</h1>
        <p style={styles.subtitle}>
          {userProfile?.role === "protector"
            ? "Messages from people interested in your pets."
            : "Your conversations with protectors."}
        </p>

        {loading && <p style={styles.status}>Loading…</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && rows.length === 0 && (
          <p style={styles.status}>No conversations yet.</p>
        )}

        {!loading && !error && rows.length > 0 && (
          <div style={styles.list}>
            {rows.map(({ chat, petName, otherParticipantName }) => (
              <div key={chat.id} onClick={() => openChat(chat)} style={styles.card}>
                <div>
                  <h2 style={styles.participantName}>{otherParticipantName}</h2>
                  <p style={styles.petLabel}>About: {petName}</p>
                </div>
                <span style={styles.date}>
                  {chat.lastMessageAt?.toDate
                    ? chat.lastMessageAt.toDate().toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  main: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" },
  title: { margin: 0, fontSize: "1.6rem", color: "#222" },
  subtitle: { margin: "0.25rem 0 1.5rem", color: "#666", fontSize: "0.9rem" },
  status: { textAlign: "center", color: "#777", marginTop: "2.5rem" },
  errorText: { textAlign: "center", color: "#c62828", marginTop: "2.5rem" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
    padding: "1.1rem 1.4rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    cursor: "pointer",
    flexWrap: "wrap",
  },
  participantName: { margin: 0, fontSize: "1.05rem", color: "#222" },
  petLabel: { margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#888" },
  date: { fontSize: "0.82rem", color: "#999", whiteSpace: "nowrap" },
};
