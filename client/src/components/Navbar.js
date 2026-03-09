import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const links = [
    { path: "/", label: "ড্যাশবোর্ড", icon: "🏠" },
    { path: "/candidate-profile", label: "প্রার্থী প্রোফাইল", icon: "📋" },
  ];

  if (user.role === "admin" || user.role === "superadmin") {
    links.splice(1, 0, {
      path: "/admin",
      label: "অ্যাডমিন",
      icon: user.role === "superadmin" ? "👑" : "🔑",
    });
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-white/95 border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl shadow-md shadow-slate-200/50 flex items-center justify-center border border-slate-100"
              >
                <img
                  src="/sust-logo.png"
                  alt="logo"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </motion.div>

              <div className="flex flex-col leading-tight">
                <div className="text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SUST নির্বাচন
                </div>
                <div className="hidden sm:block text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                  Election Portal
                </div>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-2">
              {/* Navigation Links */}
              <div className="flex items-center gap-1">
                {links.map((link) => {
                  const active = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 lg:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{link.icon}</span>
                        <span>{link.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-slate-200 mx-2"></div>

              {/* USER PROFILE */}
              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-slate-200">
                      {user.name?.charAt(0)}
                    </div>
                  )}

                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-700 leading-tight">
                      {user.name?.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {user.registrationNumber}
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* ROLE BADGE */}
              <div
                className={`px-2.5 py-1 text-[10px] font-bold text-white rounded-md ${
                  user.role === "superadmin"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : user.role === "admin"
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500"
                      : "bg-gradient-to-r from-slate-500 to-slate-600"
                }`}
              >
                {user.role === "superadmin" ? "SUPER" : user.role.toUpperCase()}
              </div>

              {/* LOGOUT */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="ml-1 px-4 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden lg:inline">লগআউট</span>
                </span>
              </motion.button>
            </div>

            {/* MOBILE BUTTON */}
            <div className="md:hidden flex items-center gap-2">
              {/* User Avatar */}
              <Link to="/profile">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-slate-200">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </Link>

              {/* Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl z-[120] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
                    <img
                      src="/sust-logo.png"
                      alt="logo"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-white font-bold text-sm">মেনু</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              <div className="p-4">
                {/* USER PROFILE CARD */}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 mb-6 hover:shadow-md transition-shadow"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow">
                      {user.name?.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {user.registrationNumber}
                    </div>
                    <div
                      className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-white rounded ${
                        user.role === "superadmin"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : user.role === "admin"
                            ? "bg-gradient-to-r from-indigo-500 to-blue-500"
                            : "bg-gradient-to-r from-slate-500 to-slate-600"
                      }`}
                    >
                      {user.role === "superadmin"
                        ? "SUPER ADMIN"
                        : user.role.toUpperCase()}
                    </div>
                  </div>

                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                {/* NAVIGATION LINKS */}
                <div className="space-y-1 mb-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                    নেভিগেশন
                  </div>
                  {links.map((link) => {
                    const active = location.pathname === link.path;

                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.label}</span>
                        {active && (
                          <svg
                            className="w-4 h-4 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* LOGOUT BUTTON */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-200 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>লগআউট</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
