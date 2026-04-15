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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">ML</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Machine Learning Hub</h1>
          <p className="text-gray-600">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form */}
          <div className="p-8 sm:p-10">
            {isSignUp ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Create Account</h2>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setMessage("");
                  }}
                  disabled={isLoading}
                  className="w-full text-blue-600 py-2 font-medium hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Already have an account? Sign In
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sign In</h2>

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setMessage("");
                  }}
                  disabled={isLoading}
                  className="w-full text-blue-600 py-2 font-medium hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
