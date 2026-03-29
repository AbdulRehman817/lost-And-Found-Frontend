import * as React from "react";
import axios from "axios";
import { useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
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
import { cn } from "../lib/utils";
import { Link, useParams } from "react-router-dom";
import CommentBox from "../components/CommentBox";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PostDetails() {
  const { id } = useParams();
  const [hasConnection, setHasConnection] = useState(false);
  const [post, setPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const { getToken } = useAuth();
  const { user } = useUser(); // Get current user
  const navigate = useNavigate();

  // 🔹 Fetch post details
  React.useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/feed/${id}`
        );
        const data = response.data.data;
        console.log("postDescription", data);
        setPost({
          id: data?._id,
          _id: data?._id,
          title: data?.title,
          status: data?.type === "lost" ? "Lost" : "Found",
          location: data?.location,
          date: new Date(data?.createdAt).toLocaleDateString(),
          imageUrl: data?.imageUrl,
          description: data?.description,
          category: data?.category,
          tags: data?.tags || [],
          poster: {
            _id: data?.userId?._id,
            clerkId: data?.userId?.clerkId,
            name: data?.userId?.name || "Anonymous",
            avatar: data?.userId?.avatar || "https://picsum.photos/seed/10/200",
            email: data?.userId?.email || "",
            phone: data?.userId?.phone || "",
            imageUrl: data?.userId?.profileImage,
          },
        });
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [id]);

  // Check if the current user is viewing their own post
  const isOwnPost = user?.id === post?.poster?.clerkId;

  // Delete post handler
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      await axios.delete(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/feed");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Start editing
  const startEditing = () => {
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditLocation(post.location);
    setIsEditing(true);
  };

  // Save edit handler
  const handleSaveEdit = async () => {
    try {
      const token = await getToken();
      await axios.put(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/posts/${id}`,
        { title: editTitle, description: editDescription, location: editLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        title: editTitle,
        description: editDescription,
        location: editLocation,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post.");
    }
  };

  if (!post)
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background bg-animated-mesh">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Image */}
            <div className="lg:col-span-2">
              <Card className="glass-panel overflow-hidden rounded-2xl p-0 border-none">
                <div className="relative aspect-[4/3] w-full">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />

                  {post.status === "Reunited" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white p-4 bg-black/50 rounded-md backdrop-blur-sm border border-white/10">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
                        <h2 className="text-3xl font-bold mt-2">Reunited!</h2>
                        <p className="text-green-200">
                          This item has been returned to its owner.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Post Info */}
            <div className="space-y-6">
              <Card className="glass-panel rounded-2xl">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        className={cn(
                          "text-xs py-1 px-3 rounded-md font-semibold uppercase tracking-wider border-none",
                          post.status === "Lost"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-green-500/10 text-green-500"
                        )}
                      >
                        {post.status}
                      </Badge>
                      {isEditing ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-3xl font-bold lg:text-4xl mt-3 font-headline bg-transparent border-b-2 border-primary focus:outline-none w-full text-foreground"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold lg:text-4xl mt-3 font-headline">
                          {post.title}
                        </h1>
                      )}
                    </div>

                    {/* Author Actions: Edit/Delete */}
                    {isOwnPost && !isEditing && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-md hover:bg-secondary shrink-0">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-md border-border bg-popover">
                          <DropdownMenuItem onClick={startEditing} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowDeleteConfirm(true)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {isEditing && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={handleSaveEdit} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-md hover:bg-secondary">Cancel</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-base">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 mt-1 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">Location</p>
                        {isEditing ? (
                          <input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="text-muted-foreground bg-transparent border-b border-primary focus:outline-none w-full"
                          />
                        ) : (
                          <p className="text-muted-foreground">{post.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Calendar className="h-6 w-6 mt-1 text-primary" />
                      <div>
                        <p className="font-semibold">Date</p>
                        <p className="text-muted-foreground">{post.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Tag className="h-6 w-6 mt-1 text-primary" />
                      <div>
                        <p className="font-semibold">Category</p>
                        <p className="text-muted-foreground">{post.category}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Poster - Conditional Link and Display */}
              <Card className="glass-panel rounded-2xl">
                <CardContent className="p-6">
                  {!isOwnPost ? (
                    <Link to={`/profile/${post.poster._id}`}>
                      <div className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                          <AvatarImage
                            src={post.poster.imageUrl}
                            className="object-cover"
                            alt={post.poster.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {post.poster.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.poster.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Poster
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={post.poster.imageUrl}
                          className="object-cover"
                          alt="You"
                        />
                        <AvatarFallback>
                          {post.poster.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">You</p>
                        <p className="text-sm text-muted-foreground">Poster</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description & Comments */}
            <div className="md:col-span-2 lg:col-span-3 space-y-8">
              {/* Description */}
              <Card className="glass-panel rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold font-headline">Description</h2>
                  {isEditing ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="text-base leading-relaxed text-foreground w-full min-h-[120px] bg-secondary/30 border border-border rounded-xl p-3 focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Array.isArray(post.tags)
                      ? post.tags.join(",").split(",")
                      : post.tags.split(",")
                    ).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Only */}
              <Card className="glass-panel rounded-2xl">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3 font-headline">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Community Comments
                  </h2>

                  {/* Only CommentBox kept */}
                  <CommentBox />

                  <Separator className="my-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4">
          <div className="glass-panel rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="text-xl font-bold font-headline text-foreground">Delete Post?</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete your post and all associated comments.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="rounded-md hover:bg-secondary transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
                onClick={handleDeletePost}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" /> Delete Post</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
