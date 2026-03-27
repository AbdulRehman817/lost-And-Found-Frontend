import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { ReuniteLogo } from "../components/icons";
import {
  Menu,
  User,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import UnifiedNotifications from "./UnifiedNotifications";
import { io } from "socket.io-client";

export function Header() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isSignedIn) navigate("/login");
  }, [isSignedIn, navigate]);

  // Clear notification dot when user is on Chat page
  useEffect(() => {
    if (location.pathname.startsWith("/chat")) {
      setHasUnreadChat(false);
    }
  }, [location.pathname]);

  // Global socket listener for new chat messages
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    const socket = io("https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("register", user.id);

    socket.on("receive_message", () => {
      // Only show if user is NOT already on the chat page
      if (!window.location.pathname.startsWith("/chat")) {
        setHasUnreadChat(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isSignedIn, user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChatClick = () => {
    setHasUnreadChat(false);
    navigate("/chat");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-white/10 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 mr-4 transition-transform hover:scale-105">
            <ReuniteLogo />
            <span className="font-headline text-2xl font-bold tracking-tight text-gradient">
              Reunite
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/feed" className="text-foreground/70 hover:text-foreground transition-colors">
              Feed
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <Button
            asChild
            className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 rounded-full px-5"
          >
            <Link to="/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report an Item
            </Link>
          </Button>

          <ThemeToggle />

          {/* Chat Icon with Dynamic Notification Dot */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleChatClick}
            className="relative hover:bg-primary/10 transition-colors rounded-full"
          >
            <MessageCircle className="h-5 w-5" />
            {hasUnreadChat && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="absolute h-full w-full rounded-full bg-destructive animate-ping opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-destructive border-[1.5px] border-background" />
              </span>
            )}
          </Button>

          <UnifiedNotifications />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <Avatar className="h-10 w-10 object-cover rounded-full">
                  <AvatarImage src={user?.imageUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 rounded-xl" align="end">
              <DropdownMenuLabel className="font-headline">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile?tab=profile">
                  <User className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/feed" className="hover:text-primary transition-colors">
                  Lost & Found Feed
                </Link>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
                <Button asChild className="rounded-full">
                  <Link to="/create">Report an Item</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
