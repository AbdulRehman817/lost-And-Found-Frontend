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
  MessageCircle,
} from "lucide-react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";

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

  useEffect(() => {
    if (location.pathname.startsWith("/chat")) {
      setHasUnreadChat(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;
    const socket = io("https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app", {
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.emit("register", user.id);
    socket.on("receive_message", () => {
      if (!window.location.pathname.startsWith("/chat")) {
        setHasUnreadChat(true);
      }
    });
    return () => { socket.disconnect(); };
  }, [isSignedIn, user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChatClick = () => {
    setHasUnreadChat(false);
    navigate("/chat");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/feed", label: "Feed" },
  ];

  return (
     <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[#0d1b2e]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left — Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ReuniteLogo />
            <span className="text-xl font-bold tracking-tight text-white">Reunite</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white bg-white/8"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/create"
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Report an Item
          </Link>

       

          {/* Chat */}
          <button
            onClick={handleChatClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            {hasUnreadChat && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute h-full w-full rounded-full bg-sky-400 animate-ping opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-sky-400" />
              </span>
            )}
          </button>

          <UnifiedNotifications />

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/10 hover:ring-white/25 transition-all overflow-hidden">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.imageUrl} className="object-cover" />
                  <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 rounded-xl border border-white/8 bg-[#0d1b2e] text-white shadow-xl"
              align="end"
            >
              <DropdownMenuLabel className="text-white/50 text-xs font-semibold uppercase tracking-wider px-3 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/8" />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/70 hover:text-white hover:bg-white/8 focus:bg-white/8 focus:text-white">
                <Link to="/profile"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/70 hover:text-white hover:bg-white/8 focus:bg-white/8 focus:text-white">
                <Link to="/profile?tab=profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/8" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/8 bg-[#0d1b2e] text-white">
              <nav className="flex flex-col gap-2 mt-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-3 rounded-lg text-base font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-white/8">
                  <Link
                    to="/create"
                    className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-3 text-sm font-bold text-white transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" /> Report an Item
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}