import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { X, Users, Inbox } from "lucide-react";
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
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
    fetchAcceptedRequests();
  }, []);

  // ✅ Fetch accepted requests
  const fetchAcceptedRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getAcceptedRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allRequests = res.data.data || [];

      // Filter out dismissed notifications
      const stored = localStorage.getItem("dismissedNotifications");
      const dismissed = stored ? JSON.parse(stored) : [];
      const filtered = allRequests.filter(
        (req) => !dismissed.includes(req._id)
      );

      setAcceptedRequests(filtered);
    } catch (error) {
      console.error("❌ Error fetching accepted requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Discard notification (saves to localStorage)
  const handleDiscard = (notificationId) => {
    // Update state
    setAcceptedRequests((prevRequests) =>
      prevRequests.filter((req) => req._id !== notificationId)
    );

    // Save to localStorage
    const newDismissedIds = [...dismissedIds, notificationId];
    setDismissedIds(newDismissedIds);
    localStorage.setItem(
      "dismissedNotifications",
      JSON.stringify(newDismissedIds)
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-card border shadow-sm">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Connection Notifications</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {acceptedRequests.length} notification
              {acceptedRequests.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Connections List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : acceptedRequests.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-card">
          <div className="inline-flex p-4 bg-muted rounded-full mb-4">
            <Inbox className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground text-sm">
            You're all caught up! New connection notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptedRequests.map((req) => (
            <div
              key={req._id}
              className="bg-card border rounded-xl p-4 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {(req.requesterId?.name || "U")[0].toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {req.requesterId?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {req.requesterId?.email || "No email"}
                      </p>
                    </div>

                    {/* Discard Button */}
                    <Button
                      onClick={() => handleDiscard(req._id)}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-full"
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Connection accepted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
