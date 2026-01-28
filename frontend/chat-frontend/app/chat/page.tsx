"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../lib/socket";
import { jwtDecode } from "jwt-decode";

type User = { _id: string; username: string };

type Message = {
  senderId: string;
  content: string;
  createdAt: string;
};

type Token = { id: string; username: string };

export default function ChatPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Token | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});

  /* AUTH + SOCKET INIT */
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      router.push("/login");
      return;
    }

    const decoded = jwtDecode<Token>(stored);
    setToken(stored);
    setCurrentUser(decoded);

    socket.auth = { token: stored };
    socket.connect();
    socket.emit("join", decoded.id);

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [router]);

  /* USERS + RECEIVE MESSAGE */
  useEffect(() => {
    if (!token || !currentUser) return;

    fetch("http://localhost:5000/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data =>
        setUsers(data.filter((u: User) => u._id !== currentUser.id))
      );

    const handleReceive = (m: Message) => {
      if (m.senderId === currentUser.id) return;

      if (selectedUser && m.senderId === selectedUser._id) {
        setMessages(prev => [...prev, m]);
      } else {
        setUnread(prev => ({
          ...prev,
          [m.senderId]: (prev[m.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [token, currentUser, selectedUser]);

  const openChat = async (user: User) => {
    setSelectedUser(user);
    setUnread(prev => ({ ...prev, [user._id]: 0 }));

    const res = await fetch(
      `http://localhost:5000/api/messages/${user._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages(await res.json());
  };

  const sendMessage = () => {
    if (!msg.trim() || !selectedUser || !currentUser) return;

    setMessages(prev => [
      ...prev,
      {
        senderId: currentUser.id,
        content: msg.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);

    socket.emit("private_message", {
      receiverId: selectedUser._id,
      message: {
        senderId: currentUser.id,
        content: msg.trim(),
      },
    });

    setMsg("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    router.push("/login");
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div className="h-screen flex bg-[#e5ddd5]">
      {/* SIDEBAR */}
      <div className="w-[30%] min-w-[280px] bg-white border-r flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between bg-[#f0f2f5]">
          <span className="text-sm font-medium">
            {currentUser?.username}
          </span>
          <button
            onClick={logout}
            className="text-xs text-gray-600 hover:text-red-500"
          >
            Logout
          </button>
        </div>

        <div className="p-2 bg-[#f0f2f5]">
          <input
            className="w-full rounded-md px-3 py-2 text-sm bg-white border outline-none"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              onClick={() => openChat(user)}
              className={`px-4 py-3 cursor-pointer border-b flex justify-between items-center
                ${
                  selectedUser?._id === user._id
                    ? "bg-[#e9edef]"
                    : "hover:bg-[#f5f6f6]"
                }`}
            >
              <span className="text-sm font-medium">{user.username}</span>

              {unread[user._id] > 0 && (
                <span className="bg-[#25d366] text-white text-xs px-2 py-0.5 rounded-full">
                  {unread[user._id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="w-[70%] flex flex-col">
        <div className="h-14 px-4 flex items-center bg-[#f0f2f5] border-b">
          <span className="text-sm font-medium">
            {selectedUser?.username || "Select a chat"}
          </span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-[#efeae2]">
          {messages.map((m, i) => {
            const isMe = m.senderId === currentUser?.id;
            const time = new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={i}
                className={`mb-1 flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 max-w-[65%] text-sm rounded-lg
                    ${
                      isMe
                        ? "bg-[#d9fdd3] rounded-tr-none"
                        : "bg-white rounded-tl-none"
                    }`}
                >
                  <div>{m.content}</div>
                  <div className="text-[10px] text-gray-500 text-right mt-1">
                    {time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedUser && (
          <div className="h-14 px-4 flex items-center gap-3 bg-[#f0f2f5]">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-full px-4 py-2 text-sm bg-white outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-[#00a884] text-white px-4 py-2 rounded-md text-sm"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}