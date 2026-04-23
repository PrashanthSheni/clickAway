import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-2xl font-black tracking-tighter text-blue-600 uppercase">Spaceflow</div>
        <Link
          to="/auth"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-colors"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-24 flex flex-col items-center text-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold tracking-wide uppercase">
            Smart Resource Booking
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Manage your workspace <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              with zero friction
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Spaceflow makes it incredibly easy for teams to book meeting rooms, desks, and equipment. 
            Approve requests, manage capacities, and gain deep insights into space utilization.
          </p>
          <div className="flex gap-4">
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              Get Started for Free
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 px-6 border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Everything you need to run your office</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Booking</h3>
                <p className="text-slate-600">Easily find and reserve resources that fit your team's exact needs, instantly.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Team Visibility</h3>
                <p className="text-slate-600">See when and where your colleagues are working to foster better collaboration.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Approval Workflows</h3>
                <p className="text-slate-600">Managers have full control with automated and manual approval queues.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Analytics</h3>
                <p className="text-slate-600">Gain insights into utilization, no-shows, and peak hours to optimize space.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About / How it works */}
        <section className="py-24 px-6 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Built for Modern Organizations</h2>
            <p className="text-lg text-slate-400 mb-10">
              Spaceflow's intuitive platform reduces administrative overhead. Employees simply register, get approved by their manager, and instantly gain access to the resources they need to do their best work.
            </p>
            <Link
              to="/auth"
              className="inline-block bg-white text-slate-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Spaceflow. All rights reserved.</p>
      </footer>
    </div>
  );
}
