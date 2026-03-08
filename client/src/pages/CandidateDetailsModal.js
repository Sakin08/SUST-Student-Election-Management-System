import { useEffect } from "react";

const CandidateDetailsModal = ({ candidate, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>

          <div className="flex items-start gap-6">
            {candidate.candidatePhoto ? (
              <img
                src={candidate.candidatePhoto}
                alt={candidate.studentId?.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black border-4 border-white/30">
                {candidate.studentId?.name?.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-3xl font-black mb-2">
                {candidate.studentId?.name}
              </h2>
              <p className="text-blue-100 text-lg font-bold mb-1">
                {candidate.positionId?.title}
              </p>
              {candidate.panelId && (
                <p className="text-white/80 text-sm">
                  🚩 প্যানেল: {candidate.panelId.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Student Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              শিক্ষার্থী তথ্য
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
              <div>
                <p className="text-sm text-slate-500 font-bold mb-1">
                  রেজিস্ট্রেশন নম্বর
                </p>
                <p className="text-slate-900 font-bold">
                  {candidate.studentId?.registrationNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold mb-1">ব্যাচ</p>
                <p className="text-slate-900 font-bold">
                  {candidate.studentId?.batch}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold mb-1">বিভাগ</p>
                <p className="text-slate-900 font-bold">
                  {candidate.studentId?.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold mb-1">হল</p>
                <p className="text-slate-900 font-bold">
                  {candidate.studentId?.hall}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500 font-bold mb-1">ইমেইল</p>
                <p className="text-slate-900 font-bold">
                  {candidate.studentId?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Manifesto */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              ইশতেহার (Manifesto)
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {candidate.manifesto || "কোনো ইশতেহার প্রদান করা হয়নি"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm text-slate-500 font-bold mb-1">
                আবেদনের স্ট্যাটাস
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  candidate.status === "approved"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : candidate.status === "rejected"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {candidate.status === "approved"
                  ? "✓ অনুমোদিত"
                  : candidate.status === "rejected"
                    ? "✕ প্রত্যাখ্যাত"
                    : "⏳ অপেক্ষমাণ"}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-bold mb-1">
                আবেদনের তারিখ
              </p>
              <p className="text-slate-900 font-bold">
                {new Date(candidate.createdAt).toLocaleDateString("bn-BD")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
