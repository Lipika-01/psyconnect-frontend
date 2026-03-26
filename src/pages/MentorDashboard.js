import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import { API_BASE } from "../config";

const TABS = ["Home", "Profile", "My Students", "Chats", "Notifications"];

function MentorDashboard() {
  const navigate = useNavigate();
  const { id: safeId } = useParams();
  const mentorId = safeId.replace(/-/g, "/");

  const [activeTab, setActiveTab] = useState("Home");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/mentor/${encodeURIComponent(mentorId)}`)
      .then(r => r.json())
      .then(d => { setProfile(d.mentor); setStudents(d.students || []); })
      .catch(console.error);

    loadNotifications();
    pollRef.current = setInterval(loadNotifications, 5000);
    return () => clearInterval(pollRef.current);
  }, [mentorId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadNotifications = () => {
    fetch(`${API_BASE}/notifications/${encodeURIComponent(mentorId)}`)
      .then(r => r.json())
      .then(d => {
        const notifs = d.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      })
      .catch(console.error);
  };

  const openChat = async (student) => {
    setSelectedStudent(student);
    setActiveTab("Chats");
    const res = await fetch(`${API_BASE}/mentor-chat/${encodeURIComponent(student.studentId)}`);
    const data = await res.json();
    setMessages(data.messages || []);

    // Poll this chat while open
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await fetch(`${API_BASE}/mentor-chat/${encodeURIComponent(student.studentId)}`);
      const d = await r.json();
      setMessages(d.messages || []);
    }, 4000);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedStudent) return;
    const msg = {
      from: "mentor",
      senderId: mentorId,
      senderName: profile?.name || "Mentor",
      content: input,
      time: new Date().toLocaleString(),
    };
    await fetch(`${API_BASE}/mentor-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudent.studentId, mentorId, ...msg }),
    });
    setMessages([...messages, msg]);
    setInput("");

    // Send notification to student
    await fetch(`${API_BASE}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: selectedStudent.studentId,
        subject: `Reply from ${profile?.name || mentorId}`,
        message: input,
        date: new Date().toLocaleString(),
      }),
    });
  };

  const renderTab = () => {
    switch (activeTab) {

      case "Home": return (
        <div className="space-y-4">
          <GlassCard>
            <h2 className="text-2xl font-bold text-[#556B2F] dark:text-[#9ACD32]">
              Welcome, {profile?.name || "Mentor"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{mentorId} · {profile?.department} Department</p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              You have <span className="font-bold text-[#6B8E23]">{students.length}</span> students assigned to you.
            </p>
          </GlassCard>
          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <p className="text-3xl font-extrabold text-[#556B2F] dark:text-[#9ACD32]">{students.length}</p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">Assigned Students</p>
            </GlassCard>
            <GlassCard>
              <p className="text-3xl font-extrabold text-[#556B2F] dark:text-[#9ACD32]">{unreadCount}</p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">Unread Notifications</p>
            </GlassCard>
          </div>
        </div>
      );

      case "Profile": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Your Profile</h2>
          {profile ? (
            <div className="space-y-2 text-sm">
              {Object.entries(profile)
                .filter(([k]) => !["_id", "password"].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="flex gap-4 border-b dark:border-gray-700 pb-2">
                    <span className="font-semibold capitalize w-44 text-gray-600 dark:text-gray-400">
                      {k.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span>{String(v)}</span>
                  </div>
                ))}
            </div>
          ) : <p className="text-gray-400">Loading...</p>}
        </GlassCard>
      );

      case "My Students": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">My Students</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {students.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800 rounded-xl hover:bg-[#e6f0d4] dark:hover:bg-[#556B2F]/40 transition">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">Roll {s.rollNo} · {s.studentId}</p>
                </div>
                <button
                  onClick={() => openChat(s)}
                  className="px-4 py-1 bg-[#6B8E23] text-white text-xs rounded-full hover:scale-105 transition font-semibold"
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      );

      case "Chats": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-1 text-[#556B2F] dark:text-[#9ACD32]">
            {selectedStudent ? `Chat with ${selectedStudent.name}` : "Chats"}
          </h2>
          {!selectedStudent ? (
            <div>
              <p className="text-gray-500 text-sm mb-4">Select a student from "My Students" to open a chat.</p>
              <div className="space-y-2">
                {students.map((s, i) => (
                  <button key={i} onClick={() => openChat(s)}
                    className="w-full text-left p-3 bg-white/50 dark:bg-gray-800 rounded-xl hover:bg-[#e6f0d4] dark:hover:bg-[#556B2F]/40 transition text-sm">
                    {s.name} <span className="text-xs text-gray-400 ml-2">Roll {s.rollNo}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                {selectedStudent.studentId} · Roll {selectedStudent.rollNo}
              </p>
              <div className="h-72 overflow-y-auto space-y-3 mb-4 bg-white/30 dark:bg-black/20 rounded-xl p-3">
                {messages.length === 0 && (
                  <p className="text-sm text-gray-400 text-center mt-10">No messages yet.</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "mentor" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${
                      m.from === "mentor"
                        ? "bg-[#6B8E23] text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 rounded-bl-none"
                    }`}>
                      <p>{m.content}</p>
                      <p className="text-xs opacity-60 mt-1">{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-3 py-2 text-xs text-gray-500 hover:text-[#6B8E23] transition"
                >
                  ← Back
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={`Reply to ${selectedStudent.name}...`}
                  className="flex-1 p-2.5 rounded-full bg-white/60 dark:bg-white/10 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition font-semibold text-sm"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </GlassCard>
      );

      case "Notifications": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className="p-4 bg-white/60 dark:bg-gray-800 rounded-xl border-l-4 border-[#6B8E23]">
                  <p className="font-semibold text-sm">{n.subject}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{n.date}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      );

      default: return null;
    }
  };

  return (
    <Layout>
      <div className="flex gap-4 max-w-6xl mx-auto">

        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <GlassCard>
            <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <p className="font-bold text-[#556B2F] dark:text-[#9ACD32] text-sm">{profile?.name || "Mentor"}</p>
              <p className="text-xs text-gray-500 truncate">{mentorId}</p>
            </div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Menu</p>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition flex items-center justify-between ${
                  activeTab === tab
                    ? "bg-[#6B8E23] text-white font-semibold"
                    : "hover:bg-[#e6f0d4] dark:hover:bg-[#556B2F]/40 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span>{tab}</span>
                {tab === "Notifications" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => { localStorage.clear(); navigate("/logout"); }}
              className="w-full mt-4 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-left"
            >
              Logout
            </button>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="flex-1">{renderTab()}</div>

      </div>
    </Layout>
  );
}

export default MentorDashboard;