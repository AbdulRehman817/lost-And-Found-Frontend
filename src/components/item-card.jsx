import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export function ItemCard({
  _id,
  title,
  status,
  type,
  location,
  date,
  imageUrl,
  imageHint,
  userId,
  createdAt,
}) {
  return (
    <Card className="group flex py-0 h-full bg-card/80 backdrop-blur-sm border border-border/60 flex-col overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20">
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarImage
            src={userId?.profileImage}
            alt={userId?.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {userId?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight text-foreground truncate">
            {userId?.name?.replace(/\d+/g, "").replace(/[_\s]+$/, "")}
          </p>
          <p className="text-xs text-muted-foreground">
            Posted on{" "}
            <span className="font-medium">
              {formatDate(createdAt)}
            </span>
          </p>
        </div>

        <Badge
          className={cn(
            "rounded-full text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-wider border-none",
            type === "lost"
              ? "bg-red-500/10 text-red-500"
              : type === "found"
              ? "bg-green-500/10 text-green-500"
              : "bg-primary/10 text-primary"
          )}
        >
          {type}
        </Badge>
      </CardHeader>

      {/* Image */}
      <CardContent className="p-0">
        <Link to={`/feed/${_id}`} className="block">
          <div className="overflow-hidden px-4">
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="object-cover w-full h-full rounded-xl transition-transform duration-500 group-hover:scale-105"
                data-ai-hint={imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </Link>
      </CardContent>
      <CardContent className="p-4 mt-[-15px] flex flex-col gap-3 flex-grow">
        <div>
          <h3 className="font-headline mb-2 text-lg font-semibold tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
            {type}: {title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60" />
            <span className="truncate">{location}</span>
          </div>

          <Button asChild className="w-full rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all border-none shadow-none font-medium" variant="outline">
            <Link to={`/feed/${_id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
