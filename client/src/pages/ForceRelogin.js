import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ForceRelogin = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear everything
    logout();
    localStorage.clear();
    sessionStorage.clear();

    // Wait a bit then redirect to login
    setTimeout(() => {
      navigate("/login");
      window.location.reload();
    }, 1000);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Logging out...
        </h2>
        <p className="text-slate-600">
          Please log in again to refresh your session
        </p>
      </div>
    </div>
  );
};

export default ForceRelogin;
