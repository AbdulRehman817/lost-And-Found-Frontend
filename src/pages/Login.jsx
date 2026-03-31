import React, { useState, useEffect } from "react";
import { useSignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { ReuniteLogo } from "../components/icons";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLoaded && isSignedIn) navigate("/");
  }, [isSignedIn, userLoaded, navigate]);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: emailAddress, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const token = await getToken();
        if (token) localStorage.setItem("token", token);
        navigate("/");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a1628] px-4 overflow-hidden">
      {/* Subtle glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-30"
        style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ReuniteLogo />
            <span className="text-2xl font-bold text-white tracking-tight">Reunite</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/40">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm">

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSignInPress()}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`${inputClass} pl-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSignInPress()}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={onSignInPress}
              disabled={loading || !emailAddress || !password}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold text-white transition-colors mt-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-white/30">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-5 text-center text-xs text-white/20">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-white/40 transition-colors">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}