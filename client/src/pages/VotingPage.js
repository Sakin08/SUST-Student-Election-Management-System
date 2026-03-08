import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import CandidateDetailsModal from "./CandidateDetailsModal";

const VotingPage = () => {
  const { electionId } = useParams();
  const { user } = useContext(AuthContext);
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [votedPositions, setVotedPositions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const fetchData = async () => {
    try {
      const [elecRes, posRes, candRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/elections/${electionId}`),
        axios.get(`http://localhost:5001/api/positions/election/${electionId}`),
        axios.get(
          `http://localhost:5001/api/candidates/election/${electionId}`,
        ),
      ]);
      setElection(elecRes.data);
      setAllPositions(posRes.data);
      setPositions(posRes.data);
      setCandidates(candRes.data.filter((c) => c.status === "approved"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (positionId, candidateId) => {
    setSelectedVotes({ ...selectedVotes, [positionId]: candidateId });
  };

  const submitVote = async (positionId) => {
    const candidateId = selectedVotes[positionId];
    if (!candidateId) {
      setMessage("দয়া করে একজন প্রার্থী নির্বাচন করুন");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/votes", {
        candidateId,
        positionId,
        electionId,
      });
      setMessage("✅ ভোট সফলভাবে প্রদান করা হয়েছে");
      setTimeout(() => setMessage(""), 3000);

      setVotedPositions([...votedPositions, positionId]);
      setPositions(positions.filter((p) => p._id !== positionId));

      const newSelectedVotes = { ...selectedVotes };
      delete newSelectedVotes[positionId];
      setSelectedVotes(newSelectedVotes);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "❌ ভোট প্রদান ব্যর্থ হয়েছে",
      );
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse text-sm">
            ব্যালট পেপার লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Department Restriction Warning for Society Elections */}
        {election?.type === "society" &&
          election?.department !== user?.department && (
            <div className="mb-8 p-6 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-4 shadow-lg">
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                ⚠️
              </div>
              <div>
                <p className="text-rose-800 font-black text-lg mb-2">
                  আপনি এই নির্বাচনে ভোট দিতে পারবেন না
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

        {/* Header with Progress */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              গোপন ব্যালট 🗳️
            </h1>
            <p className="text-slate-500 font-medium">
              প্রতিটি পদের জন্য আপনার পছন্দের প্রার্থী নির্বাচন করে ভোট দিন
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  ভোটিং অগ্রগতি
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  সব পদে ভোট দিতে হবে
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-600">
                  {votedPositions.length}/{allPositions.length}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase">
                  সম্পন্ন
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${allPositions.length > 0 ? (votedPositions.length / allPositions.length) * 100 : 0}%`,
                }}
              ></div>
            </div>

            {/* Status Text */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {votedPositions.length === allPositions.length &&
              allPositions.length > 0 ? (
                <span className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  সকল পদে ভোট প্রদান সম্পন্ন হয়েছে!
                </span>
              ) : (
                <span className="text-amber-600 font-bold text-sm flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  আরও {allPositions.length - votedPositions.length}টি পদে ভোট
                  দিতে হবে
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.includes("সফল")
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-rose-500 text-white border-rose-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* All Votes Complete State */}
        {positions.length === 0 && allPositions.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2.5rem] p-16 text-center border-2 border-emerald-200 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-2xl shadow-emerald-200 animate-bounce">
              ✓
            </div>
            <h2 className="text-3xl font-black text-emerald-900 mb-3">
              সকল ভোট সফলভাবে প্রদান করা হয়েছে!
            </h2>
            <p className="text-emerald-700 font-bold text-lg mb-6">
              আপনি {allPositions.length}টি পদের সবগুলোতে ভোট দিয়েছেন
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-emerald-300 shadow-lg">
              <span className="text-emerald-600 font-black text-sm">
                🔒 আপনার ভোট নিরাপদে সংরক্ষিত হয়েছে
              </span>
            </div>
          </div>
        )}

        {/* Voting Sections */}
        <div className="space-y-12">
          {positions.map((position, index) => {
            const positionCandidates = candidates.filter(
              (c) =>
                c.positionId._id === position._id &&
                (!position.isHallSpecific || c.hall === user.hall),
            );

            return (
              <section
                key={position._id}
                className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl"
              >
                {/* Position Title Bar */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl border border-white/20">
                      {position.isHallSpecific ? "🏢" : "🎓"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">
                        {position.title}
                      </h2>
                      <p className="text-white/70 text-sm font-medium mt-1">
                        {position.isHallSpecific
                          ? "হল-নির্দিষ্ট পদ"
                          : "সাধারণ পদ"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-white font-black text-sm">
                      পদ #{index + 1}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {positionCandidates.map((candidate) => {
                      const isSelected =
                        selectedVotes[position._id] === candidate._id;

                      return (
                        <div
                          key={candidate._id}
                          onClick={() =>
                            handleVote(position._id, candidate._id)
                          }
                          className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 ring-4 ring-blue-100 shadow-lg"
                              : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white hover:shadow-md"
                          }`}
                        >
                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl animate-in zoom-in border-4 border-white">
                              <svg
                                className="w-5 h-5"
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
                          )}

                          {/* Candidate Photo and Info */}
                          <div className="flex items-start gap-4 mb-4">
                            {candidate.candidatePhoto ? (
                              <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                                <img
                                  src={candidate.candidatePhoto}
                                  alt={candidate.studentId.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
                                {candidate.studentId.name?.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-lg font-black mb-2 transition-colors leading-tight ${isSelected ? "text-blue-700" : "text-slate-800"}`}
                              >
                                {candidate.studentId.name}
                              </h3>
                              <div className="space-y-1.5">
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <span className="text-blue-500">🆔</span>
                                  {candidate.studentId.registrationNumber}
                                </p>
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <span className="text-emerald-500">🎓</span>
                                  {candidate.studentId.department}
                                </p>
                                {candidate.panelId && (
                                  <p className="text-sm font-black text-blue-600 flex items-center gap-1.5 mt-2">
                                    <span>🚩</span> {candidate.panelId.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Manifesto */}
                          <div className="mt-auto pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                              "{candidate.manifesto}"
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(candidate);
                              }}
                              className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              📄 বিস্তারিত দেখুন
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                      {selectedVotes[position._id]
                        ? "✅ প্রার্থী নির্বাচন করা হয়েছে। এখন ভোট নিশ্চিত করুন।"
                        : "⚠️ ভোট প্রদানের জন্য একজন প্রার্থী নির্বাচন করুন।"}
                    </p>
                    <button
                      onClick={() => submitVote(position._id)}
                      disabled={!selectedVotes[position._id]}
                      className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg ${
                        selectedVotes[position._id]
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-blue-200"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      ভোট নিশ্চিত করুন
                      <svg
                        className="w-5 h-5"
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
                    </button>
                  </div>
                </div>
              </section>
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

export default VotingPage;
