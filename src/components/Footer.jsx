import { Link } from "react-router-dom";
import { ReuniteLogo } from "../components/icons";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Github, Linkedin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card/50 text-foreground border-t border-border relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 py-14 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <ReuniteLogo className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-gradient">
                Reunite
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting communities, one found item at a time.
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10">
                <a href="#" aria-label="GitHub">
                  <Github className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10">
                <a href="#" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-headline font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/feed"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                Browse Items
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                to="/create"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                Post an Item
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                to="/profile"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                My Dashboard
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                About
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h4 className="font-headline font-semibold text-foreground">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h4 className="font-headline font-semibold text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to our newsletter for updates and success stories.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-secondary/30 border-border focus:border-primary rounded-full text-sm"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-sm hover:shadow-md transition-all">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Reunite. Crafted with care.
        </div>
      </div>
    </footer>
  );
}
