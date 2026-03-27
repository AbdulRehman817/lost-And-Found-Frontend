import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(post?.liked || false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post?.comments || []);
  const [showAllComments, setShowAllComments] = useState(false);

  const toggleLike = () => setLiked(!liked);
  const toggleCommentInput = () => setShowCommentInput(!showCommentInput);
  const toggleShowAllComments = () => setShowAllComments(!showAllComments);

  const addComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, { user: "You", text: newComment }]);
      setNewComment("");
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden max-w-md mx-auto mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post?.avatar || `https://i.pravatar.cc/40?u=${post?.author}`}
            alt={post?.author}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div>
            <h2 className="text-foreground font-semibold text-sm">{post?.author}</h2>
            <p className="text-muted-foreground text-xs">
              {post?.date} · {post?.location}
            </p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
          ⋯
        </button>
      </div>

      {/* Post Image */}
      {post?.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full max-h-72 object-cover"
        />
      )}

      {/* Post Content */}
      <div className="px-4 py-3">
        {post?.title && (
          <h3 className="text-foreground font-semibold text-sm mb-1">
            {post.title}
          </h3>
        )}
        {post?.desc && <p className="text-muted-foreground text-xs leading-relaxed">{post.desc}</p>}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-5 px-4 py-2 text-muted-foreground text-sm border-t border-border/50">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            liked ? "text-red-500" : "hover:text-red-500"
          }`}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          {liked ? "Liked" : "Like"}
        </button>
        <button
          onClick={toggleCommentInput}
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
          <Send className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Likes & Comment Count */}
      <div className="px-4 py-2 text-muted-foreground text-xs flex justify-between border-t border-border/30">
        <span>{liked ? 1 + comments.length : comments.length} Likes</span>
        <span>{comments.length} Comments</span>
      </div>

      {comments.length > 0 && (
        <div className="px-4 py-1.5">
          <p
            className="text-muted-foreground cursor-pointer hover:text-primary text-xs transition-colors"
            onClick={toggleShowAllComments}
          >
            {showAllComments
              ? "Show less"
              : `View all ${comments.length} comments`}
          </p>
        </div>
      )}

      {/* Comments Section */}
      {showAllComments && (
        <div className="px-4 py-2 space-y-2.5 text-xs">
          {comments.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                {c.user.charAt(0)}
              </div>
              <div className="bg-secondary/50 rounded-xl px-3 py-2 flex-1">
                <p className="text-foreground">
                  <span className="font-semibold">{c.user}</span>{" "}
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {showCommentInput && (
        <div className="px-4 py-3 flex items-center gap-2 border-t border-border/30">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium shrink-0">
            Y
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full bg-secondary/50 text-foreground placeholder:text-muted-foreground px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-border/50 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button
            onClick={addComment}
            className="text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors text-xs"
          >
            Send
          </button>
          <button
            onClick={() => setShowCommentInput(false)}
            className="text-muted-foreground font-medium px-2 py-1.5 rounded-full hover:bg-muted transition-colors text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
