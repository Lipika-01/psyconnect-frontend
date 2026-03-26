import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";

function Logout() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Clear the user session data
    localStorage.clear();

    // Handle the visual countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect to home page after 3 seconds
    const redirect = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center p-10 w-full max-w-sm flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#556B2F] dark:text-[#9ACD32] mb-2">
            Logged Out
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            You have successfully logged out of PsyConnect. Have a great day!
          </p>
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full inline-block">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Redirecting to Home in <span className="text-[#6B8E23] font-bold text-base">{countdown}</span> seconds...
            </p>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default Logout;