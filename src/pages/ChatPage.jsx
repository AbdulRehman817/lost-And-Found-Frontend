import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { io } from "socket.io-client";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { Header } from "../components/Header";

export default function ChatPage() {
  const { getToken } = useAuth();
  const [meId, setMeId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const authAxios = async () => {
    const token = await getToken();
    return axios.create({
      baseURL: "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await authAxios();
        const meRes = await api.get("/api/v1/chat/me");
        const my = meRes.data.user || meRes.data;
        const myId = my._id || my.userId || my.id;
        if (!myId) throw new Error("Missing my ID");
        if (!mounted) return;
        setMeId(myId);

        socketRef.current = io("https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app", {
          query: { userId: myId },
        });
        socketRef.current.on("connect", () => socketRef.current.emit("join", myId));
        socketRef.current.on("newMessage", (m) => {
          setMsgs((prev) => [...prev, m]);
          if (selected && (m.senderId === selected._id || m.receiverId === selected._id)) scrollToBottom();
        });
        socketRef.current.on("user-status", ({ userId, isOnline }) => {
          setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isOnline } : u));
          setSelected((prev) => prev && prev._id === userId ? { ...prev, isOnline } : prev);
        });
        socketRef.current.on("typing", ({ from }) => {
          setTypingUserId(from);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 2000);
        });
        socketRef.current.on("stop-typing", () => setTypingUserId(null));

        await loadUsers(api);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const loadUsers = async (apiClient) => {
    try {
      const api = apiClient || (await authAxios());
      const res = await api.get("/api/v1/chat/connected-users");
      const list = res.data.connectedUsers || res.data;
      setUsers(list.map((u) => ({ ...u, _id: u._id.toString() })));
    } catch (err) { console.error(err); }
  };

  const openChat = async (user) => {
    setSelected(user);
    setMsgs([]);
    setLoadingMessages(true);
    const api = await authAxios();
    const res = await api.get(`/api/v1/chat/messages/${user._id}`);
    setMsgs(res.data.allMessages || res.data || []);
    setLoadingMessages(false);
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!text.trim() || !selected || !meId) return;
    const content = text.trim();
    setMsgs((p) => [...p, { message: content, senderId: meId, createdAt: new Date() }]);
    setText("");
    scrollToBottom();
    socketRef.current.emit("stop-typing", { to: selected._id });
    try {
      const api = await authAxios();
      await api.post("/api/v1/chat/send", { receiverId: selected._id, message: content });
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a1628]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a1628] text-white overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className={`flex flex-col border-r border-white/8 bg-[#0d1b2e] ${selected ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 shrink-0`}>
         
          <div className="flex-1 overflow-y-auto">
            {users.length ? (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => openChat(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/5 transition-colors hover:bg-white/5 ${
                    selected?._id === u._id ? "bg-sky-500/10 border-l-2 border-l-sky-500" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={u.profileImage || "/default-avatar.png"}
                      alt={u.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1b2e]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${selected?._id === u._id ? "text-white" : "text-white/80"}`}>
                      {u.name}
                    </p>
                    <p className={`text-xs ${u.isOnline ? "text-emerald-400" : "text-white/25"}`}>
                      {u.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <MessageCircle className="h-5 w-5 text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/60">No conversations yet</p>
                <p className="text-xs text-white/25 mt-1">Connect with item posters to start chatting</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className={`flex flex-1 flex-col ${selected ? "flex" : "hidden md:flex"} min-w-0`}>
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-white/8 bg-[#0d1b2e] px-4 py-3 shrink-0">
                <button
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                  onClick={() => setSelected(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="relative">
                  <img
                    src={selected.profileImage || "/default-avatar.png"}
                    alt={selected.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  {selected.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1b2e]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selected.name}</p>
                  <p className={`text-xs flex items-center gap-1 ${selected.isOnline ? "text-emerald-400" : "text-white/30"}`}>
                    {selected.isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {selected.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
                style={{ background: "#0a1628" }}
              >
                {loadingMessages ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
                  </div>
                ) : msgs.length ? (
                  msgs.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.senderId === meId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.senderId === meId
                            ? "bg-sky-500 text-white rounded-tr-sm"
                            : "bg-[#0d1b2e] border border-white/8 text-white/85 rounded-tl-sm"
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className={`text-[10px] mt-1 text-right ${m.senderId === meId ? "text-sky-100/60" : "text-white/25"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-white/25">No messages yet. Say hello!</p>
                  </div>
                )}
              </div>

              {/* Typing indicator */}
              {typingUserId === selected._id && (
                <div className="px-5 py-2 text-xs text-white/30 italic" style={{ background: "#0a1628" }}>
                  {selected.name} is typing...
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 border-t border-white/8 bg-[#0d1b2e] px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <MessageCircle className="h-7 w-7 text-white/25" />
              </div>
              <p className="font-semibold text-white">Your Messages</p>
              <p className="text-sm text-white/30">Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}