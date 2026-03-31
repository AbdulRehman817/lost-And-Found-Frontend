import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { MessageCircle, Send, Reply, Ban, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function CommentBox() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [postAuthorId, setPostAuthorId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPostAuthor = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPostAuthorId(res.data.post?.userId?._id || res.data.post?.userId);
    } catch (e) { console.error(e); }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data.comments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const isPostAuthor = user?.id === postAuthorId;

  const handlePostComment = async () => {
    if (!newComment.trim() || isPostAuthor) return;
    try {
      const token = await getToken();
      const res = await axios.post(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        { message: newComment, parentId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) => [{ ...res.data.data, replies: [] }, ...prev]);
        setNewComment("");
      }
    } catch (e) { console.error(e); }
  };

  const handlePostReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    try {
      const token = await getToken();
      const res = await axios.post(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}/comments`,
        { message: replyText, parentId: parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentCommentId
              ? { ...c, replies: [...(c.replies || []), res.data.data] }
              : c
          )
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPostAuthor();
    fetchComments();
  }, [id]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now";

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";

  return (
    <div>
      {/* Comment count */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/15">
          <MessageCircle className="h-4 w-4 text-sky-400" />
        </div>
        <span className="text-sm font-semibold text-white/60">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment, i) => (
            <div key={comment._id} className="group">
              {/* Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
                  <AvatarImage src={comment.userId?.profileImage} className="object-cover" />
                  <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                    {comment.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl rounded-tl-sm border border-white/8 bg-white/3 px-4 py-3 mb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-white">{comment.userId?.name || "Anonymous"}</span>
                      <span className="text-[10px] text-white/25">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed break-words">{comment.message}</p>
                  </div>
                  <div className="flex items-center gap-3 px-1">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="flex items-center gap-1 text-xs font-semibold text-white/30 hover:text-sky-400 transition-colors"
                    >
                      <Reply className="h-3 w-3" /> Reply
                    </button>
                    {comment.replies?.length > 0 && (
                      <span className="text-xs text-white/20">{comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply box */}
              {replyingTo === comment._id && (
                <div className="mt-3 ml-11">
                  <div className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0 ring-1 ring-white/10">
                      <AvatarImage src={user?.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                        {user?.firstName?.charAt(0)?.toUpperCase() || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <input
                        className={inputClass}
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePostReply(comment._id)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePostReply(comment._id)}
                          disabled={!replyText.trim()}
                          className="rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="mt-3 ml-11 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-3">
                      <Avatar className="h-7 w-7 shrink-0 ring-1 ring-white/10">
                        <AvatarImage src={reply.userId?.profileImage} className="object-cover" />
                        <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                          {reply.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-xl rounded-tl-sm border border-white/8 bg-white/3 px-3 py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white">{reply.userId?.name || "Anonymous"}</span>
                            <span className="text-[10px] text-white/25">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed break-words">{reply.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 mb-6 rounded-xl border border-dashed border-white/10">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <MessageCircle className="h-5 w-5 text-white/25" />
          </div>
          <p className="text-sm font-semibold text-white/50">No comments yet</p>
          <p className="text-xs text-white/25 mt-1">Be the first to share your thoughts</p>
        </div>
      )}

      {/* Add comment / blocked */}
      <div className="border-t border-white/8 pt-5">
        {!isPostAuthor ? (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
              <AvatarImage src={user?.imageUrl} className="object-cover" />
              <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                {user?.firstName?.charAt(0)?.toUpperCase() || "Y"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <input
                className={inputClass}
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 text-xs font-semibold text-white transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Post Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Ban className="h-4 w-4 text-white/30" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">You cannot comment on your own post</p>
              <p className="text-xs text-white/30 mt-0.5">You can still reply to others' comments above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}