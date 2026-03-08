import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthSuccess = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("AuthSuccess: Token received:", token ? "Yes" : "No");
    if (token) {
      console.log("AuthSuccess: Logging in with token");
      login(token);
      navigate("/");
    } else {
      console.log("AuthSuccess: No token, redirecting to login");
      navigate("/login");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      {/* Success Animation Container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Glowing Ring */}
        <div className="absolute w-24 h-24 bg-emerald-100 rounded-full animate-ping opacity-20"></div>

        {/* Inner Circle with Icon */}
        <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 animate-bounce">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Textual Feedback */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          সাফল্যের সাথে যাচাই করা হয়েছে!
        </h2>
        <p className="mt-3 text-slate-500 font-medium animate-pulse">
          আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
        </p>
      </div>

      {/* Decorative Bottom Element */}
      <div className="fixed bottom-10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-widest uppercase">
          <div className="w-8 h-px bg-slate-200"></div>
          SUST নির্বাচন সিকিউরিটি
          <div className="w-8 h-px bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
