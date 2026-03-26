import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Home", path: "/" },
    { label: "Login", path: "/login" },
    { label: "Signup", path: "/signup" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-2 flex gap-6 justify-center shadow-sm">
      {links.map(({ label, path }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`text-sm font-medium px-3 py-1.5 rounded-full transition ${
            location.pathname === path
              ? "bg-[#6B8E23] text-white"
              : "text-gray-700 dark:text-gray-300 hover:text-[#6B8E23] dark:hover:text-[#9ACD32]"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export default Navbar;