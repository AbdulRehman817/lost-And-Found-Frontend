import React, { useState, useEffect } from "react";
import { useSignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ReuniteLogo } from "../components/icons";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn, userLoaded, navigate]);

  // Handle sign-in
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const token = await getToken();
        if (token) {
          localStorage.setItem("token", token);
        }

        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.errors?.[0]?.message || "Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-animated-mesh px-4 relative overflow-hidden">
      <div className="absolute inset-0 spotlight-primary pointer-events-none"></div>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ReuniteLogo />
            <span className="text-3xl font-bold text-foreground font-headline">Reunite</span>
          </div>
          <p className="text-muted-foreground">Welcome back</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl relative z-10 w-full shadow-2xl">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onSignInPress}
            className="w-full btn-premium h-11 rounded-xl font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
