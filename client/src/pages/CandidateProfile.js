import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const CandidateProfile = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/api/candidates/my-applications",
      );
      setApplications(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: "⏳",
        label: "অপেক্ষমাণ",
      },
      approved: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: "✓",
        label: "অনুমোদিত",
      },
      rejected: {
        color: "bg-rose-100 text-rose-700 border-rose-200",
        icon: "✕",
        label: "প্রত্যাখ্যাত",
      },
    };
    return configs[status] || configs.pending;
  };

  const getElectionStatusBadge = (status) => {
    const configs = {
      created: { color: "bg-blue-500", label: "আবেদন চলছে" },
      candidateFinalized: {
        color: "bg-indigo-500",
        label: "প্রার্থী চূড়ান্ত",
      },
      voting: { color: "bg-emerald-500", label: "ভোট চলছে" },
      completed: { color: "bg-slate-500", label: "সম্পন্ন" },
    };
    return configs[status] || { color: "bg-slate-400", label: status };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse text-sm">
            তথ্য লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 mb-8 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                প্রার্থী প্রোফাইল
              </h1>
              <p className="text-slate-500 font-bold mt-1">
                {user?.name} • {user?.registrationNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-600">🏢 হল:</span>
              <span className="text-slate-700 font-medium">
                {user?.hall || "নির্বাচন করা হয়নি"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-600">🎓 বিভাগ:</span>
              <span className="text-slate-700 font-medium">
                {user?.department}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-600">📅 ব্যাচ:</span>
              <span className="text-slate-700 font-medium">{user?.batch}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            আমার আবেদনসমূহ
            <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {applications.length}
            </span>
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              📋
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">
              কোনো আবেদন পাওয়া যায়নি
            </h3>
            <p className="text-slate-400 font-medium mb-6">
              আপনি এখনও কোনো নির্বাচনে প্রার্থী হিসাবে আবেদন করেননি
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              নির্বাচন দেখুন
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              const electionStatus = getElectionStatusBadge(
                application.electionId?.status,
              );

              return (
                <div
                  key={application._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Status Header Bar */}
                  <div className={`h-2 w-full ${electionStatus.color}`}></div>

                  <div className="p-6">
                    {/* Election Info with Photo */}
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {application.candidatePhoto && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-200 shadow-md flex-shrink-0">
                            <img
                              src={application.candidatePhoto}
                              alt="Candidate"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">
                            {application.electionId?.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">
                            {application.electionId?.type === "hall"
                              ? "🏢 হল নির্বাচন"
                              : "🎓 প্রধান নির্বাচন"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${electionStatus.color}`}
                      >
                        {electionStatus.label}
                      </span>
                    </div>

                    {/* Position & Panel */}
                    <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">📌 পদ:</span>
                        <span className="font-bold text-slate-800">
                          {application.positionId?.title}
                        </span>
                        {application.positionId?.isHallSpecific && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                            হল-নির্দিষ্ট
                          </span>
                        )}
                      </div>
                      {application.panelId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">
                            🚩 প্যানেল:
                          </span>
                          <span className="font-bold text-blue-600">
                            {application.panelId.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">
                            🚩 প্যানেল:
                          </span>
                          <span className="font-bold text-slate-500 italic">
                            স্বতন্ত্র
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Manifesto */}
                    <div className="mb-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        ইশতেহার
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed italic bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        "{application.manifesto}"
                      </p>
                    </div>

                    {/* Application Status */}
                    <div
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 ${statusConfig.color}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${statusConfig.color}`}
                        >
                          {statusConfig.icon}
                        </div>
                        <div>
                          <p className="font-black text-sm">আবেদনের অবস্থা</p>
                          <p className="text-xs font-bold opacity-80">
                            {statusConfig.label}
                          </p>
                        </div>
                      </div>
                      {application.approvedBy && (
                        <div className="text-right">
                          <p className="text-[10px] font-bold opacity-60">
                            অনুমোদনকারী
                          </p>
                          <p className="text-xs font-bold">
                            {application.approvedBy.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                      <span>
                        আবেদনের তারিখ:{" "}
                        {new Date(application.createdAt).toLocaleDateString(
                          "bn-BD",
                        )}
                      </span>
                      {application.approvedAt && (
                        <span>
                          অনুমোদনের তারিখ:{" "}
                          {new Date(application.approvedAt).toLocaleDateString(
                            "bn-BD",
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
