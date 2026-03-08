import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  // Define nav links dynamically
  const links = [
    { path: "/", label: "🏠 ড্যাশবোর্ড" },
    { path: "/candidate-profile", label: "📋 প্রার্থী প্রোফাইল" },
  ];

  if (user.role === "admin" || user.role === "superadmin") {
    links.splice(1, 0, {
      path: "/admin",
      label: user.role === "superadmin" ? "👑 অ্যাডমিন" : "🔑 অ্যাডমিন",
    });
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">

          {/* LOGO + Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border"
            >
              <img
                src="/sust-logo.png"
                alt="logo"
                className="w-9 h-9 object-contain"
              />
            </motion.div>

            {/* Modern Title */}
            <div className="hidden sm:flex flex-col leading-tight">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
              >
                SUST নির্বাচন
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-semibold text-slate-400 tracking-[0.25em] uppercase"
              >
                Student Election Management System
              </motion.div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-2 relative">

            {links.map((link) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
                >
                  {link.label}

                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute left-0 right-0 -bottom-1 h-[3px] bg-blue-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* USER PROFILE CARD */}
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="ml-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0)}
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-700">
                    {user.name?.split(" ")[0]}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold">
                    {user.registrationNumber}
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* ROLE BADGE */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="ml-2 px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"
            >
              {user.role}
            </motion.div>

            {/* LOGOUT */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="ml-3 px-5 py-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-rose-500 to-red-600 shadow-lg"
            >
              🚪 লগআউট
            </motion.button>
          </div>

          {/* MOBILE */}
          <div className="md:hidden flex items-center gap-3">
            <div className="text-xs px-3 py-1 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 font-bold">
              {user.role}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold"
            >
              🚪
            </button>
          </div>

        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;