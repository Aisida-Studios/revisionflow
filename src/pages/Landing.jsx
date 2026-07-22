import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="max-w-6xl w-full mx-auto p-6 flex justify-between items-center">
        <div className="text-2xl font-black text-purple-600 tracking-tight">RevisionFlow</div>
        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-16 text-center my-auto">
        <div className="inline-block bg-purple-50 text-purple-700 font-semibold text-xs px-4 py-1.5 rounded-full mb-6 border border-purple-200">
          Built for UK GCSE, AS-Level & A-Level Students
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Master your revisions with board-accurate AI tools.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Smart flashcards, personalized study schedules, past paper boundary tracking, and instant exam feedback tailored strictly to your specification.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-purple-600 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Start Revising Now — Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} RevisionFlow. Founded by a GCSE student | Aisida Studios.
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
