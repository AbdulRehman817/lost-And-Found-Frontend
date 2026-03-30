import * as React from "react";
import axios from "axios";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Tag,
  MessageSquare,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import CommentBox from "../components/CommentBox";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState } from "react";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/feed/${id}`);
        const d = res.data.data;
        setPost({
          id: d?._id, _id: d?._id,
          title: d?.title,
          status: d?.type === "lost" ? "Lost" : "Found",
          location: d?.location,
          date: new Date(d?.createdAt).toLocaleDateString(),
          imageUrl: d?.imageUrl,
          description: d?.description,
          category: d?.category,
          tags: d?.tags || [],
          poster: {
            _id: d?.userId?._id,
            clerkId: d?.userId?.clerkId,
            name: d?.userId?.name || "Anonymous",
            imageUrl: d?.userId?.profileImage,
            email: d?.userId?.email || "",
            phone: d?.userId?.phone || "",
          },
        });
      } catch (e) { console.error(e); }
    };
    fetchPost();
  }, [id]);

  const isOwnPost = user?.id === post?.poster?.clerkId;

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      await axios.delete(`https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/feed");
    } catch (e) { console.error(e); alert("Failed to delete post."); }
    finally { setIsDeleting(false); setShowDeleteConfirm(false); }
  };

  const startEditing = () => {
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditLocation(post.location);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = await getToken();
      await axios.put(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`,
        { title: editTitle, description: editDescription, location: editLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((p) => ({ ...p, title: editTitle, description: editDescription, location: editLocation }));
      setIsEditing(false);
    } catch (e) { console.error(e); alert("Failed to update post."); }
  };

  const editInputClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-full focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";

  if (!post) return (
    <div className="flex min-h-screen flex-col bg-[#0a1628]">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628] text-white overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 md:py-14">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* ── Image ── */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 aspect-[4/3]">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                {post.status === "Reunited" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-6">
                      <CheckCircle className="h-14 w-14 mx-auto text-emerald-400 mb-2" />
                      <h2 className="text-2xl font-bold text-white">Reunited!</h2>
                      <p className="text-emerald-300/80 text-sm mt-1">This item has been returned to its owner.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Post info ── */}
            <div className="flex flex-col gap-4">

              {/* Status + Title card */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider mb-3 ${
                      post.status === "Lost"
                        ? "bg-red-500/10 text-red-400 border border-red-500/15"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                    }`}>
                      {post.status}
                    </span>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={`${editInputClass} text-lg font-bold`}
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-white leading-tight">{post.title}</h1>
                    )}
                  </div>

                  {isOwnPost && !isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border border-white/10 bg-[#0d1b2e] text-white shadow-xl w-44">
                        <DropdownMenuItem onClick={startEditing} className="cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/8 focus:bg-white/8 focus:text-white">
                          <Pencil className="mr-2 h-4 w-4" /> Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/8" />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteConfirm(true)}
                          className="cursor-pointer rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isEditing && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleSaveEdit} className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-xs font-semibold text-white transition-colors">Save</button>
                      <button onClick={() => setIsEditing(false)} className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
                    </div>
                  )}
                </div>

                <div className="space-y-3.5">
                  {[
                    { icon: MapPin, label: "Location", value: editLocation, setter: setEditLocation, editable: true },
                    { icon: Calendar, label: "Date", value: post.date, editable: false },
                    { icon: Tag, label: "Category", value: post.category, editable: false },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/15">
                        <row.icon className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-0.5">{row.label}</p>
                        {isEditing && row.editable ? (
                          <input value={row.value} onChange={(e) => row.setter(e.target.value)} className={editInputClass} />
                        ) : (
                          <p className="text-sm text-white/70 truncate">{i === 0 ? post.location : row.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poster card */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Posted by</p>
                {!isOwnPost ? (
                  <Link to={`/profile/${post.poster._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10 ring-1 ring-white/10">
                      <AvatarImage src={post.poster.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-sky-500/20 text-sky-400 text-sm font-bold">
                        {post.poster.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.poster.name}</p>
                      <p className="text-xs text-white/30">View profile →</p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.poster.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-sky-500/20 text-sky-400 text-sm font-bold">
                        {post.poster.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white">You</p>
                      <p className="text-xs text-white/30">Your post</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Description + Comments ── */}
            <div className="md:col-span-2 lg:col-span-3 space-y-5">

              {/* Description */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Description</h2>
                {isEditing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`${editInputClass} min-h-[120px] resize-none`}
                  />
                ) : (
                  <p className="text-sm text-white/60 leading-relaxed">{post.description}</p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(Array.isArray(post.tags) ? post.tags.join(",").split(",") : post.tags.split(",")).map((tag, i) => (
                      <span key={i} className="rounded-md bg-sky-500/10 border border-sky-500/15 px-3 py-1 text-xs font-medium text-sky-400">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                  <MessageSquare className="h-5 w-5 text-sky-400" />
                  Community Comments
                </h2>
                <CommentBox />
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete confirm overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1b2e] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-sm text-white/40 mb-7">
              This action cannot be undone. The post and all comments will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}