import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, Inbox, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function RequestsList() {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState([]);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("dismissedNotifications");
    if (stored) setDismissedIds(JSON.parse(stored));
    fetchAcceptedRequests();
  }, []);

  const fetchAcceptedRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getAcceptedRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const all = res.data.data || [];
      const stored = localStorage.getItem("dismissedNotifications");
      const dismissed = stored ? JSON.parse(stored) : [];
      setAcceptedRequests(all.filter((r) => !dismissed.includes(r._id)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDiscard = (notificationId) => {
    setAcceptedRequests((prev) => prev.filter((r) => r._id !== notificationId));
    const updated = [...dismissedIds, notificationId];
    setDismissedIds(updated);
    localStorage.setItem("dismissedNotifications", JSON.stringify(updated));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
          <Users className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Connection Notifications</h3>
          <p className="text-xs text-white/30">
            {acceptedRequests.length} notification{acceptedRequests.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
        </div>
      ) : acceptedRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl shadow-lg border border-dashed border-white/20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Inbox className="h-6 w-6 text-white/25" />
          </div>
          <p className="text-sm font-semibold text-white/50">No notifications</p>
          <p className="text-xs text-white/25 mt-1">New connection updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptedRequests.map((req) => (
            <div
              key={req._id}
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-4 hover:border-white/15 hover:bg-white/5 transition-colors"
            >
              {/* Avatar initials */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sm font-bold text-sky-400">
                {(req.requesterId?.name || "U")[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{req.requesterId?.name || "Unknown User"}</p>
                <p className="text-xs text-white/30 truncate">{req.requesterId?.email || ""}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-500/8 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-400">Connection accepted</span>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => handleDiscard(req._id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/30 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}