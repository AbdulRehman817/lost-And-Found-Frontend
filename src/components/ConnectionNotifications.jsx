import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {
  Bell,
  CheckCircle,
  Clock,
  X,
  Check as CheckIcon,
  MessageSquare,
} from "lucide-react";

export default function ConnectionNotifications() {
  const { getToken } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedNotifications, setAcceptedNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    // Load dismissed IDs from localStorage
    const saved = localStorage.getItem("dismissedNotifications");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Filter out dismissed notifications
  const visibleAcceptedNotifications = acceptedNotifications.filter(
    (notif) => !dismissedIds.has(notif._id)
  );

  const allNotifications = [
    ...pendingRequests,
    ...visibleAcceptedNotifications,
  ];

  // Save dismissed IDs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "dismissedNotifications",
      JSON.stringify([...dismissedIds])
    );
  }, [dismissedIds]);

  // Initial fetch
  useEffect(() => {
    fetchAllPendingRequests();
    fetchAcceptedConnections();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchAllPendingRequests();
      fetchAcceptedConnections();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // Listen for custom refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchAllPendingRequests();
      fetchAcceptedConnections();
    };

    window.addEventListener("refresh-requests", handleRefresh);
    return () => window.removeEventListener("refresh-requests", handleRefresh);
  }, []);

  // Clean up old dismissed IDs (older than 7 days)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const saved = localStorage.getItem("dismissedNotifications");
      if (saved) {
        const ids = JSON.parse(saved);
        // You could add timestamp tracking here for more sophisticated cleanup
        // For now, we'll just clear all after 7 days
        const lastCleanup = localStorage.getItem("lastNotificationCleanup");
        if (!lastCleanup || Date.now() - parseInt(lastCleanup) > sevenDaysAgo) {
          localStorage.removeItem("dismissedNotifications");
          setDismissedIds(new Set());
          localStorage.setItem(
            "lastNotificationCleanup",
            Date.now().toString()
          );
        }
      }
    }, 24 * 60 * 60 * 1000); // Check once per day

    return () => clearInterval(cleanupInterval);
  }, []);

  const fetchAllPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getPendingRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(res.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching pending requests:", error);
    }
  };

  const fetchAcceptedConnections = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getMyConnections",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter connections where YOU were the requester and it's newly accepted (within 24 hours)
      const newlyAccepted = (res.data.data || []).filter(
        (conn) => conn.wasRequester && conn.isNewConnection
      );

      setAcceptedNotifications(newlyAccepted);
    } catch (error) {
      console.error("❌ Error fetching accepted connections:", error);
    }
  };

  // Accept a pending request
  const handleAcceptRequest = async (requesterId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = await getToken();
      await axios.post(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/acceptRequest",
        { requesterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending list immediately
      setPendingRequests((prev) =>
        prev.filter((req) => req.requesterId._id !== requesterId)
      );

      // Refresh to get updated data
      setTimeout(() => {
        fetchAllPendingRequests();
        fetchAcceptedConnections();
      }, 500);
    } catch (error) {
      console.error("❌ Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    }
  };

  // Reject a pending request
  const handleRejectRequest = async (requesterId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = await getToken();
      await axios.post(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/rejectRequest",
        { requesterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending list immediately
      setPendingRequests((prev) =>
        prev.filter((req) => req.requesterId._id !== requesterId)
      );
    } catch (error) {
      console.error("❌ Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    }
  };

  // Dismiss an accepted notification
  const handleDismissNotification = (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to dismissed set and persist to localStorage
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {allNotifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="absolute h-full w-full rounded-full bg-primary animate-ping opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-destructive" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 max-h-[500px] overflow-y-auto"
        align="end"
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <Badge variant="secondary">{allNotifications.length}</Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Pending Requests (People who sent you requests) */}
        {pendingRequests.map((req) => (
          <div
            key={`pending-${req._id}`}
            className="px-2 py-3 hover:bg-muted/50 rounded-md"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={req.requesterId?.profileImage} />
                <AvatarFallback>
                  {req.requesterId?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <p className="font-semibold text-sm">New Request</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">
                    {req.requesterId?.name}
                  </span>{" "}
                  wants to connect with you
                </p>

                {req.message && (
                  <p className="text-xs text-muted-foreground italic mb-2 border-l-2 border-muted pl-2">
                    "{req.message}"
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => handleAcceptRequest(req.requesterId._id, e)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleRejectRequest(req.requesterId._id, e)}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Accepted Notifications (People who accepted your requests) */}
        {visibleAcceptedNotifications.map((notif) => (
          <div
            key={`accepted-${notif._id}`}
            className="px-2 py-3 hover:bg-muted/50 rounded-md"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={notif.otherUser?.profileImage} />
                <AvatarFallback>
                  {notif.otherUser?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <p className="font-semibold text-sm">Request Accepted!</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">
                    {notif.otherUser?.name}
                  </span>{" "}
                  accepted your connection request
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    asChild
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Link to={`/chat/${notif.otherUser?._id}`}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDismissNotification(notif._id, e)}
                    className="h-7 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {allNotifications.length === 0 && (
          <div className="py-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No new notifications
            </p>
          </div>
        )}

        {allNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 text-center">
              <Link
                to="/profile?tab=requests"
                className="text-xs text-primary hover:underline"
              >
                View all connections
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
