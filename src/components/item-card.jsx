import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export function ItemCard({ _id, title, type, location, imageUrl, imageHint, userId, createdAt }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/5">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/6">
        <Avatar className="h-9 w-9 ring-1 ring-white/10">
          <AvatarImage src={userId?.profileImage} alt={userId?.name} className="object-cover" />
          <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
            {userId?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {userId?.name?.replace(/\d+/g, "").replace(/[_\s]+$/, "") || "Anonymous"}
          </p>
          <p className="text-xs text-white/30">{createdAt ? formatDate(createdAt) : ""}</p>
        </div>
        <span className={cn(
          "shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
          type === "lost"
            ? "bg-red-500/10 text-red-400 border border-red-500/15"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
        )}>
          {type}
        </span>
      </div>

      {/* Image */}
      <Link to={`/feed/${_id}`} className="block px-4 pt-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/5">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={imageHint}
          />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <h3 className="text-sm font-bold text-white truncate leading-snug">
          {title}
        </h3>
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400/60" />
            <span className="truncate">{location}</span>
          </div>
        )}
        <Link
          to={`/feed/${_id}`}
          className="mt-auto flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}