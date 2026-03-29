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
  MessageSquare,
  MessageCircle,
  CheckIcon,
} from "lucide-react";

export default function UnifiedNotifications() {
  const { getToken } = useAuth();

  // CONNECTION NOTIFICATIONS
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedNotifications, setAcceptedNotifications] = useState([]);

  // COMMENT NOTIFICATIONS
  const [comments, setComments] = useState([]);

  // DISMISSED ITEMS
  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem("dismissedUnifiedNotifications");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // FILTER DISMISSED
  const visibleAccepted = acceptedNotifications.filter(
    (n) => !dismissedIds.has(n._id)
  );
  const visibleComments = comments.filter((c) => !dismissedIds.has(c._id));

  const allNotifications = [
    ...pendingRequests,
    ...visibleAccepted,
    ...visibleComments,
  ];

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
      const newlyAccepted = (res.data.data || []).filter(
        (c) => c.wasRequester && c.isNewConnection
      );
      setAcceptedNotifications(newlyAccepted);
    } catch (e) {
      console.error("❌Accepted Error:", e);
    }
  };

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

  // SAVE DISMISSED TO STORAGE
  useEffect(() => {
    localStorage.setItem(
      "dismissedUnifiedNotifications",
      JSON.stringify([...dismissedIds])
    );
  }, [dismissedIds]);

  // FETCHERS
  const fetchPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getPendingRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(res.data.data || []);
    } catch (e) {
      console.log("❌ Pending Error:", e);
    }
  };

  const fetchCommentNotifications = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/notifications/comments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("res.data.notifications", res.data.notifications);
      setComments(res.data.notifications || []);
    } catch (e) {
      console.error("❌ Comment Error:", e);
    }
  };

  // INITIAL FETCH
  useEffect(() => {
    fetchPendingRequests();
    fetchAcceptedConnections();
    fetchCommentNotifications();
  }, []);

  // POLLING EVERY 5 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingRequests();
      fetchAcceptedConnections();
      fetchCommentNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // DISMISS
  const handleDismiss = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    setDismissedIds((prev) => new Set(prev).add(id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-secondary transition-colors rounded-md">
          <Bell className="h-5 w-5" />
          {allNotifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="absolute h-full w-full rounded-full bg-destructive animate-ping opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-destructive" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 max-h-[500px] overflow-y-auto rounded-md border-border shadow-sm bg-card"
        align="end"
      >
        <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
          <span className="font-headline font-semibold">Notifications</span>
          <Badge variant="secondary" className="rounded-md text-xs">{allNotifications.length}</Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* PENDING REQUESTS */}
        {pendingRequests.map((req) => (
          <div key={req._id} className="px-3 py-3 hover:bg-secondary rounded-md transition-colors">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={req.requesterId?.profileImage}
                  className="object-cover"
                />
                <AvatarFallback>
                  {req.requesterId?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <p className="font-semibold text-sm">New Request</p>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  {req.requesterId?.name} wants to connect
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => handleAcceptRequest(req.requesterId._id, e)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleRejectRequest(req.requesterId._id, e)}
                    className="h-7 text-xs rounded-md hover:bg-secondary transition-colors"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ACCEPTED CONNECTIONS */}
        {visibleAccepted.map((notif) => (
          <div
            key={notif._id}
            className="px-3 py-3 hover:bg-secondary rounded-md transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={notif.otherUser?.profileImage}
                  className="object-cover"
                />
                <AvatarFallback>
                  {notif.otherUser?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <p className="font-semibold text-sm">Request Accepted</p>
                </div>

                <p className="text-xs mb-2 text-muted-foreground">
                  {notif.otherUser?.name} accepted your request
                </p>

                <div className="flex gap-2">
                  <Button size="sm" asChild className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors">
                    <Link to={`/chat/${notif.otherUser?._id}`}>
                      <MessageSquare className="w-3 h-3 mr-1" /> Message
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs rounded-md hover:bg-secondary transition-colors"
                    onClick={(e) => handleDismiss(notif._id, e)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* COMMENT NOTIFICATIONS */}
        {visibleComments.map((comment) => (
          <div
            key={comment._id}
            className="px-3 py-3 hover:bg-secondary rounded-md transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user?.profileImage} />
                <AvatarFallback>
                  {comment.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="h-3 w-3 text-blue-500" />
                  <p className="font-semibold text-sm">New Comment</p>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  {comment.fromUser?.name} commented on your post
                </p>

                <div className="flex gap-2">
                  <Button size="sm" asChild className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors">
                    <Link to={`/feed/${comment.postId._id}`}>View Post</Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs rounded-md hover:bg-secondary transition-colors"
                    onClick={(e) => handleDismiss(comment._id, e)}
                  >
                    <X className="w-3 h-3 mr-1" />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
