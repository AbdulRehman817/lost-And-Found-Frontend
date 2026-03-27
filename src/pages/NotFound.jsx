import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl shadow-lg p-12 text-center max-w-md w-full">
        <h1 className="text-7xl font-extrabold text-gradient font-headline mb-2">404</h1>
        <p className="text-muted-foreground mb-8 text-lg">Oops! Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-8 py-3 shadow-sm hover:shadow-md transition-all"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
