import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("location", location);
      formData.append("image", imageFile);
      formData.append("type", type);
      formData.append("tags", activeTags.join(","));
      const response = await fetch(
        "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/createPost",
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      navigate("/feed");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628] text-white overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-12 md:py-16">

          {/* Page title */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
              Report an Item
            </h1>
            <p className="text-white/40 text-sm">
              Fill out the form below to post a lost or found item to the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Lost / Found toggle */}
            <div>
              <label className={labelClass}>Item Status</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "lost", label: "I lost something", desc: "Help me find it" },
                  { value: "found", label: "I found something", desc: "Help me return it" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      type === opt.value
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${type === opt.value ? "bg-sky-400" : "bg-white/20"}`} />
                      <span className={`text-sm font-semibold ${type === opt.value ? "text-white" : "text-white/60"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <p className={`text-xs pl-4 ${type === opt.value ? "text-sky-300/70" : "text-white/25"}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Item Title</label>
                <input
                  className={inputClass}
                  placeholder="e.g., Black Leather Wallet"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <Select required value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full rounded-lg border border-white/10 bg-white/5 text-white data-[placeholder]:text-white/25 focus:border-sky-500/50 focus:ring-sky-500/20 h-[42px]">
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
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-[110px] resize-none`}
                placeholder="Describe the item — brand, color, size, and any identifying features."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Location + Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Location</label>
                <input
                  className={inputClass}
                  placeholder="e.g., Central Park"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Tags</label>
                <input
                  className={inputClass}
                  placeholder="e.g., blue, leather, small"
                  value={activeTags.join(",")}
                  onChange={(e) => setActiveTags(e.target.value.split(","))}
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className={labelClass}>Photo</label>
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  imageFile
                    ? "border-sky-500/40 bg-sky-500/5"
                    : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                }`}
                style={{ minHeight: "160px" }}
              >
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="max-h-56 rounded-lg object-contain p-3"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Upload className="h-5 w-5 text-white/30" />
                    </div>
                    <p className="text-sm text-white/40 mb-1">
                      <span className="font-semibold text-white/60">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-white/25">PNG, JPG or GIF</p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/8" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-bold text-white transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Item"
              )}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}