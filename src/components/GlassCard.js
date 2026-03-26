function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export default GlassCard;