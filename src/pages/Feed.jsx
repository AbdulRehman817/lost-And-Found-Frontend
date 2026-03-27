import * as React from "react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ItemCard } from "../components/item-card";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Calendar as CalendarIcon,
  List,
  Map,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Calendar } from "../components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

function Filters({ onFilterChange }) {
  const [date, setDate] = useState();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const handleApplyFilters = () => {
    onFilterChange({
      keyword,
      category,
      location,
      date,
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setCategory("");
    setLocation("");
    setDate(undefined);
    onFilterChange({});
  };

  return (
    <div className="w-full">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="keyword" className="text-sm font-medium text-foreground">
            Keyword
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="keyword"
              placeholder="e.g., wallet, phone"
              className="pl-10 w-full bg-secondary/30 border-border focus:border-primary"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-full bg-secondary/30 border-border">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="pets">Pets</SelectItem>
              <SelectItem value="personal">Personal Items</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-foreground">
            Location
          </Label>
          <Input
            id="location"
            placeholder="e.g., Central Park"
            className="w-full bg-secondary/30 border-border focus:border-primary"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Date Lost/Found</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-secondary/30 border-border",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" className="rounded-full border-border" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPost] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("active");
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.location) params.append("location", filters.location);

      const headers = {};

      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/getAllPosts?${params.toString()}`,
        { headers }
      );

      let filteredPosts = response.data.data || [];

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredPosts = filteredPosts.filter(
          (post) =>
            post.title?.toLowerCase().includes(keyword) ||
            post.description?.toLowerCase().includes(keyword) ||
            post.tags?.some((tag) => tag.toLowerCase().includes(keyword))
        );
      }

      setPost(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Separate posts into active and resolved/reunited
  const activePosts = posts.filter(
    (p) => p.status !== "resolved" && p.status !== "reunited" && p.status !== "found"
  );
  const resolvedPosts = posts.filter(
    (p) => p.status === "resolved" || p.status === "reunited" || p.status === "found"
  );

  const displayedPosts = activeTab === "active" ? activePosts : resolvedPosts;

  return (
    <div className="flex min-h-screen flex-col bg-background w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 md:mb-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl text-foreground">
                  Lost & Found Feed
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Browse items reported by the community
                </p>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full bg-secondary/50 border border-border overflow-hidden p-0.5">
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    className={cn(
                      "rounded-full h-8 px-4 text-xs",
                      view === "list" && "bg-primary text-primary-foreground shadow-sm"
                    )}
                  >
                    <List className="h-3.5 w-3.5 mr-1.5" />
                    List
                  </Button>
                  <Button
                    variant={view === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("map")}
                    aria-label="Map view"
                    className={cn(
                      "rounded-full h-8 px-4 text-xs",
                      view === "map" && "bg-primary text-primary-foreground shadow-sm"
                    )}
                  >
                    <Map className="h-3.5 w-3.5 mr-1.5" />
                    Map
                  </Button>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 rounded-full border-border hover:border-primary/50 transition-colors">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md p-0">
                    <SheetHeader className="px-6 py-6 border-b border-border">
                      <SheetTitle className="font-headline">Filters</SheetTitle>
                      <SheetDescription>
                        Refine your search results
                      </SheetDescription>
                    </SheetHeader>
                    <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                      <Filters onFilterChange={handleFilterChange} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Tabs: Active vs Reunited */}
          <div className="mb-8">
            <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-full border border-border w-fit">
              <button
                onClick={() => setActiveTab("active")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === "active"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Active ({activePosts.length})
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  activeTab === "resolved"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reunited ({resolvedPosts.length})
              </button>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 md:py-28 gap-3">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading items...</p>
            </div>
          ) : view === "list" ? (
            <>
              {displayedPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                  {displayedPosts.map((item) => (
                    <ItemCard key={item._id} {...item} />
                  ))}
                </div>
              ) : (
                <Card className="w-full border-dashed border-2 border-border bg-secondary/10 rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center py-20 md:py-28">
                    {activeTab === "resolved" ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-foreground font-medium text-lg mb-1">No reunited items yet</p>
                        <p className="text-muted-foreground text-sm text-center max-w-md">
                          When items are successfully returned to their owners, they'll appear here.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-foreground font-medium text-lg mb-1">No posts found</p>
                        <p className="text-muted-foreground text-sm text-center max-w-md">
                          Try adjusting your filters or check back later for new items.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="w-full overflow-hidden rounded-2xl border-border">
              <div className="relative h-[50vh] min-h-[400px] md:h-[600px] w-full bg-muted">
                <img
                  src="https://picsum.photos/seed/99/1200/600"
                  alt="Map of items"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm">
                  <div className="bg-background/95 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center border border-border">
                    <p className="font-headline font-semibold text-lg mb-1 text-foreground">
                      Interactive Map View
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Coming Soon!
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Load More Button */}
          {displayedPosts.length > 0 && view === "list" && (
            <div className="flex justify-center mt-10 md:mt-14">
              <Button variant="outline" size="lg" className="min-w-[160px] rounded-full border-border hover:border-primary/50 transition-colors">
                Load More
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
