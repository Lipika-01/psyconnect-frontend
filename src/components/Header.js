import { useState, useEffect } from "react";

function Header() {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <header className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="PsyConnect Logo"
          className="w-10 h-10 rounded-full object-cover shadow"
        />
        <div>
          <h1 className="text-xl font-bold text-[#556B2F] dark:text-[#9ACD32] leading-tight">
            PsyConnect
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your Mental Health Companion
          </p>
        </div>
      </div>

      <button
        onClick={() => setDark(!dark)}
        className="px-4 py-1.5 rounded-full bg-[#6B8E23] hover:bg-[#556B2F] text-white text-sm font-medium transition hover:scale-105 shadow"
      >
        {dark ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
}

export default Header;