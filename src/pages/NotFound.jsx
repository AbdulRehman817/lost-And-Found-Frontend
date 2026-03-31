import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a1628] px-4 overflow-hidden">
      {/* Glow */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 text-center max-w-sm w-full">

        {/* 404 number */}
        <div className="mb-6">
          <span className="text-[120px] font-extrabold leading-none tracking-tight text-white/5 select-none">
            404
          </span>
        </div>

        {/* Card */}
        <div className="-mt-10 rounded-2xl border border-white/8 bg-white/3 px-8 py-10 backdrop-blur-sm">
          <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
            <span className="text-2xl font-extrabold text-sky-400">?</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-sm text-white/40 leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-6 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}