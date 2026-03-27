import React from "react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import { ThemeToggle } from "../components/theme-toggle";
import { Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 w-full">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your preferences</p>
        </div>

        {/* Appearance Card */}
        <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground font-headline">Appearance</h4>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
            </div>
          </div>
          <div className="flex gap-4 items-center pt-2">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Toggle theme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
