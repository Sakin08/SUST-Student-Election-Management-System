import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const CandidateApplication = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [panels, setPanels] = useState([]);
  const [formData, setFormData] = useState({
    positionId: "",
    panelId: "",
    manifesto: "",
  });
  const [candidatePhoto, setCandidatePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const fetchData = async () => {
    try {
      const [elecRes, posRes, panelRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/elections/${electionId}`),
        axios.get(`http://localhost:5001/api/positions/election/${electionId}`),
        axios.get(`http://localhost:5001/api/panels/election/${electionId}`),
      ]);
      setElection(elecRes.data);
      setPositions(posRes.data);
      setPanels(panelRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

      setCandidatePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("positionId", formData.positionId);
    submitData.append("electionId", electionId);
    submitData.append("panelId", formData.panelId || "");
    submitData.append("manifesto", formData.manifesto);
    if (candidatePhoto) {
      submitData.append("candidatePhoto", candidatePhoto);
    }

    try {
      await axios.post("http://localhost:5001/api/candidates", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("আবেদন সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "আবেদন জমা ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Decorative Header Card */}
        <div className="bg-blue-600 rounded-t-3xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-black tracking-tight mb-2">
            প্রার্থী হিসাবে আবেদন
          </h2>
          <p className="text-blue-100 font-medium">
            আপনার তথ্য এবং ইশতেহার যত্নসহকারে প্রদান করুন।
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-b-3xl shadow-xl border-x border-b border-slate-100 p-8 md:p-12 transition-all">
          {/* Department Restriction Warning for Society Elections */}
          {election?.type === "society" &&
            election?.department !== user?.department && (
              <div className="mb-8 p-5 rounded-xl bg-rose-50 border-2 border-rose-200 flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <p className="text-rose-800 font-black text-sm mb-1">
                    আপনি এই নির্বাচনে আবেদন করতে পারবেন না
                  </p>
                  <p className="text-rose-600 text-sm">
                    এটি একটি সোসাইটি নির্বাচন শুধুমাত্র{" "}
                    <span className="font-bold">{election?.department}</span>{" "}
                    বিভাগের শিক্ষার্থীদের জন্য। আপনার বিভাগ:{" "}
                    <span className="font-bold">{user?.department}</span>
                  </p>
                </div>
              </div>
            )}

          {/* Department Match Info for Society Elections */}
          {election?.type === "society" &&
            election?.department === user?.department && (
              <div className="mb-8 p-5 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-blue-800 font-black text-sm mb-1">
                    আপনি এই সোসাইটি নির্বাচনে আবেদন করতে পারবেন
                  </p>
                  <p className="text-blue-600 text-sm">
                    এটি{" "}
                    <span className="font-bold">{election?.department}</span>{" "}
                    বিভাগের সোসাইটি নির্বাচন এবং আপনি এই বিভাগের শিক্ষার্থী।
                  </p>
                </div>
              </div>
            )}

          {message && (
            <div
              className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
                message.includes("সফল")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${message.includes("সফল") ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Position Select */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors">
                পদ নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <select
                name="positionId"
                value={formData.positionId}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">পদ নির্বাচন করুন</option>
                {positions.map((pos) => (
                  <option key={pos._id} value={pos._id}>
                    {pos.title} {pos.isHallSpecific && "(হল-নির্দিষ্ট)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Panel Select - Hide for society elections */}
            {election?.type !== "society" && (
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors">
                  প্যানেল (ঐচ্ছিক)
                </label>
                <select
                  name="panelId"
                  value={formData.panelId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">স্বতন্ত্র</option>
                  {panels.map((panel) => (
                    <option key={panel._id} value={panel._id}>
                      {panel.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  আপনি কোনো নির্দিষ্ট প্যানেলের সদস্য না হলে 'স্বতন্ত্র'
                  নির্বাচন করুন।
                </p>
              </div>
            )}

            {/* Manifesto Textarea */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors">
                ইশতেহার / উদ্দেশ্য <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="manifesto"
                value={formData.manifesto}
                onChange={handleChange}
                rows="6"
                required
                placeholder="আপনার পরিকল্পনা এবং ভোটারদের প্রতি আপনার লক্ষ্যসমূহ বিস্তারিত লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Candidate Photo Upload */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                প্রার্থীর ছবি (ঐচ্ছিক)
              </label>
              <div className="flex items-center gap-6">
                {photoPreview && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-bold text-slate-600">
                      ছবি আপলোড করুন
                    </p>
                    <p className="text-xs text-slate-400 mt-1">সর্বোচ্চ ৫ MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                এই ছবিটি নির্বাচনের সময় ব্যালট পেপারে প্রদর্শিত হবে।
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  (election?.type === "society" &&
                    election?.department !== user?.department) ||
                  isSubmitting
                }
                className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  (election?.type === "society" &&
                    election?.department !== user?.department) ||
                  isSubmitting
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    আবেদন জমা দিন
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-slate-400 text-xs font-medium">
          সঠিক তথ্য প্রদান না করলে আবেদন বাতিল বলে গণ্য হবে।
        </p>
      </div>
    </div>
  );
};

export default CandidateApplication;
