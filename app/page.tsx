import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-5xl font-bold text-blue-900 mb-4">
        Machine Learning Hub
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        A simple platform to explore the world of machine learning. Sign up to get started on your AI journey.
      </p>
      <Link href="/login">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </Link>
    </div>
  );
}
