import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { MessageCircle, Send, Reply, Ban } from "lucide-react";

export default function CommentBox() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [postAuthorId, setPostAuthorId] = useState(null);

  // Fetch post details to get author ID
  const fetchPostAuthor = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPostAuthorId(
        response.data.post?.userId?._id || response.data.post?.userId
      );
    } catch (error) {
      console.error("Error fetching post author:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const comments = response.data.comments;
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Check if current user is the post author
  const isPostAuthor = user?.id === postAuthorId;

  // Add new comment (top-level)
  const handlePostComment = async () => {
    if (!newComment.trim() || isPostAuthor) return;

    try {
      const token = await getToken();
      const response = await axios.post(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        {
          message: newComment,
          parentId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const comment = response.data.data;
        const normalizedComment = { ...comment, replies: [] };
        setComments((prev) => [normalizedComment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error.response?.data || error);
    }
  };

  // Add reply to comment (post author CAN reply to others' comments)
  const handlePostReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    try {
      const token = await getToken();
      const response = await axios.post(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        {
          message: replyText,
          parentId: parentCommentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const reply = response.data.data;
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), reply],
              };
            }
            return comment;
          })
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error posting reply:", error.response?.data || error);
    }
  };

  // Show reply box
  const showReplyBox = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  // Hide reply box
  const hideReplyBox = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  useEffect(() => {
    fetchPostAuthor();
    fetchComments();
  }, [id]);

  return (
    <div className="mt-8 bg-background">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2.5 font-headline">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-5 mb-8">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              key={comment._id}
              className={`group ${
                index !== comments.length - 1
                  ? "border-b border-border/50 pb-5"
                  : ""
              }`}
            >
              {/* Main Comment */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarImage
                      src={comment.userId?.profileImage || ""}
                      className="object-cover"
                      alt={comment.userId?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {comment.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Comment header */}
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {comment.userId?.name || "Anonymous User"}
                    </h4>
                    <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                    <time className="text-xs text-muted-foreground">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Just now"}
                    </time>
                  </div>

                  {/* Comment message */}
                  <div className="bg-secondary/40 rounded-xl px-4 py-3 mb-3 border border-border/30">
                    <p className="text-foreground/90 text-sm leading-relaxed break-words">
                      {comment.message}
                    </p>
                  </div>

                  {/* Comment actions - Always show reply button for everyone */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => showReplyBox(comment._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </button>
                    {comment.replies && comment.replies.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {comment.replies.length}{" "}
                        {comment.replies.length === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Box - Anyone can reply to comments */}
              {replyingTo === comment._id && (
                <div className="mt-4 ml-14">
                  <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage
                          src={user?.imageUrl || ""}
                          alt={user?.fullName || "You"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {user?.firstName?.charAt(0)?.toUpperCase() || "Y"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Write a thoughtful reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="bg-background border-border focus:border-primary text-foreground placeholder-muted-foreground text-sm"
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handlePostReply(comment._id)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 text-xs font-medium rounded-full"
                          >
                            Post Reply
                          </Button>
                          <Button
                            onClick={hideReplyBox}
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground px-4 py-1.5 text-xs rounded-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-14 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Avatar className="w-8 h-8 ring-1 ring-border">
                          <AvatarImage
                            src={reply.userId?.profileImage || ""}
                            alt={reply.userId?.name || "User"}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {reply.userId?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-foreground text-sm">
                            {reply.userId?.name || "Anonymous User"}
                          </h5>
                          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                          <time className="text-xs text-muted-foreground">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Just now"}
                          </time>
                        </div>

                        <div className="bg-secondary/20 rounded-lg px-3 py-2 border border-border/20">
                          <p className="text-foreground/80 text-sm leading-relaxed break-words">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h4 className="text-foreground font-medium mb-1">No comments yet</h4>
            <p className="text-sm text-muted-foreground">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>

      {/* Add Comment - Only show if NOT post author */}
      {!isPostAuthor ? (
        <div className="border-t border-border pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                <AvatarImage
                  src={user?.imageUrl || ""}
                  alt={user?.fullName || "You"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "Y"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-3">
              <Input
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                className="bg-secondary/30 border-border focus:border-primary text-foreground placeholder-muted-foreground py-3 px-4 text-sm rounded-xl"
              />

              <div className="flex justify-end">
                <Button
                  onClick={handlePostComment}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-medium transition-all duration-200 rounded-full shadow-sm hover:shadow-md"
                  disabled={!newComment.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-border pt-6">
          <div className="bg-secondary/20 rounded-xl p-6 text-center border border-border/50">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Ban className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="text-foreground font-medium mb-1">
              You cannot comment on your own post
            </h4>
            <p className="text-sm text-muted-foreground">
              However, you can reply to other users' comments below
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
