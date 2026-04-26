"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setMessage("Sign up successful! You can now log in.");
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
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }
    setIsLoading(false);
  };

  const isError =
    message.startsWith("Error:") ||
    message.startsWith("Please fill") ||
    message.startsWith("Please enter");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo — links back to home */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white text-base font-black">ML</span>
          </div>
          <span className="text-white font-bold text-lg">Machine Learning Hub</span>
        </Link>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Tab bar */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => { setIsSignUp(false); setMessage(""); }}
              disabled={isLoading}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                !isSignUp
                  ? "text-white border-b-2 border-blue-500 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setMessage(""); }}
              disabled={isLoading}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                isSignUp
                  ? "text-white border-b-2 border-blue-500 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form body */}
          <div className="p-8 sm:p-10">
            {/* Inline message */}
            {message && (
              <div
                className={`flex items-start gap-3 rounded-lg px-4 py-3 mb-6 border ${
                  isError
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {isError ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5 shrink-0">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Full name field — sign up only */}
              {isSignUp && (
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password field with toggle */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Min. 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-11 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      /* Eye-off icon */
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      /* Eye icon */
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={isLoading}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
