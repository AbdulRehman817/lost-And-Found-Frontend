// ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { io } from "socket.io-client";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
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

        socketRef.current = io(
          "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app",
          {
            query: { userId: myId },
          }
        );

        socketRef.current.on("connect", () => {
          socketRef.current.emit("join", myId);
        });

        socketRef.current.on("newMessage", (m) => {
          setMsgs((prev) => [...prev, m]);
          if (
            selected &&
            (m.senderId === selected._id || m.receiverId === selected._id)
          ) {
            scrollToBottom();
          }
        });

        socketRef.current.on("user-status", ({ userId, isOnline }) => {
          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, isOnline } : u))
          );
          // Fix: Ensure the real-time status updates the currently selected user as well
          setSelected((prev) => 
            prev && prev._id === userId ? { ...prev, isOnline } : prev
          );
        });

        socketRef.current.on("typing", ({ from }) => {
          setTypingUserId(from);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(
            () => setTypingUserId(null),
            2000
          );
        });

        socketRef.current.on("stop-typing", () => setTypingUserId(null));

        await loadUsers(api);
        setLoading(false);
      } catch (err) {
        console.error("init error", err);
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
    } catch (err) {
      console.error("loadUsers error", err);
    }
  };

  const openChat = async (user) => {
    setSelected(user);
    setMsgs([]);
    setLoadingMessages(true);
    const api = await authAxios();
    const res = await api.get(`/api/v1/chat/messages/${user._id}`);
    const all = res.data.allMessages || res.data;
    setMsgs(all || []);
    setLoadingMessages(false);
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!text.trim() || !selected || !meId) return;
    const content = text.trim();
    const to = selected._id;

    setMsgs((p) => [
      ...p,
      { message: content, senderId: meId, createdAt: new Date() },
    ]);
    setText("");
    scrollToBottom();
    socketRef.current.emit("stop-typing", { to });

    try {
      const api = await authAxios();
      await api.post("/api/v1/chat/send", { receiverId: to, message: content });
    } catch (err) {
      console.error("sendMessage error", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {!loading ? (
        <div className="flex flex-col h-screen w-full">
          <Header />
          <div className="flex flex-1 overflow-hidden bg-background text-foreground">
            {/* Sidebar */}
            <div
              className={`md:flex flex-col w-full md:w-80 lg:w-96 bg-card border-r border-border ${
                selected ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-4 font-bold border-b border-border bg-muted/30 font-headline text-lg">Messages</div>

              {users.length ? (
                users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => openChat(u)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-border/50 ${
                      selected?._id === u._id ? "bg-muted" : ""
                    }`}
                  >
                    <img
                      src={u.profileImage || "/default-avatar.png"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="font-medium">{u.name}</div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-muted-foreground text-sm">No connected users</p>
              )}
            </div>

            {/* Chat area */}
            <div
              className={`flex-1 flex flex-col ${
                selected ? "flex" : "hidden md:flex"
              }`}
            >
              {selected ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
                    <button
                      className="md:hidden"
                      onClick={() => setSelected(null)}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <img
                      src={selected.profileImage || "/default-avatar.png"}
                      alt={selected.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold font-headline">{selected.name}</div>
                      <div
                        className={`text-xs font-medium ${
                          selected.isOnline ? "text-green-500 flex items-center gap-1" : "text-muted-foreground"
                        }`}
                      >
                        {selected.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        {selected.isOnline ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    ref={scrollRef}
                    className="flex-1 p-4 overflow-x-hidden overflow-y-auto flex flex-col gap-4 bg-secondary/10"
                  >
                    {loadingMessages ? (
                      <div className="flex items-center justify-center flex-1">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : msgs.length ? (
                      msgs.map((m, i) => (
                        <div
                          key={i}
                          className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                            m.senderId === meId
                              ? "self-end bg-primary text-primary-foreground rounded-tr-sm"
                              : "self-start bg-card border border-border text-foreground rounded-tl-sm"
                          }`}
                        >
                          <div className="leading-relaxed text-sm">{m.message}</div>
                          <div className={`text-[10px] text-right mt-1.5 ${m.senderId === meId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-center text-sm my-auto">
                        No messages yet
                      </div>
                    )}
                  </div>

                  {/* Typing */}
                  {typingUserId === selected._id && (
                    <div className="px-6 py-2 bg-secondary/10 text-xs text-muted-foreground italic truncate">
                      {selected.name} is typing...
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 bg-card border-t border-border flex gap-3 items-center shrink-0">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-full bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-colors shadow-sm text-sm"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center flex-1 text-muted-foreground bg-secondary/5">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-lg text-foreground">Your Messages</p>
                  <p className="text-sm">Select a user to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen w-full bg-background">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      )}
    </>
  );
}
