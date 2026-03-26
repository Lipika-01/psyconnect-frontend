function Footer() {
  return (
    <div className="mt-auto bg-white/60 dark:bg-black/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {"© 2026 PsyConnect | "}
        <a href="mailto:psyconnect@gmail.com" className="text-[#6B8E23] hover:underline">
          psyconnect@gmail.com
        </a>
        {" | Department of Information Technology | SLRTCE"}
      </p>
    </div>
  );
}

export default Footer;