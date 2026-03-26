import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import { API_BASE } from "../config";

const TABS = ["Home", "Profile", "Diary", "Chatbot", "Mentor Chat", "Book Session", "Resources", "Notifications"];

function StudentDashboard() {
  const navigate = useNavigate();
  const { id: safeId } = useParams();

  // Convert URL-safe ID back to real ID: SLRTCE-IT-TE001 → SLRTCE/IT/TE001
  const studentId = safeId.replace(/-/g, "/");

  const [activeTab, setActiveTab] = useState("Home");
  const [profile, setProfile] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryText, setDiaryText] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi! I'm your mental wellness companion... How are you feeling today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState([]);
  const [mentorInput, setMentorInput] = useState("");
  const [sessionForm, setSessionForm] = useState({ headline: "", description: "" });
  const [notifications, setNotifications] = useState([]);
  const [botLoading, setBotLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);
  const mentorChatEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadNotifications();
    loadDiary();
    loadMentorChat();

    // Poll mentor chat every 5 seconds for new messages
    pollRef.current = setInterval(loadMentorChat, 5000);
    return () => clearInterval(pollRef.current);
  }, [studentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    mentorChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mentorMessages]);

  const loadProfile = () => {
    fetch(`${API_BASE}/student/${encodeURIComponent(studentId)}`)
      .then(r => r.json()).then(d => setProfile(d))
      .catch(console.error);
  };

  const loadNotifications = () => {
    fetch(`${API_BASE}/notifications/${encodeURIComponent(studentId)}`)
      .then(r => r.json()).then(d => {
        const notifs = d.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      })
      .catch(console.error);
  };

  const loadDiary = () => {
    fetch(`${API_BASE}/diary/${encodeURIComponent(studentId)}`)
      .then(r => r.json()).then(d => setDiaryEntries(d.entries || []))
      .catch(console.error);
  };

  const loadMentorChat = () => {
    fetch(`${API_BASE}/mentor-chat/${encodeURIComponent(studentId)}`)
      .then(r => r.json()).then(d => setMentorMessages(d.messages || []))
      .catch(console.error);
  };

  const sendToBot = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput("");
    setBotLoading(true);
    try {
      const res = await fetch("${API_BASE}/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setChatMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setChatMessages([...updated, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again" }]);
    }
    setBotLoading(false);
  };

  const saveDiary = async () => {
    if (!diaryText.trim()) return;
    const entry = { text: diaryText, date: new Date().toLocaleString() };
    await fetch("${API_BASE}/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...entry }),
    });
    setDiaryEntries([entry, ...diaryEntries]);
    setDiaryText("");
  };

  const sendMentorMessage = async () => {
    if (!mentorInput.trim()) return;
    const msg = {
      from: "student",
      senderId: studentId,
      senderName: profile?.name || "Student",
      content: mentorInput,
      time: new Date().toLocaleString(),
    };
    await fetch("${API_BASE}/mentor-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, mentorId: profile?.mentorId, ...msg }),
    });
    setMentorMessages([...mentorMessages, msg]);
    setMentorInput("");

    // Send notification to mentor
    await fetch("${API_BASE}/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: profile?.mentorId,
        subject: `New message from ${profile?.name || studentId}`,
        message: mentorInput,
        date: new Date().toLocaleString(),
      }),
    });
  };

  const bookSession = async () => {
    if (!sessionForm.headline || !sessionForm.description) {
      alert("Please fill all fields"); return;
    }
    await fetch("${API_BASE}/session-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, studentName: profile?.name, ...sessionForm }),
    });
    alert("Session request sent to your psychologist! 📬");
    setSessionForm({ headline: "", description: "" });
  };

  const resources = [
    { title: "5-Minute Breathing Exercise", url: "https://www.youtube.com/watch?v=acUZdGd_3Dg", emoji: "" },
    { title: "Calm Piano Music", url: "https://www.youtube.com/watch?v=77ZozI0rw7w", emoji: "" },
    { title: "Guided Meditation for Students", url: "https://www.youtube.com/watch?v=z6X5oEIg6Ak", emoji: "" },
    { title: "Stress Relief Nature Sounds", url: "https://www.youtube.com/watch?v=eKFTSSKCzWA", emoji: "" },
    { title: "Anxiety Relief Talk", url: "https://www.youtube.com/watch?v=O-6f5wQXSu8", emoji: "" },
  ];

  const renderTab = () => {
    switch (activeTab) {

      case "Home": return (
        <div className="space-y-4">
          <GlassCard>
            <h2 className="text-2xl font-bold text-[#556B2F] dark:text-[#9ACD32]">
              Welcome, {profile?.name || "Student"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
              {profile?.studentId} · {profile?.class} · Roll No. {profile?.rollNo}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              How are you feeling today? Your mental wellness matters.
            </p>
          </GlassCard>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["Diary", "Write your private thoughts"],
              ["Chatbot", "Talk to your wellness AI"],
              ["Book Session", "Connect with your psychologist"],
            ].map(([tab, desc]) => (
              <GlassCard key={tab}>
                <button onClick={() => setActiveTab(tab)} className="text-left w-full">
                  <h3 className="font-bold text-[#6B8E23]">{tab}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
                </button>
              </GlassCard>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Mentor</p>
              <p className="font-semibold text-[#556B2F] dark:text-[#9ACD32]">{profile?.mentorId || "—"}</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Psychologist</p>
              <p className="font-semibold text-[#556B2F] dark:text-[#9ACD32]">{profile?.psychologistId || "—"}</p>
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
          ) : <p className="text-gray-400">Loading profile...</p>}
        </GlassCard>
      );
      
      case "Diary": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Personal Diary 📓</h2>
          <p className="text-xs text-gray-500 mb-3">This is private — only you can see it.</p>
          <textarea
            value={diaryText}
            onChange={e => setDiaryText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-36 p-3 rounded-xl bg-white/40 dark:bg-white/10 outline-none resize-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
          />
          <button
            onClick={saveDiary}
            className="mt-2 px-6 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition text-sm font-semibold"
          >
            Save Entry
          </button>
          <div className="mt-6 space-y-3 max-h-80 overflow-y-auto">
            {diaryEntries.length === 0 && <p className="text-sm text-gray-400">No entries yet. Start writing!</p>}
            {diaryEntries.map((e, i) => (
              <div key={i} className="bg-white/50 dark:bg-gray-800 p-3 rounded-xl border-l-4 border-[#6B8E23]">
                <p className="text-xs text-gray-500">{e.date}</p>
                <p className="mt-1 text-sm">{e.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      );

      case "Chatbot": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-1 text-[#556B2F] dark:text-[#9ACD32]">Wellness Chatbot 🌿</h2>
          <p className="text-xs text-gray-500 mb-4">AI-powered mental wellness companion — available 24/7</p>
          <div className="h-80 overflow-y-auto space-y-3 mb-4 pr-2 bg-white/30 dark:bg-black/20 rounded-xl p-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${
                  m.role === "user"
                    ? "bg-[#6B8E23] text-white rounded-br-none"
                    : "bg-white dark:bg-gray-700 rounded-bl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {botLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl text-sm italic text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendToBot()}
              placeholder="How are you feeling today?"
              className="flex-1 p-2.5 rounded-full bg-white/60 dark:bg-white/10 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
            />
            <button
              onClick={sendToBot}
              className="px-5 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition font-semibold text-sm"
            >
              Send
            </button>
          </div>
        </GlassCard>
      );

      case "Mentor Chat": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-1 text-[#556B2F] dark:text-[#9ACD32]">
            Chat with Your Mentor
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Your assigned mentor: <span className="font-semibold text-[#6B8E23]">{profile?.mentorId}</span>
          </p>
          <div className="h-72 overflow-y-auto space-y-3 mb-4 bg-white/30 dark:bg-black/20 rounded-xl p-3">
            {mentorMessages.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-10">
                No messages yet. Say hello to your mentor!
              </p>
            )}
            {mentorMessages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${
                  m.from === "student"
                    ? "bg-[#6B8E23] text-white rounded-br-none"
                    : "bg-white dark:bg-gray-700 rounded-bl-none"
                }`}>
                  <p>{m.content}</p>
                  <p className="text-xs opacity-60 mt-1">{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={mentorChatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={mentorInput}
              onChange={e => setMentorInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMentorMessage()}
              placeholder="Message your mentor..."
              className="flex-1 p-2.5 rounded-full bg-white/60 dark:bg-white/10 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
            />
            <button
              onClick={sendMentorMessage}
              className="px-5 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition font-semibold text-sm"
            >
              Send
            </button>
          </div>
        </GlassCard>
      );

      case "Book Session": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-1 text-[#556B2F] dark:text-[#9ACD32]">Book a Session </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Request a session with your psychologist:{" "}
            <span className="font-semibold text-[#6B8E23]">{profile?.psychologistId}</span>
          </p>
          <input
            value={sessionForm.headline}
            onChange={e => setSessionForm({ ...sessionForm, headline: e.target.value })}
            placeholder="Session Headline (e.g. Feeling anxious about exams)"
            className="w-full p-2.5 mb-3 rounded-xl bg-white/40 dark:bg-white/10 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
          />
          <textarea
            value={sessionForm.description}
            onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
            placeholder="Describe what you'd like to discuss..."
            className="w-full h-28 p-3 rounded-xl bg-white/40 dark:bg-white/10 outline-none resize-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
          />
          <button
            onClick={bookSession}
            className="mt-3 px-6 py-2 bg-[#6B8E23] text-white rounded-full hover:scale-105 transition font-semibold text-sm"
          >
            Send RequesT
          </button>
        </GlassCard>
      );

      case "Resources": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Wellness Resources</h2>
          <div className="space-y-3">
            {resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800 hover:bg-[#e6f0d4] dark:hover:bg-[#556B2F]/50 transition">
                <span className="text-2xl">{r.emoji}</span>
                <span className="font-medium text-sm">{r.title}</span>
                <span className="ml-auto text-xs text-gray-400">▶ Watch</span>
              </a>
            ))}
          </div>
        </GlassCard>
      );

      case "Notifications": return (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-[#556B2F] dark:text-[#9ACD32]">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
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
              <p className="font-bold text-[#556B2F] dark:text-[#9ACD32] text-sm truncate">
                {profile?.name || "Student"}
              </p>
              <p className="text-xs text-gray-500 truncate">{studentId}</p>
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

        {/* Main Content */}
        <div className="flex-1">{renderTab()}</div>

      </div>
    </Layout>
  );
}

export default StudentDashboard;