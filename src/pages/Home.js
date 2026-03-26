import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import { API_BASE } from "../config";

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, mentors: [], psychologists: [] });

  useEffect(() => {
    fetch(`${API_BASE}/home-data`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(console.error);
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HERO */}
        <div className="text-center pt-8">
          <span className="inline-block px-4 py-1 rounded-full bg-[#e6f0d4] dark:bg-[#556B2F]/40 text-[#556B2F] dark:text-[#9ACD32] text-xs font-semibold mb-4 tracking-widest uppercase">
            SLRTCE · Department of Information Technology
          </span>
          <h1 className="text-5xl font-extrabold text-[#556B2F] dark:text-[#9ACD32]">
            Welcome to PsyConnect
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            A calm, safe, and private space for student mental wellness,
            mentor guidance, and professional psychological support.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-2.5 bg-[#6B8E23] text-white rounded-full font-semibold shadow hover:bg-[#556B2F] hover:scale-105 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-2.5 border-2 border-[#6B8E23] text-[#6B8E23] dark:text-[#9ACD32] rounded-full font-semibold hover:bg-[#6B8E23] hover:text-white transition"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { emoji: "", label: "Students", value: stats.students },
            { emoji: "", label: "Mentors", value: stats.mentors.length },
            { emoji: "", label: "Psychologists", value: stats.psychologists.length },
          ].map(({ emoji, label, value }) => (
            <GlassCard key={label}>
              <p className="text-4xl font-extrabold text-[#556B2F] dark:text-[#9ACD32]">{value}</p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{emoji} {label}</p>
            </GlassCard>
          ))}
        </div>

        {/* WHAT / WHY / HOW */}
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard>
            <h2 className="text-lg font-bold text-[#556B2F] dark:text-[#9ACD32] mb-2">What is PsyConnect?</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              An internal college platform connecting students with their
              assigned faculty mentors and licensed psychologists for
              emotional support throughout their academic journey.
            </p>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-bold text-[#556B2F] dark:text-[#9ACD32] mb-2">Why Use It?</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {["Safe, private communication", "Your own faculty mentor", "Professional psych sessions", "Personal diary", "AI wellness chatbot 24/7", "Free calming resources"].map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-bold text-[#556B2F] dark:text-[#9ACD32] mb-2">How to Use?</h2>
            <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              {[["1", "Sign Up", "with your college ID"], ["2", "Login", "with ID + password"], ["3", "Explore", "your dashboard"], ["4", "Connect", "with mentor / therapist"], ["5", "Grow", "your well-being"]].map(([n, t, d]) => (
                <li key={t} className="flex gap-2"><span>{n}</span><span><b>{t}</b> — {d}</span></li>
              ))}
            </ol>
          </GlassCard>
        </div>

        {/* MENTOR & PSYCHOLOGIST LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <h2 className="text-lg font-bold text-[#556B2F] dark:text-[#9ACD32] mb-3">Faculty Mentors</h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {stats.mentors.length > 0 ? stats.mentors.map((m, i) => (
                <li key={i} className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl text-sm">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-gray-500">Rolls {m.assignedRollNos}</span>
                </li>
              )) : <li className="text-sm text-gray-400">Loading...</li>}
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-bold text-[#556B2F] dark:text-[#9ACD32] mb-3">Psychologists</h2>
            <ul className="space-y-2 mb-4">
              {stats.psychologists.length > 0 ? stats.psychologists.map((p, i) => (
                <li key={i} className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-500">Rolls {p.assignedRollNos}</span>
                </li>
              )) : <li className="text-sm text-gray-400">Loading...</li>}
            </ul>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-[#556B2F] dark:text-[#9ACD32] mb-1">Who Can Join?</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>SLRTCE students with a valid Student ID</li>
                <li>IT faculty with a Mentor ID</li>
                <li>Registered college psychologists</li>
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <GlassCard className="text-center">
          <p className="text-lg font-semibold text-[#556B2F] dark:text-[#9ACD32]">Ready to get started?</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
            Create your account in under a minute.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-2.5 bg-[#6B8E23] text-white rounded-full font-semibold shadow hover:bg-[#556B2F] hover:scale-105 transition"
          >
            Get Started
          </button>
        </GlassCard>

      </div>
    </Layout>
  );
}

export default Home;