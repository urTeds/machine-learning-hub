import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
            <span className="text-white text-4xl font-black">ML</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-7xl font-black text-white text-center mb-6 leading-tight">
          Machine Learning Hub
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-300 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
          Unlock the power of artificial intelligence. Explore cutting-edge ML models, learn from experts, and build the future.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-16">
          <Link href="/login">
            <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-110 transition-all duration-300 overflow-hidden">
              <span className="relative z-10">Get Started</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Quick Start</h3>
            <p className="text-slate-400">Get up and running with AI in minutes, no experience needed</p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-700 hover:border-purple-500 transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Secure Auth</h3>
            <p className="text-slate-400">Enterprise-grade authentication powered by Supabase</p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Learn & Explore</h3>
            <p className="text-slate-400">Access resources, tutorials, and community insights</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-16">
          <p className="text-slate-400 text-sm">
            💡 Join thousands of learners exploring the future of AI
          </p>
        </div>
      </div>
    </div>
  );
}
