"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✓ Sign up successful! You can now log in.");
      setFullName("");
      setEmail("");
      setPassword("");
      setIsSignUp(false);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter email and password");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✓ Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <span className="text-white text-3xl font-black">ML</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Machine Learning Hub</h1>
          <p className="text-slate-400">Access the future of AI</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Form */}
          <div className="p-8 sm:p-10">
            {isSignUp ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-8">Create Account</h2>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-6 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setMessage("");
                  }}
                  disabled={isLoading}
                  className="w-full text-blue-400 py-2 font-semibold hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Already have an account? Sign In
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-6 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setMessage("");
                  }}
                  disabled={isLoading}
                  className="w-full text-blue-400 py-2 font-semibold hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Don't have an account? Create one
                </button>
              </>
            )}
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`px-8 sm:px-10 py-4 border-t ${
                message.includes("Error:") || message.includes("Please fill")
                  ? "bg-red-500/20 border-red-500/50 text-red-300"
                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              }`}
            >
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          🔒 Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
