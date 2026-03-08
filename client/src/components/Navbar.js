import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-black text-blue-700 tracking-tighter hover:opacity-90 transition-opacity"
          >
            <img
              src="/sust-logo.png"
              alt="SUST Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="hidden sm:inline">SUST নির্বাচন</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              ড্যাশবোর্ড
            </Link>

            {(user.role === "admin" || user.role === "superadmin") && (
              <Link
                to="/admin"
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                অ্যাডমিন
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            )}

            <Link
              to="/candidate-profile"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              প্রার্থী প্রোফাইল
            </Link>

            <Link
              to="/profile"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              প্রোফাইল
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-4 px-6 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-full border border-red-100 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all duration-300 active:scale-95"
            >
              লগআউট
            </button>
          </div>

          {/* Mobile indicator (Optional: visible only on small screens) */}
          <div className="md:hidden">
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
