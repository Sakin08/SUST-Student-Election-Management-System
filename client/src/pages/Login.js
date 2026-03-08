import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../config";
import axios from "axios";

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? formData
        : { email: formData.email, password: formData.password };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      login(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "একটি ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

      <div className="relative z-10 w-full max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image */}
          <div className="hidden md:block">
            <img
              src="/election1.png"
              alt="SUST Election"
              className="w-full h-auto rounded-3xl shadow-2xl"
            />
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 md:p-12 border border-slate-100 transition-all">
            {/* Logo/Icon Area */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200">
                <img
                  src="/sust-logo.png"
                  alt="SUST Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                SUST নির্বাচন
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                {showEmailLogin
                  ? isRegister
                    ? "নতুন একাউন্ট তৈরি করুন"
                    : "আপনার একাউন্টে লগইন করুন"
                  : "আপনার শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় ইমেইল দিয়ে লগইন করুন"}
              </p>
            </div>

            {!showEmailLogin ? (
              <>
                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 active:scale-[0.98] shadow-sm group"
                >
                  <svg
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google দিয়ে লগইন করুন
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-bold">
                      অথবা
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full py-4 px-6 rounded-2xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  📧 ইমেইল দিয়ে লগইন করুন
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {isRegister && (
                  <input
                    type="text"
                    placeholder="নাম"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                )}

                <input
                  type="email"
                  placeholder="ইমেইল (যেমন: 2021331008@student.sust.edu)"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                  {loading
                    ? "অপেক্ষা করুন..."
                    : isRegister
                      ? "রেজিস্টার করুন"
                      : "লগইন করুন"}
                </button>

                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    {isRegister
                      ? "ইতিমধ্যে একাউন্ট আছে? লগইন করুন"
                      : "নতুন একাউন্ট তৈরি করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(false)}
                    className="text-slate-500 hover:underline font-bold"
                  >
                    ফিরে যান
                  </button>
                </div>
              </form>
            )}

            {/* Information Note */}
            <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></div>
                <p className="text-xs text-blue-800 leading-relaxed font-semibold">
                  নিরাপত্তা নিশ্চিত করতে শুধুমাত্র{" "}
                  <span className="underline">@student.sust.edu</span> ডোমেইন
                  ভ্যালিড হিসেবে গণ্য হবে।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} SUST নির্বাচন কমিশন
        </p>
      </div>
    </div>
  );
};

export default Login;
