import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE } from "../config";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!userId || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();

      // Store userId in localStorage
      localStorage.setItem("userId", userId);

      // URL-safe ID (replace / with -)
      const safeId = userId.replace(/\//g, "-");

      if (data.role === "student") {
        navigate(`/student/${safeId}`);
      } else if (data.role === "mentor") {
        navigate(`/mentor/${safeId}`);
      } else if (data.role === "psychologist") {
        navigate(`/psychologist/${safeId}`);
      } else {
        setError("Invalid ID or password");
      }
    } catch {
      setError("Cannot connect to server");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-sm border border-white/50 dark:border-gray-700">

          <h2 className="text-3xl font-extrabold text-center text-[#556B2F] dark:text-[#9ACD32] mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Login to your PsyConnect account
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
              {error}
            </p>
          )}

          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            User ID
          </label>
          <input
            className="w-full p-2.5 mt-1 mb-4 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
            placeholder="e.g. SLRTCE/IT/TE001 or MENTOR01"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            className="w-full p-2.5 mt-1 mb-6 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-[#6B8E23] hover:bg-[#556B2F] text-white rounded-full font-semibold transition hover:scale-105 shadow-lg disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm mt-5 text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-[#6B8E23] font-semibold cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Login;