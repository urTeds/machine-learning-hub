import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Top navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <span className="text-white text-sm font-black">ML</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">Machine Learning Hub</span>
          </div>

          {/* Sign In link */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors font-medium"
          >
            Sign In
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Now featuring 50+ curated ML models
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-black text-center leading-tight mb-6 max-w-3xl">
          <span className="text-white block">Explore the world of</span>
          <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Machine Learning
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-300 text-center mb-10 max-w-2xl leading-relaxed">
          Unlock the power of artificial intelligence. Explore cutting-edge ML models, learn from experts, and build the future.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/login">
            <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-7 py-3.5 rounded-full font-bold text-base hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200">
              Get Started Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
          <Link href="/login">
            <button className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-7 py-3.5 rounded-full font-semibold text-base transition-all duration-200">
              Sign In
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-8 sm:gap-12 mb-20 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">50+</p>
            <p className="text-slate-400 text-sm mt-0.5">ML Models</p>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">10K+</p>
            <p className="text-slate-400 text-sm mt-0.5">Learners</p>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">200+</p>
            <p className="text-slate-400 text-sm mt-0.5">Resources</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Card 1 — Quick Start (blue) */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/60 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-blue-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Quick Start</h3>
            <p className="text-slate-400">Get up and running with AI in minutes, no experience needed</p>
          </div>

          {/* Card 2 — Secure Auth (purple) */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/60 rounded-2xl p-8 border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-purple-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Secure Auth</h3>
            <p className="text-slate-400">Enterprise-grade authentication powered by Supabase</p>
          </div>

          {/* Card 3 — Learn & Explore (emerald) */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/60 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-emerald-400">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Learn & Explore</h3>
            <p className="text-slate-400">Access resources, tutorials, and community insights</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-6">
        <p className="text-center text-slate-500 text-sm">
          Built with Next.js, React, and Supabase
        </p>
      </footer>
    </div>
  );
}
