import React, { useState, useContext } from "react";
import { API_URL } from "../config";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    hall: user?.hall || "None",
    bio: user?.bio || "",
    socialLinks: {
      facebook: user?.socialLinks?.facebook || "",
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
    },
  });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    user?.profilePhoto || null,
  );

  const halls = [
    "Shah Paran Hall",
    "Bijoy 24 Hall",
    "Syed Mujtaba Ali Hall",
    "Ayesha Siddiqa Hall",
    "Begum Sirajunnesa Chowdhury Hall",
    "Fatimah Tuz Zahra Hall",
    "None",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const socialKey = name.replace("social_", "");
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/users/profile`, formData);
      setMessage("প্রোফাইল আপডেট সফল হয়েছে");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("আপডেট ব্যর্থ হয়েছে");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("ফাইল সাইজ ৫ MB এর বেশি হতে পারবে না");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("শুধুমাত্র ছবি ফাইল আপলোড করুন");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const res = await axios.post(
        `${API_URL}/api/users/profile-photo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setProfilePhotoPreview(res.data.photoUrl);
      setMessage("ছবি সফলভাবে আপলোড হয়েছে");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-blue-200 overflow-hidden">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
              <span className="text-white text-xs font-bold">📷 পরিবর্তন</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {user?.name}
            </h1>
            <p className="text-sm sm:text-base text-blue-600 font-bold">
              {user?.department} • {user?.batch} ব্যাচ
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.includes("সফল")
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* Read-Only Academic Info */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-slate-100/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">
                প্রাতিষ্ঠানিক তথ্য
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "রেজিস্ট্রেশন নম্বর",
                    value: user?.registrationNumber,
                  },
                  { label: "ইমেইল", value: user?.email },
                  { label: "বিভাগ", value: user?.department || "N/A" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-slate-800 break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editable Personal Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  আপনার হল *
                </label>
                <select
                  name="hall"
                  value={formData.hall}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-medium"
                >
                  {halls.map((hall) => (
                    <option key={hall} value={hall}>
                      {hall}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  বায়ো / ছোট বিবরণ
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">
                সোশ্যাল লিংক
              </h3>
              <div className="space-y-4">
                {[
                  {
                    id: "facebook",
                    label: "Facebook",
                    placeholder: "https://facebook.com/...",
                  },
                  {
                    id: "twitter",
                    label: "Twitter",
                    placeholder: "https://twitter.com/...",
                  },
                  {
                    id: "linkedin",
                    label: "LinkedIn",
                    placeholder: "https://linkedin.com/in/...",
                  },
                ].map((social) => (
                  <div
                    key={social.id}
                    className="relative flex items-center group"
                  >
                    <div className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors font-bold text-xs uppercase">
                      {social.id.charAt(0)}
                    </div>
                    <input
                      type="url"
                      name={`social_${social.id}`}
                      value={formData.socialLinks[social.id]}
                      onChange={handleChange}
                      placeholder={social.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.99] text-sm sm:text-base"
            >
              প্রোফাইল আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
