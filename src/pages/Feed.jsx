import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ItemCard } from "../components/item-card";
import { Button } from "../components/ui/button";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Calendar } from "../components/ui/calendar";
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
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

function Filters({ onFilterChange }) {
  const [date, setDate] = useState();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const handleApply = () => onFilterChange({ keyword, category, location, date });
  const handleClear = () => {
    setKeyword(""); setCategory(""); setLocation(""); setDate(undefined);
    onFilterChange({});
  };

  return (
    <div className="space-y-5">
      {/* Keyword */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            placeholder="e.g., wallet, phone"
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full rounded-lg border border-white/10 bg-white/5 text-white focus:border-sky-500/50 focus:ring-sky-500/30">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0d1b2e] text-white">
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="pets">Pets</SelectItem>
            <SelectItem value="personal">Personal Items</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">Location</Label>
        <input
          placeholder="e.g., Central Park"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-colors focus:border-sky-500/50 focus:outline-none",
              date ? "text-white" : "text-white/25"
            )}>
              <CalendarIcon className="h-4 w-4 text-white/30" />
              {date ? date.toLocaleDateString() : "Pick a date"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-white/10 bg-[#0d1b2e]" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="text-white" />
          </PopoverContent>
        </Popover>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleApply}
          className="flex-1 rounded-lg bg-sky-500 hover:bg-sky-400 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
        >
          Clear
        </button>
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

  useEffect(() => { fetchPosts(); }, [filters]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.location) params.append("location", filters.location);
      const headers = {};
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.get(
        `https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/getAllPosts?${params.toString()}`,
        { headers }
      );
      let filtered = response.data.data || [];
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        filtered = filtered.filter((p) =>
          p.title?.toLowerCase().includes(kw) ||
          p.description?.toLowerCase().includes(kw) ||
          p.tags?.some((t) => t.toLowerCase().includes(kw))
        );
      }
      setPost(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activePosts = posts.filter((p) => p.status !== "resolved" && p.status !== "reunited" && p.status !== "found");
  const resolvedPosts = posts.filter((p) => p.status === "resolved" || p.status === "reunited" || p.status === "found");
  const displayedPosts = activeTab === "active" ? activePosts : resolvedPosts;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628] text-white overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 md:py-14">

          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Lost &amp; Found Feed
              </h1>
              <p className="text-sm text-white/40 mt-1">Browse items reported by the community</p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
                {[
                  { id: "list", icon: List, label: "List" },
                  { id: "map", icon: Map, label: "Map" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      view === v.id
                        ? "bg-sky-500 text-white"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    <v.icon className="h-3.5 w-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Filter sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm border-white/8 bg-[#0d1b2e] text-white p-0">
                  <SheetHeader className="px-6 py-5 border-b border-white/8">
                    <SheetTitle className="text-white font-bold">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-6 py-6 overflow-y-auto">
                    <Filters onFilterChange={setFilters} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 w-fit rounded-lg border border-white/10 bg-white/5 p-0.5 mb-8">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-5 py-2 rounded-md text-sm font-semibold transition-colors",
                activeTab === "active" ? "bg-sky-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              Active ({activePosts.length})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-semibold transition-colors",
                activeTab === "resolved" ? "bg-emerald-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Reunited ({resolvedPosts.length})
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
              <p className="text-sm text-white/40">Loading items...</p>
            </div>
          ) : view === "list" ? (
            displayedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedPosts.map((item) => (
                    <ItemCard key={item._id} {...item} />
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <button className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition-colors">
                    Load More
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl border border-dashed border-white/10 bg-white/2">
                {activeTab === "resolved" ? (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-semibold text-white mb-1">No reunited items yet</p>
                    <p className="text-sm text-white/40 text-center max-w-xs">
                      When items are returned to their owners, they'll appear here.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10">
                      <Search className="h-7 w-7 text-sky-400" />
                    </div>
                    <p className="font-semibold text-white mb-1">No posts found</p>
                    <p className="text-sm text-white/40 text-center max-w-xs">
                      Try adjusting your filters or check back later for new items.
                    </p>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 h-[500px] md:h-[600px]">
              <img
                src="https://picsum.photos/seed/99/1200/600"
                alt="Map"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-[#0d1b2e]/90 backdrop-blur-sm px-10 py-8 text-center">
                  <p className="font-bold text-white text-lg mb-1">Interactive Map View</p>
                  <p className="text-sm text-white/40">Coming Soon</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}