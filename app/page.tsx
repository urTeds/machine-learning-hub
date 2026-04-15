import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-white text-3xl font-bold">ML</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Machine Learning Hub
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            A simple platform to explore the world of machine learning. Sign up to get started on your AI journey.
          </p>

          {/* CTA Button */}
          <Link href="/login">
            <button className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
              Get Started →
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:translate-y--2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-sm text-gray-600">Get up and running with AI in minutes</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:translate-y--2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Auth</h3>
            <p className="text-sm text-gray-600">Enterprise-grade security powered by Supabase</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:translate-y--2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Learn More</h3>
            <p className="text-sm text-gray-600">Access resources and tutorials anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
