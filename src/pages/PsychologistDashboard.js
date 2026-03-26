import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import { API_BASE } from "../config";

const TABS = ["Home", "Profile", "My Students", "Session Requests", "Send Schedule"];

function PsychologistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [schedule, setSchedule] = useState({ date: "", day: "", time: "", location: "Ground Floor, Admin Office, SLRTCE", notes: "" });

  const psychId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`${API_BASE}/psychologist/${psychId}`)
      .then(r => r.json()).then(d => { setProfile(d.psychologist); setStudents(d.students || []); })
      .catch(console.error);
    fetch(`${API_BASE}/session-requests/${psychId}`)
      .then(r => r.json()).then(d => setRequests(d.requests || []))
      .catch(console.error);
  }, []);

  const sendSchedule = async () => {
    if (!selectedRequest || !schedule.date || !schedule.time) return alert("Fill all schedule fields");
    await fetch(`${API_BASE}/send-schedule`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedRequest.studentId, ...schedule, headline: selectedRequest.headline })
    });
    alert("Schedule sent successfully!");
    setSelectedRequest(null);
    setSchedule({ date: "", day: "", time: "", location: "Ground Floor, Admin Office, SLRTCE", notes: "" });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Home": return (
        <GlassCard>
          <h2 className="text-2xl font-bold text-[#556B2F] dark:text-[#9ACD32]">Welcome, {profile?.name || "Therapist"}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">You are supporting {students.length} students.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#e6f0d4] dark:bg-[#556B2F]/30 rounded-xl text-center">
              <p className="text-3xl font-bold text-[#556B2F] dark:text-[#9ACD32]">{students.length}</p>
              <p className="text-sm">Assigned Students</p>
            </div>
            <div className="p-4 bg-[#e6f0d4] dark:bg-[#556B2F]/30 rounded-xl text-center">
              <p className="text-3xl font-bold text-[#556B2F] dark:text-[#9ACD32]">{requests.length}</p>
              <p className="text-sm">Pending Requests</p>
            </div>
          </div>
        </GlassCard>
      );

      case "Profile": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Your Profile</h2>
          {profile ? (
            <div className="space-y-2 text-sm">
              {Object.entries(profile).filter(([k]) => !["_id","password"].includes(k)).map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b dark:border-gray-700 pb-2">
                  <span className="font-semibold capitalize w-40">{k.replace(/([A-Z])/g, " $1")}:</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          ) : <p>Loading...</p>}
        </GlassCard>
      );

      case "My Students": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">My Students</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {students.map((s, i) => (
              <div key={i} className="p-3 bg-white/50 dark:bg-gray-800 rounded-xl">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-gray-500">Roll No: {s.rollNo} | ID: {s.studentId}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      );

      case "Session Requests": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Session Requests</h2>
          {requests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {requests.map((r, i) => (
                <div key={i} className="p-4 bg-white/60 dark:bg-gray-800 rounded-xl border-l-4 border-[#6B8E23]">
                  <p className="font-semibold">{r.headline}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">From: {r.studentId} | {r.date}</p>
                  <button onClick={() => { setSelectedRequest(r); setActiveTab("Send Schedule"); }}
                    className="mt-2 px-4 py-1 bg-[#6B8E23] text-white text-sm rounded-full hover:scale-105 transition">
                    Send Schedule
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      );

      case "Send Schedule": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Send Session Schedule</h2>
          {selectedRequest && (
            <div className="mb-4 p-3 bg-[#e6f0d4] dark:bg-[#556B2F]/30 rounded-xl text-sm">
              <p><span className="font-semibold">Student:</span> {selectedRequest.studentId}</p>
              <p><span className="font-semibold">Request:</span> {selectedRequest.headline}</p>
            </div>
          )}
          {[
            { label: "Date", key: "date", type: "date" },
            { label: "Day (e.g. Monday)", key: "day", type: "text" },
            { label: "Time", key: "time", type: "time" },
            { label: "Location", key: "location", type: "text" },
            { label: "Additional Notes", key: "notes", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key} className="mb-3">
              <label className="text-sm font-semibold block mb-1">{label}</label>
              <input type={type} value={schedule[key]}
                onChange={e => setSchedule({ ...schedule, [key]: e.target.value })}
                className="w-full p-2 rounded-lg bg-white/40 dark:bg-white/10 outline-none focus:ring-2 focus:ring-[#6B8E23]" />
            </div>
          ))}
          <button onClick={sendSchedule}
            className="mt-2 px-6 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition">
            Send Schedule
          </button>
        </GlassCard>
      );

      default: return null;
    }
  };

  return (
    <Layout>
      <div className="flex gap-4 max-w-6xl mx-auto">
        <div className="w-56 shrink-0">
          <GlassCard>
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Psychologist Menu</p>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition ${activeTab === tab ? "bg-[#6B8E23] text-white font-semibold" : "hover:bg-[#e6f0d4] dark:hover:bg-[#556B2F]"}`}>
                {tab}
              </button>
            ))}
            <button onClick={() => { localStorage.clear(); navigate("/logout"); }}
              className="w-full mt-4 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              Logout
            </button>
          </GlassCard>
        </div>
        <div className="flex-1">{renderTab()}</div>
      </div>
    </Layout>
  );
}

export default PsychologistDashboard;