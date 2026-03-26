import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE } from "../config";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", dob: "", gender: "", mobile: "", email: "",
    password: "", confirmPassword: "", role: "student", roleId: ""
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.roleId) {
      setError("Please fill in all required fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert("Account created! Please login");
        navigate("/login");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch {
      setError("Cannot connect to server");
    }
    setLoading(false);
  };

  const roleIdLabel = {
    student: "Student ID (e.g. SLRTCE/IT/TE001)",
    mentor: "Mentor ID (e.g. MENTOR01)",
    psychologist: "Psychologist ID (e.g. THERAPIST01)",
  };

  return (
    <Layout>
      <div className="flex items-center justify-center py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 dark:border-gray-700">

          <h2 className="text-3xl font-extrabold text-center text-[#556B2F] dark:text-[#9ACD32] mb-2">
            Create Account
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Join PsyConnect with your college ID
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Name & DOB */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Full Name *</label>
              <input name="name" placeholder="Your name" onChange={handle}
                className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Date of Birth</label>
              <input name="dob" type="date" onChange={handle}
                className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
            </div>
          </div>

          {/* Gender & Mobile */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Gender</label>
              <select name="gender" onChange={handle}
                className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Mobile</label>
              <input name="mobile" type="tel" placeholder="10-digit number" onChange={handle}
                className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">College Email *</label>
            <input name="email" type="email" placeholder="yourname@slrtce.in" onChange={handle}
              className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Password * (hidden)</label>
            <input name="password" type="password" placeholder="Create password" onChange={handle}
              className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
          </div>

          {/* Confirm Password */}
          <div className="mb-3 relative">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Confirm Password *</label>
            <input name="confirmPassword" type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password" onChange={handle}
              className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm pr-16" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-8 text-xs text-[#6B8E23] font-semibold">
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Signing up as *</label>
            <select name="role" onChange={handle}
              className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm">
              <option value="student">Student</option>
              <option value="mentor">Mentor / Faculty</option>
              <option value="psychologist">Psychologist / Therapist</option>
            </select>
          </div>

          {/* Role ID */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {roleIdLabel[form.role]} *
            </label>
            <input name="roleId" placeholder={roleIdLabel[form.role]} onChange={handle}
              className="w-full p-2.5 mt-1 rounded-xl bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#6B8E23] text-sm" />
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="w-full py-2.5 bg-[#6B8E23] hover:bg-[#556B2F] text-white rounded-full font-semibold transition hover:scale-105 shadow-lg disabled:opacity-60">
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm mt-5 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}
              className="text-[#6B8E23] font-semibold cursor-pointer hover:underline">
              Login
            </span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Signup;