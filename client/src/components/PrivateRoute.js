import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  // --- MODERN LOADING UI ---
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Ring */}
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>

          {/* Inner Pulsing Dot (Branding) */}
          <div className="absolute w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-800 tracking-tight">
          লোড হচ্ছে...
        </h2>
        <p className="mt-2 text-slate-500 text-sm font-medium">
          আপনার তথ্য যাচাই করা হচ্ছে
        </p>
      </div>
    );
  }

  // --- LOGIC (UNTOUCHED) ---
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
