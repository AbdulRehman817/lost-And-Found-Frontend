import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ItemCard } from "../components/item-card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import {
  Edit,
  Mail,
  Phone,
  User,
  FileText,
  LayoutGrid,
  PlusCircle,
  Inbox,
  Settings,
  Bell,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import * as React from "react";
import RequestsList from "../components/request-list";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const userStats = {
  posts: 3,
  activeRequests: 2,
  itemsReunited: 1,
};

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
  const [activeRequests, setActiveRequets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize bio and phone from user metadata
  useEffect(() => {
    if (user) {
      setBio(user.publicMetadata?.bio || "");
      setPhone(user.publicMetadata?.phone || "");
    }
  }, [user]);

  const fetchAllAcceptedRequets = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getAcceptedRequests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data.data;
      console.log("getAcceptedRequest", data);
      setActiveRequets(data);
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
    }
  };

  const getAllPendingRequests = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/connections/getPendingRequests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.data || [];
      setActiveRequets(data);
      console.log("pending request", data);
    } catch (error) {
      console.error("error", error);
    }
  };

  const getAllUserPosts = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/getUserPosts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.data || [];
      console.log("posts", data);
      setPostDetails(data);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      getAllUserPosts();
      getAllPendingRequests();
      fetchAllAcceptedRequets();
    }
  }, [id, isSignedIn]);

  // ✅ Update profile - Backend handles Clerk metadata update
  const handleProfileChange = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Send to your backend - backend will update both MongoDB and Clerk
      const token = await getToken();
      const response = await axios.put(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/profile",
        { bio, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reload user data to reflect changes from Clerk
      await user.reload();

      alert("✅ Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-animated-mesh">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="flex w-full flex-wrap justify-center gap-2 bg-card border border-white/5 rounded-2xl p-2 shadow-md">
              <TabsTrigger value="dashboard" className="flex-1 min-w-[140px]">
                <LayoutGrid className="mr-2 h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1 min-w-[140px]">
                <FileText className="mr-2 h-4 w-4" /> My Posts
              </TabsTrigger>
              <TabsTrigger value="Connections" className="flex-1 min-w-[140px]">
                <Inbox className="mr-2 h-4 w-4" /> Connections
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 min-w-[140px]">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                <Card className="glass-panel rounded-2xl mt-4">
                  <CardHeader>
                    <CardTitle className="font-headline text-3xl">
                      Welcome back, {user?.username || "User"}!
                    </CardTitle>
                    <CardDescription>
                      Here's a summary of your activity on Reunite.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Posts
                          </CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {postDetails.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            items you've listed
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="glass-panel border-white/5 shadow-sm hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] transition-all rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Pending Requests
                          </CardTitle>
                          <Inbox className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {activeRequests.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            requests needing your attention
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="glass-panel border-white/5 shadow-sm hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] transition-all rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Items Reunited
                          </CardTitle>
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            +{userStats.itemsReunited}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            successful reunifications
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-start">
                      <Button className="btn-premium rounded-xl">
                        <a href="/create" className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" /> Post a New
                          Item
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="glass-panel rounded-2xl mt-4">
                  <CardHeader>
                    <CardTitle className="font-headline flex justify-between items-center text-2xl">
                      <span>User Profile</span>
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isSaving}
                      >
                        {isEditing ? (
                          "Cancel"
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage your public profile and contact information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
                          <AvatarImage
                            src={user?.imageUrl}
                            className="object-cover"
                            alt={user?.username}
                          />
                          <AvatarFallback>
                            {user?.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {isEditing ? (
                        <Input
                          name="name"
                          value={user?.username}
                          className="text-2xl font-bold font-headline text-center max-w-sm mx-auto"
                          readOnly
                        />
                      ) : (
                        <h2 className="font-headline text-3xl font-bold">
                          {user?.username}
                        </h2>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" /> Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.primaryEmailAddress?.emailAddress || ""}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" /> Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          readOnly={!isEditing}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[100px]"
                        readOnly={!isEditing}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end">
                        <Button
                          onClick={handleProfileChange}
                          className="btn-premium rounded-xl"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts">
                <Card className="glass-panel rounded-2xl mt-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-headline text-2xl">
                        Your Posts
                      </CardTitle>
                      <Button className="btn-premium rounded-xl">
                        <a href="/create" className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" /> Post New Item
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {postDetails.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {postDetails.map((item) => (
                          <ItemCard key={item._id} {...item} showManagement />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg flex flex-col items-center gap-4 bg-muted/30">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                        <p className="font-semibold">
                          You haven't posted any items yet.
                        </p>
                        <Button className="btn-premium rounded-xl">
                          <a href="/create">Post an Item</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="Connections">
                <RequestsList requests={activeRequests} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
