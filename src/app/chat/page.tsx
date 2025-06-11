"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all chat sessions for user
  useEffect(() => {
    fetch("/api/chat/all-chats")
      .then(res => res.json())
      .then(data => setChats(data.chats || []));
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    fetch(`/api/chat?chatId=${selectedChat}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));
  }, [selectedChat]);

  // Send a message
  const sendMessage = async () => {
    if (!input) return;
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: input }],
        provider: "openai", // or "claude", "gemini"
        chatId: selectedChat,
      }),
    });
    const data = await res.json();
    setInput("");
    setSelectedChat(data.chatId);
    // Refetch messages
    fetch(`/api/chat?chatId=${data.chatId}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Chat list */}
      <div style={{ width: 250, borderRight: "1px solid #ccc", padding: 16 }}>
        <h3>Chats</h3>
        <ul>
          {chats.map(chat => (
            <li key={chat.id}>
              <button onClick={() => setSelectedChat(chat.id)}>
                {chat.title || "Untitled"}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => setSelectedChat(null)}>+ New Chat</button>
      </div>
      {/* Chat window */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ margin: "8px 0" }}>
              <b>{msg.role}:</b> {msg.content}
            </div>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, marginRight: 8 }}
            disabled={loading}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} disabled={loading || !input}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}