import React, { useState, useEffect } from "react";
import { useSignUp, useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ReuniteLogo } from "../components/icons";
import { Mail, Lock, User, Upload, X, Loader2 } from "lucide-react";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be less than 5MB"); return; }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    if (values.password !== values.confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
    if (values.password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    try {
      await signUp.create({ username: values.username, emailAddress: values.email, password: values.password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Sign-up failed. Please try again.");
    } finally { setLoading(false); }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        await new Promise((r) => setTimeout(r, 1000));
        if (profileImage) {
          try { await user?.setProfileImage({ file: profileImage }); } catch (e) { console.error(e); }
        }
        const token = await getToken();
        if (token) {
          localStorage.setItem("token", token);
          await fetch("https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/profile", {
            method: "GET", headers: { Authorization: `Bearer ${token}` },
          });
        }
        navigate("/");
      }
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const upload = async () => {
      if (user && profileImage && !user.hasImage) {
        try { await user.setProfileImage({ file: profileImage }); } catch (e) { console.error(e); }
      }
    };
    upload();
  }, [user, profileImage]);

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a1628] px-4 py-10 overflow-hidden">
      {/* Glow */}
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
          <h1 className="text-xl font-bold text-white mb-1">
            {pendingVerification ? "Check your email" : "Create an account"}
          </h1>
          <p className="text-sm text-white/40">
            {pendingVerification ? "Enter the 6-digit code we sent you" : "Join the community to find what's lost"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm">

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!pendingVerification ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Username */}
              <div>
                <label className={labelClass}>Username</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    {...form.register("username", { required: true })}
                    placeholder="johndoe"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Profile image */}
              <div>
                <label className={labelClass}>Profile Image <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-xl object-cover border border-white/10" />
                      <button
                        type="button"
                        onClick={() => { setProfileImage(null); setImagePreview(null); }}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-white/40 truncate">{profileImage?.name}</p>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5 cursor-pointer px-4 py-3 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Upload className="h-4 w-4 text-white/30" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50">Click to upload</p>
                      <p className="text-[10px] text-white/25">PNG, JPG up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    {...form.register("email", { required: true })}
                    type="email"
                    placeholder="you@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    {...form.register("password", { required: true, minLength: 8 })}
                    type="password"
                    placeholder="••••••••"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    {...form.register("confirmPassword", { required: true })}
                    type="password"
                    placeholder="••••••••"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold text-white transition-colors mt-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
              </button>
            </form>
          ) : (
            /* Verification step */
            <div className="space-y-4">
              <p className="text-center text-sm text-white/40">
                Enter the 6-digit code sent to your email
              </p>
              <input
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder-white/15 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-colors"
              />
              <button
                onClick={onVerify}
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold text-white transition-colors"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : "Verify Email"}
              </button>
              <button
                onClick={() => setPendingVerification(false)}
                className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm font-semibold text-white/50 hover:text-white transition-colors"
              >
                Back to sign up
              </button>
            </div>
          )}

          {!pendingVerification && (
            <p className="mt-6 text-center text-sm text-white/30">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                Sign in
              </Link>
            </p>
          )}
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