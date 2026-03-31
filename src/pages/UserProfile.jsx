import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Lock, Mail, Phone, FileText, Loader2, UserPlus, MessageCircle, X } from "lucide-react";
import { Header } from "../components/Header";

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [amRequester, setAmRequester] = useState(false);
  const [connectionCounts, setConnectionCounts] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchConnectionCounts = async () => {
      if (!userId) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connection-counts/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConnectionCounts(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchConnectionCounts();
  }, [userId]);

  const fetchConnectionStatus = async (userMongoId) => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/status/${userMongoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsConnected(res.data.isConnected);
      setIsPending(res.data.isPending);
      setAmRequester(res.data.amRequester);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await axios.get(
          `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/profile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
        await fetchConnectionStatus(res.data.user._id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?._id || !isConnected) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(res.data.posts || []);
      } catch (e) { console.error(e); }
    };
    fetchPosts();
  }, [user?._id, isConnected]);

  const handleSendRequest = async (msg = "") => {
    try {
      const token = await getToken();
      await axios.post(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/sendRequest",
        { receiverId: user._id, message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPending(true); setAmRequester(true);
      setShowModal(false); setMessage("");
    } catch (e) { console.error(e); }
  };

  const handleCancelRequest = async () => {
    try {
      const token = await getToken();
      await axios.post(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/cancelRequest",
        { receiverId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPending(false); setAmRequester(false);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user?._id || !isPending) return;
    const interval = setInterval(() => fetchConnectionStatus(user._id), 3000);
    return () => clearInterval(interval);
  }, [user?._id, isPending]);

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-[#0a1628]">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex min-h-screen flex-col bg-[#0a1628]">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-white/40">User not found.</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628] text-white overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 md:py-14 space-y-5">

          {/* Profile card */}
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            {/* Banner */}
            <div className="h-28 bg-sky-950/60 border-b border-white/8" />

            <div className="px-6 pb-6">
              {/* Avatar overlapping banner */}
              <div className="flex items-end justify-between -mt-10 mb-5">
                <img
                  src={user.profileImage || "https://via.placeholder.com/150"}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#0a1628] border border-white/10"
                />

                {/* Action button */}
                <div className="flex gap-2 mt-2">
                  {isConnected ? (
                    <button
                      onClick={() => navigate(`/chat/${user._id}`)}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" /> Message
                    </button>
                  ) : isPending && amRequester ? (
                    <button
                      onClick={handleCancelRequest}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" /> Cancel Request
                    </button>
                  ) : isPending && !amRequester ? (
                    <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/40 cursor-not-allowed">
                      Request Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
                    >
                      <UserPlus className="h-4 w-4" /> Connect
                    </button>
                  )}
                </div>
              </div>

              <h1 className="text-xl font-bold text-white mb-0.5">{user.name}</h1>
              <p className="text-sm text-white/30">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Connections", value: connectionCounts?.acceptedCount || 0 },
              { label: "Posts", value: isConnected ? posts.length : "🔒" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
                <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-xs font-medium text-white/30 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">About</h2>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Contact — connected only */}
          {isConnected && (user.phone || user.email) && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Contact</h2>
              <div className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/15">
                      <Mail className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Email</p>
                      <p className="text-sm text-white/70">{user.email}</p>
                    </div>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/15">
                      <Phone className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Phone</p>
                      <p className="text-sm text-white/70">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-5">Posts</h2>

            {isConnected ? (
              posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/feed/${post._id}`}
                      className="flex gap-4 rounded-xl border border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5 p-4 transition-colors"
                    >
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="h-16 w-16 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            post.type === "lost"
                              ? "bg-red-500/10 text-red-400 border border-red-500/15"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                          }`}>
                            {post.type}
                          </span>
                          <span className="rounded px-2 py-0.5 text-[10px] font-medium border border-white/8 bg-white/5 text-white/40">
                            {post.category}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                        <p className="text-xs text-white/35 mt-0.5 line-clamp-2 leading-relaxed">{post.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/30 text-center py-8">This user hasn't posted anything yet.</p>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Lock className="h-6 w-6 text-white/25" />
                </div>
                <p className="font-semibold text-white/60 mb-1">Posts are Private</p>
                <p className="text-sm text-white/30 mb-5 max-w-xs">
                  Connect with {user.name} to view their posts and activity.
                </p>
                {isPending && amRequester ? (
                  <span className="text-xs text-amber-400/70">Connection request pending...</span>
                ) : isPending && !amRequester ? (
                  <span className="text-xs text-amber-400/70">{user.name} sent you a request. Check your notifications!</span>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  >
                    <UserPlus className="h-4 w-4" /> Send Connection Request
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Connect modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1b2e] p-7 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Connect with {user.name}</h2>
            <p className="text-sm text-white/40 mb-5">Add an optional message to introduce yourself.</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)"
              maxLength={500}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors min-h-[100px] resize-none mb-2"
            />
            <p className="text-xs text-white/20 mb-5 text-right">{message.length}/500</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setMessage(""); }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendRequest(message)}
                className="flex-1 rounded-lg bg-sky-500 hover:bg-sky-400 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {message ? "Send with Message" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}