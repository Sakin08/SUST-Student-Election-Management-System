import { useState, useEffect, useContext } from "react";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import VotingCountdown from "../components/VotingCountdown";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [electionsWithHall, setElectionsWithHall] = useState([]); // Store elections with hall info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchElections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/elections`);
      console.log("All elections:", res.data);
      console.log("User department:", user?.department);
      console.log("User batch:", user?.batch);
      console.log("User role:", user?.role);

      // Admins can see all elections without filtering
      if (user?.role === "admin" || user?.role === "superadmin") {
        const allElectionsData = res.data.map((election) => ({
          election,
          show: true,
          voterHall: null,
        }));
        setElectionsWithHall(allElectionsData);
        setElections(res.data);
        console.log("Admin view: Showing all elections");
        setLoading(false);
        return;
      }

      // Filter elections based on type and eligibility for regular students
      const eligibilityChecks = await Promise.all(
        res.data.map(async (election) => {
          // For hall elections, check if user is in eligible voters list
          if (election.type === "hall") {
            try {
              const eligibilityRes = await axios.get(
                `${API_URL}/api/eligible-voters/${election._id}/check-eligibility`,
              );
              return {
                election,
                show: eligibilityRes.data.eligible,
                voterHall: eligibilityRes.data.hall || null, // Store hall from admin input
              };
            } catch (error) {
              console.error("Eligibility check error:", error);
              return { election, show: false, voterHall: null }; // Don't show if check fails
            }
          }

          // For society elections, check department match
          if (election.type === "society") {
            console.log(
              "Society election:",
              election.title,
              "Department:",
              election.department,
              "Match:",
              election.department === user?.department,
            );
            return {
              election,
              show: election.department === user?.department,
              voterHall: null,
            };
          }

          // For CR elections, check department and batch match
          if (election.type === "cr") {
            console.log(
              "CR election:",
              election.title,
              "Department:",
              election.department,
              "Batch:",
              election.batch,
              "Match:",
              election.department === user?.department &&
                election.batch === user?.batch,
            );
            return {
              election,
              show:
                election.department === user?.department &&
                election.batch === user?.batch,
              voterHall: null,
            };
          }

          // Show all main elections
          return { election, show: true, voterHall: null };
        }),
      );

      const filteredData = eligibilityChecks.filter((item) => item.show);
      const filteredElections = filteredData.map((item) => item.election);

      // Store elections with hall info
      setElectionsWithHall(filteredData);
      setElections(filteredElections);

      console.log("Filtered elections:", filteredElections);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      created: { color: "bg-blue-500", label: "আবেদন চলছে" },
      candidateFinalized: { color: "bg-indigo-500", label: "প্রার্থী চূড়ান্ত" },
      voting: {
        color: "bg-emerald-500 animate-pulse",
        label: "ভোট দিন (চলমান)",
      },
      completed: { color: "bg-slate-500", label: "ফলাফল প্রকাশিত" },
    };
    return configs[status] || { color: "bg-slate-400", label: status };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 sm:pb-20">
      {/* Welcome Banner */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-8 pt-6 md:pt-10 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              স্বাগতম, <span className="text-blue-600">{user?.name}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wider">
              <span>🆔 {user?.registrationNumber}</span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span>🏢 {user?.hall || "হল নির্বাচন করুন"}</span>
            </div>
          </div>

          {(!user?.hall || user?.hall === "None") && (
            <Link
              to="/profile"
              className="flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl group hover:bg-rose-100 transition-colors"
            >
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white text-xl animate-bounce">
                ⚠️
              </div>
              <div>
                <p className="text-rose-700 font-black text-sm uppercase">
                  হল নির্বাচন করা হয়নি!
                </p>
                <p className="text-rose-500 text-xs font-bold">
                  প্রোফাইলে গিয়ে আপডেট করুন →
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
          নির্বাচন তালিকা
          <div className="h-px flex-1 bg-slate-200"></div>
        </h2>

        {elections.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic text-lg tracking-tight">
              বর্তমানে কোনো নির্বাচন সক্রিয় নেই
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electionsWithHall.map((item) => {
              const election = item.election;
              const voterHall = item.voterHall;
              const { color, label } = getStatusConfig(election.status);

              return (
                <div
                  key={election._id}
                  className="group relative bg-white rounded-3xl border-2 border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Card Status Header with gradient */}
                  <div className={`h-2 w-full ${color} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col relative z-10">
                    {/* Status Badge and Type */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg ${color}`}
                      >
                        {label}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                        <span className="text-base">
                          {election.type === "hall"
                            ? "🏢"
                            : election.type === "society"
                              ? "🏛️"
                              : election.type === "cr"
                                ? "👤"
                                : "🎓"}
                        </span>
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          {election.type === "hall"
                            ? "হল"
                            : election.type === "society"
                              ? "সোসাইটি"
                              : election.type === "cr"
                                ? "CR"
                                : "প্রধান"}
                        </span>
                      </div>
                    </div>

                    {/* Election Title with icon */}
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {election.title}
                      </h3>
                      <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full group-hover:w-24 transition-all"></div>
                    </div>

                    {/* Election Details */}
                    <div className="space-y-2.5 mb-6 text-sm font-bold">
                      {election.type === "hall" && (
                        <>
                          {election.hall && (
                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl">
                              <span className="text-lg">🏢</span>
                              <span className="text-xs">
                                {election.hall === "SPH"
                                  ? "Shah Paran Hall"
                                  : election.hall === "B24H"
                                    ? "Bijoy 24 Hall"
                                    : election.hall === "SMAH"
                                      ? "Syed Mujtaba Ali Hall"
                                      : election.hall === "ASH"
                                        ? "Ayesha Siddiqa Hall"
                                        : election.hall === "BSCH"
                                          ? "Begum Sirajunnesa Hall"
                                          : election.hall === "FTZH"
                                            ? "Fatimah Tuz Zahra Hall"
                                            : election.hall}
                              </span>
                            </div>
                          )}
                          {voterHall && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                              <span className="text-lg">✓</span>
                              <span className="text-xs">
                                আপনি যোগ্য:{" "}
                                {voterHall === "SPH"
                                  ? "Shah Paran"
                                  : voterHall === "B24H"
                                    ? "Bijoy 24"
                                    : voterHall === "SMAH"
                                      ? "Syed Mujtaba Ali"
                                      : voterHall === "ASH"
                                        ? "Ayesha Siddiqa"
                                        : voterHall === "BSCH"
                                          ? "Begum Sirajunnesa"
                                          : voterHall === "FTZH"
                                            ? "Fatimah Tuz Zahra"
                                            : voterHall}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {election.type === "society" && election.department && (
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
                          <span className="text-lg">🏛️</span>
                          <span className="text-xs">{election.department}</span>
                        </div>
                      )}
                      {election.type === "cr" &&
                        election.department &&
                        election.batch && (
                          <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-xl">
                            <span className="text-lg">👤</span>
                            <span className="text-xs">
                              {election.department} - {election.batch}
                            </span>
                          </div>
                        )}

                      {/* Date Info */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                          <span className="text-sm">📅</span>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">
                              শুরু
                            </div>
                            <div className="text-xs font-black text-slate-700">
                              {new Date(election.startDate).toLocaleDateString(
                                "bn-BD",
                                { day: "numeric", month: "short" },
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                          <span className="text-sm">⌛</span>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">
                              শেষ
                            </div>
                            <div className="text-xs font-black text-slate-700">
                              {new Date(election.endDate).toLocaleDateString(
                                "bn-BD",
                                { day: "numeric", month: "short" },
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Voting Countdown */}
                      {election.status === "voting" && (
                        <div className="pt-2 border-t border-slate-100">
                          <VotingCountdown election={election} />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Container */}
                    <div className="mt-auto grid grid-cols-1 gap-2.5 pt-4 border-t-2 border-slate-100">
                      <Link
                        to={`/election/${election._id}`}
                        className="w-full text-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl transition-all group/btn"
                      >
                        <span className="flex items-center justify-center gap-2">
                          📄 বিস্তারিত দেখুন
                          <svg
                            className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </Link>

                      {election.status === "created" && (
                        <Link
                          to={`/apply/${election._id}`}
                          className="w-full text-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95"
                        >
                          <span className="flex items-center justify-center gap-2">
                            ✍️ প্রার্থী হিসাবে আবেদন
                          </span>
                        </Link>
                      )}

                      {election.status === "voting" && (
                        <>
                          {user?.role === "admin" ||
                          user?.role === "superadmin" ? (
                            <div className="w-full text-center py-3.5 px-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white font-black text-sm rounded-xl shadow-lg cursor-not-allowed">
                              <span className="flex items-center justify-center gap-2">
                                🔒 অ্যাডমিন ভোট দিতে পারবেন না
                              </span>
                            </div>
                          ) : (
                            <Link
                              to={`/vote/${election._id}`}
                              className="w-full text-center py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all animate-pulse hover:animate-none"
                            >
                              <span className="flex items-center justify-center gap-2">
                                🗳️ ভোট দিন (লাইভ)
                              </span>
                            </Link>
                          )}
                        </>
                      )}

                      {election.status === "completed" && (
                        <Link
                          to={`/results/${election._id}`}
                          className="w-full text-center py-3.5 px-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-sm rounded-xl shadow-lg shadow-slate-300 hover:shadow-xl transition-all"
                        >
                          <span className="flex items-center justify-center gap-2">
                            🏆 ফলাফল দেখুন
                          </span>
                        </Link>
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

export default StudentDashboard;
