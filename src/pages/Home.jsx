import * as React from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  FilePlus2,
  MessageCircle,
  Handshake,
  PlusCircle,
  Star,
  ArrowRight,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { FeaturedItems } from "../components/featured-items";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const featuredItems = [
  { id: "2", title: "Found: iPhone 14 Pro", status: "Found", imageUrl: "https://picsum.photos/seed/2/800/600", imageHint: "phone" },
  { id: "3", title: "Lost: Golden Retriever 'Buddy'", status: "Lost", imageUrl: "https://picsum.photos/seed/3/800/600", imageHint: "dog" },
  { id: "4", title: "Found: Set of Keys", status: "Found", imageUrl: "https://picsum.photos/seed/4/800/600", imageHint: "keys" },
  { id: "5", title: "Lost: Blue Jansport Backpack", status: "Lost", imageUrl: "https://picsum.photos/seed/5/800/600", imageHint: "backpack" },
];

const testimonials = [
  {
    quote: "I never thought I'd see my wallet again after leaving it on the subway. Thanks to Reunite, I had it back in less than 24 hours!",
    name: "Sarah Johnson",
    role: "Reunited with her Wallet",
    avatar: "https://picsum.photos/seed/t1/100",
    topColor: "bg-sky-500",
  },
  {
    quote: "Finding a lost dog was stressful, but posting on Reunite made it so easy. The owner contacted me within hours. Felt amazing.",
    name: "Michael Chen",
    role: "Helped 'Max' find his way home",
    avatar: "https://picsum.photos/seed/t2/100",
    topColor: "bg-violet-500",
  },
  {
    quote: "The messaging system is secure and easy to use. I verified the owner of a laptop I found and arranged a safe meetup.",
    name: "Jessica Rodriguez",
    role: "Reunited a laptop with its owner",
    avatar: "https://picsum.photos/seed/t3/100",
    topColor: "bg-emerald-500",
  },
];


const steps = [
  {
    icon: FilePlus2,
    num: "01",
    title: "Create a Post",
    desc: "Add photos, a description, location and date so the community can quickly identify your item.",
    accent: "bg-sky-500",
    iconColor: "text-sky-400",
    iconBg: "bg-sky-950 border-sky-800",
    hoverBorder: "hover:border-sky-600",
  },
  {
    icon: MessageCircle,
    num: "02",
    title: "Connect & Verify",
    desc: "Chat securely and verify ownership through our messaging system before any meetup.",
    accent: "bg-violet-500",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-950 border-violet-800",
    hoverBorder: "hover:border-violet-600",
  },
  {
    icon: Handshake,
    num: "03",
    title: "Reunite",
    desc: "Arrange a safe handoff and mark the item as reunited — another win for the community.",
    accent: "bg-emerald-500",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-950 border-emerald-800",
    hoverBorder: "hover:border-emerald-600",
  },
];

export default function Home() {
  return (
    <div className="w-full flex min-h-screen flex-col bg-slate-950 text-slate-100 overflow-x-hidden">

      <Header />

      <main className="flex-1 w-full">

        {/* ══ HERO ══ */}
        <section className="relative w-full overflow-hidden py-24 md:py-32 bg-slate-900 border-b border-slate-800">

          {/* Subtle dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-700 bg-sky-950 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              Community-Powered Lost &amp; Found
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.07] text-white mb-6">
              Lost something?{" "}
              <span className="text-sky-400">
                The community
              </span>{" "}
              has your back.
            </h1>

            <p className="mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-slate-400 mb-10">
              Post lost items, report found ones, and connect with people nearby
              to bring things back where they belong — fast.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link
                to="/feed"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-400 hover:-translate-y-0.5"
              >
                Browse Lost &amp; Found
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/create"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-8 py-3.5 text-sm font-bold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 hover:-translate-y-0.5"
              >
                <PlusCircle className="h-4 w-4 text-sky-400" />
                Report an Item
              </Link>
            </div>

            {/* Stats */}
           

          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="w-full py-20 md:py-28 bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

            <div className="mb-12">
              <span className="inline-block rounded-full border border-violet-700 bg-violet-950 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                Three steps to reunion
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                We've made the process as frictionless as possible — from posting to pickup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-7 transition-all duration-300 hover:-translate-y-1 ${step.hoverBorder}`}
                >
                  {/* colored top strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

                  <span className="block font-mono text-xs font-bold text-slate-600 mb-5 tracking-widest">{step.num}</span>
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${step.iconBg} ${step.iconColor}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ FEATURED ITEMS ══ */}
        <section className="w-full py-20 md:py-28 bg-slate-900 border-y border-slate-800">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <span className="inline-block rounded-full border border-sky-700 bg-sky-950 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky-400 mb-4">
                  Recently Reported
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Featured Items
                </h2>
              </div>
              <Link
                to="/feed"
                className="flex items-center gap-1.5 rounded-full border border-sky-700 bg-sky-950 px-4 py-2 text-sm font-semibold text-sky-400 transition-all hover:bg-sky-900 hover:border-sky-500"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <FeaturedItems items={featuredItems} />

          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="w-full py-20 md:py-28 bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

            <div className="text-center mb-14">
              <span className="inline-block rounded-full border border-emerald-700 bg-emerald-950 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
                Community Voices
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Stories of reunion
              </h2>
              <p className="mx-auto max-w-md text-base text-slate-400 leading-relaxed">
                Real people, real outcomes — hear from those who've used Reunite successfully.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-7 transition-all hover:-translate-y-1 hover:border-slate-700"
                >
                  {/* solid color top bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${t.topColor} rounded-t-2xl`} />

                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm italic leading-relaxed text-slate-400">"{t.quote}"</p>
                  <div className="flex items-center gap-3 border-t border-slate-800 pt-5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">
                        {t.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="w-full px-4 sm:px-6 py-20 md:py-28 bg-slate-900 border-t border-slate-800">
          <div className="mx-auto w-full max-w-6xl">
            <div className="rounded-3xl border border-sky-800 bg-sky-950 px-8 py-16 sm:px-16 text-center">
              <span className="inline-block rounded-full border border-sky-700 bg-sky-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400 mb-6">
                Join the Community
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Ready to find{" "}
                <span className="text-sky-400">what's missing?</span>
              </h2>
              <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-sky-200/60">
                Join 50,000+ community members helping each other recover what matters most.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/create"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-400 hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  Report an Item
                </Link>
                <Link
                  to="/feed"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-sky-700 bg-sky-900 px-8 py-3.5 text-sm font-bold text-sky-200 transition-all hover:bg-sky-800 hover:border-sky-600 hover:-translate-y-0.5"
                >
                  Browse the Feed
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}