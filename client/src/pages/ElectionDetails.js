import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CandidateDetailsModal from "./CandidateDetailsModal";
import VotingCountdown from "../components/VotingCountdown";

const ElectionDetails = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const [elecRes, posRes, candRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/elections/${id}`),
        axios.get(`http://localhost:5001/api/positions/election/${id}`),
        axios.get(`http://localhost:5001/api/candidates/election/${id}`),
      ]);
      setElection(elecRes.data);
      setPositions(posRes.data);
      setCandidates(candRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">
            তথ্য লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (!election)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-slate-500 font-bold text-lg">
            নির্বাচন পাওয়া যায়নি
          </p>
        </div>
      </div>
    );

  const getStatusConfig = (status) => {
    const configs = {
      created: { color: "bg-blue-500", label: "আবেদন চলছে", icon: "📝" },
      candidateFinalized: {
        color: "bg-indigo-500",
        label: "প্রার্থী চূড়ান্ত",
        icon: "✅",
      },
      voting: {
        color: "bg-emerald-500 animate-pulse",
        label: "ভোট চলছে",
        icon: "🗳️",
      },
      completed: { color: "bg-slate-500", label: "সম্পন্ন", icon: "🏆" },
    };
    return (
      configs[status] || { color: "bg-slate-400", label: status, icon: "📋" }
    );
  };

  const statusConfig = getStatusConfig(election.status);
  const totalCandidates = candidates.filter(
    (c) => c.status === "approved",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors group"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ড্যাশবোর্ডে ফিরে যান
        </Link>

        {/* Election Hero Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 mb-10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full opacity-30 blur-2xl"></div>

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg ${statusConfig.color}`}
              >
                <span className="text-lg">{statusConfig.icon}</span>
                {statusConfig.label}
              </span>
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {election.type === "hall"
                  ? "🏢 হল নির্বাচন"
                  : election.type === "society"
                    ? "🏛️ সোসাইটি নির্বাচন"
                    : "🎓 প্রধান নির্বাচন"}
              </span>
              {election.type === "society" && election.department && (
                <span className="px-4 py-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  🎓 {election.department}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
              {election.title}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="text-blue-600 font-black text-3xl mb-1">
                  {positions.length}
                </div>
                <div className="text-blue-500 text-xs font-bold uppercase tracking-wider">
                  মোট পদ
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                <div className="text-emerald-600 font-black text-3xl mb-1">
                  {totalCandidates}
                </div>
                <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider">
                  মোট প্রার্থী
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                <div className="text-amber-600 font-black text-xl mb-1">
                  {new Date(election.startDate).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-amber-500 text-xs font-bold uppercase tracking-wider">
                  শুরুর তারিখ
                </div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100">
                <div className="text-rose-600 font-black text-xl mb-1">
                  {new Date(election.endDate).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-rose-500 text-xs font-bold uppercase tracking-wider">
                  শেষের তারিখ
                </div>
              </div>
            </div>

            {/* Voting Time & Countdown */}
            {election.status === "voting" &&
              election.votingStartTime &&
              election.votingEndTime && (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 animate-pulse">
                        🗳️
                      </div>
                      <div>
                        <p className="text-emerald-900 font-black text-sm mb-1">
                          ভোটিং সময়: {election.votingStartTime} -{" "}
                          {election.votingEndTime}
                        </p>
                        <p className="text-emerald-600 text-xs">
                          নির্ধারিত সময়ের মধ্যে ভোট প্রদান করুন
                        </p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200">
                      <VotingCountdown election={election} />
                    </div>
                  </div>
                </div>
              )}

            {/* Application Fee Notice */}
            {election.applicationFee > 0 &&
              (election.type === "hall" ||
                election.type === "main" ||
                election.type === "society") && (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                    💳
                  </div>
                  <div>
                    <p className="text-purple-900 font-black text-sm mb-1">
                      আবেদন ফি: ৳{election.applicationFee}
                    </p>
                    <p className="text-purple-600 text-xs">
                      প্রার্থী হিসাবে আবেদন করতে এই পরিমাণ ফি প্রদান করতে হবে
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Positions Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
            প্রার্থী তালিকা
          </h2>
          <p className="text-slate-500 font-medium">
            সকল পদের জন্য অনুমোদিত প্রার্থীদের বিস্তারিত তথ্য
          </p>
        </div>

        <div className="space-y-8">
          {positions.map((position) => {
            const positionCandidates = candidates.filter(
              (c) =>
                c.positionId._id === position._id && c.status === "approved",
            );

            return (
              <div
                key={position._id}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Position Header */}
                <div
                  className={`px-8 py-6 ${position.isHallSpecific ? "bg-gradient-to-r from-amber-500 to-orange-500" : position.isDepartmentSpecific ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                        {position.isHallSpecific
                          ? "🏢"
                          : position.isDepartmentSpecific
                            ? "🏛️"
                            : "🎓"}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">
                          {position.title}
                        </h3>
                        <p className="text-white/80 text-sm font-medium mt-1">
                          {position.isHallSpecific
                            ? "হল-নির্দিষ্ট পদ"
                            : position.isDepartmentSpecific
                              ? "বিভাগ-নির্দিষ্ট পদ"
                              : "সাধারণ পদ"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
                      <div className="text-white font-black text-2xl">
                        {positionCandidates.length}
                      </div>
                      <div className="text-white/80 text-xs font-bold">
                        প্রার্থী
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="p-6">
                  {positionCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {positionCandidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          onClick={() => setSelectedCandidate(candidate)}
                          className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer"
                        >
                          {/* Photo */}
                          {candidate.candidatePhoto ? (
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-3 border-white shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                              <img
                                src={candidate.candidatePhoto}
                                alt={candidate.studentId.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl flex-shrink-0">
                              {candidate.studentId.name?.charAt(0)}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors mb-2 leading-tight">
                              {candidate.studentId.name}
                            </h4>
                            <div className="space-y-1.5 mb-3">
                              <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                                <span className="text-blue-500">🆔</span>
                                {candidate.studentId.registrationNumber}
                              </p>
                              <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                                <span className="text-emerald-500">🎓</span>
                                {candidate.studentId.department}
                              </p>
                              {candidate.panelId && (
                                <p className="text-sm font-black text-blue-600 flex items-center gap-1.5 mt-2">
                                  <span>🚩</span> {candidate.panelId.name}
                                </p>
                              )}
                            </div>

                            {/* Manifesto */}
                            {candidate.manifesto && (
                              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                                <p className="text-xs text-slate-600 italic line-clamp-3 leading-relaxed">
                                  "{candidate.manifesto}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                        📭
                      </div>
                      <p className="text-slate-400 font-bold text-lg">
                        কোনো অনুমোদিত প্রার্থী নেই
                      </p>
                      <p className="text-slate-300 text-sm mt-1">
                        এই পদের জন্য এখনও কোনো প্রার্থী অনুমোদিত হয়নি
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default ElectionDetails;
