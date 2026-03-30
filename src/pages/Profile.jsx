import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ItemCard } from "../components/item-card";
import RequestsList from "../components/request-list";
import {
  Edit,
  Mail,
  Phone,
  User,
  FileText,
  LayoutGrid,
  PlusCircle,
  Inbox,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import * as React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const userStats = { posts: 3, activeRequests: 2, itemsReunited: 1 };

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "dashboard";
  const { isSignedIn, user } = useUser();
  const { id } = useParams();
  const { getToken } = useAuth();

  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [postDetails, setPostDetails] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.publicMetadata?.bio || "");
      setPhone(user.publicMetadata?.phone || "");
    }
  }, [user]);

  const fetchAllAcceptedRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getAcceptedRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveRequests(res.data.data);
    } catch (e) { console.error(e); }
  };

  const getAllPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getPendingRequests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveRequests(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const getAllUserPosts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/getUserPosts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPostDetails(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isSignedIn) {
      getAllUserPosts();
      getAllPendingRequests();
      fetchAllAcceptedRequests();
    }
  }, [id, isSignedIn]);

  const handleProfileChange = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const token = await getToken();
      await axios.put(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/profile",
        { bio, phone },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      await user.reload();
      setIsEditing(false);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";
  const labelClass = "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  const statCards = [
    { label: "Total Posts",       value: postDetails.length,     icon: FileText,   color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/15" },
    { label: "Pending Requests",  value: activeRequests.length,  icon: Inbox,      color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/15" },
    { label: "Items Reunited",    value: userStats.itemsReunited, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628] text-white overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 md:py-14">

          <Tabs defaultValue={defaultTab} className="w-full">

            {/* Tab bar */}
            <TabsList className="flex w-full flex-wrap gap-1 rounded-xl border border-white/8 bg-white/3 p-1 mb-8">
              {[
                { value: "dashboard", icon: LayoutGrid, label: "Dashboard" },
                { value: "posts",     icon: FileText,   label: "My Posts" },
                { value: "Connections", icon: Inbox,    label: "Connections" },
                { value: "profile",   icon: User,       label: "Profile" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white/40 transition-colors data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── DASHBOARD ── */}
            <TabsContent value="dashboard">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    Welcome back, {user?.username || "User"}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">Here's a summary of your activity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {statCards.map((s, i) => (
                    <div key={i} className={`rounded-xl border ${s.bg} p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{s.label}</span>
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  <PlusCircle className="h-4 w-4" /> Post a New Item
                </Link>
              </div>
            </TabsContent>

            {/* ── PROFILE ── */}
            <TabsContent value="profile">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">User Profile</h2>
                    <p className="text-white/40 text-sm mt-1">Manage your public profile and contact information.</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isSaving}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isEditing
                        ? "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                        : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <Avatar className="h-24 w-24 ring-2 ring-white/10 mb-4">
                    <AvatarImage src={user?.imageUrl} className="object-cover" />
                    <AvatarFallback className="bg-sky-500/20 text-sky-400 text-2xl font-bold">
                      {user?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                  <p className="text-sm text-white/40">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}><Mail className="h-3.5 w-3.5" /> Email</label>
                    <input
                      className={inputClass}
                      value={user?.primaryEmailAddress?.emailAddress || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClass}><Phone className="h-3.5 w-3.5" /> Phone</label>
                    <input
                      className={inputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className={labelClass}><FileText className="h-3.5 w-3.5" /> Bio</label>
                  <textarea
                    className={`${inputClass} min-h-[100px] resize-none`}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    readOnly={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileChange}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                    >
                      {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── MY POSTS ── */}
            <TabsContent value="posts">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Posts</h2>
                    <p className="text-white/40 text-sm mt-1">{postDetails.length} item{postDetails.length !== 1 ? "s" : ""} posted</p>
                  </div>
                  <Link
                    to="/create"
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" /> Post New Item
                  </Link>
                </div>

                {postDetails.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {postDetails.map((item) => (
                      <ItemCard key={item._id} {...item} showManagement />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-white/10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10">
                      <FileText className="h-6 w-6 text-sky-400" />
                    </div>
                    <p className="font-semibold text-white mb-1">No posts yet</p>
                    <p className="text-sm text-white/40 mb-5">Start by posting a lost or found item.</p>
                    <Link
                      to="/create"
                      className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                    >
                      <PlusCircle className="h-4 w-4" /> Post an Item
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── CONNECTIONS ── */}
            <TabsContent value="Connections">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Connections</h2>
                  <p className="text-white/40 text-sm mt-1">Manage your pending and accepted connection requests.</p>
                </div>
                <RequestsList requests={activeRequests} />
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}