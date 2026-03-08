import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchElections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchElections = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/elections");
      console.log("All elections:", res.data);
      console.log("User department:", user?.department);

      // Filter elections: show all main/hall elections, but only society elections for user's department
      const filteredElections = res.data.filter((election) => {
        if (election.type === "society") {
          console.log(
            "Society election:",
            election.title,
            "Department:",
            election.department,
            "Match:",
            election.department === user?.department,
          );
          return election.department === user?.department;
        }
        return true; // Show all main and hall elections
      });
      console.log("Filtered elections:", filteredElections);
      setElections(filteredElections);
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Welcome Banner */}
      <div className="bg-white border-b border-slate-200 mb-8 pt-10 pb-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {elections.map((election) => {
              const { color, label } = getStatusConfig(election.status);

              return (
                <div
                  key={election._id}
                  className="group relative bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {/* Card Status Header */}
                  <div className={`h-3 w-full ${color}`}></div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${color}`}
                      >
                        {label}
                      </span>
                      <span className="text-slate-400 text-xs font-bold uppercase">
                        {election.type === "hall"
                          ? "🏢 হল"
                          : election.type === "society"
                            ? "🏛️ সোসাইটি"
                            : "🎓 প্রধান"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                      {election.title}
                    </h3>

                    <div className="space-y-3 mb-8 text-sm font-bold text-slate-500">
                      {election.type === "society" && election.department && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <span className="text-blue-400">🏛️</span>{" "}
                          {election.department}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">📅</span> শুরু:{" "}
                        {new Date(election.startDate).toLocaleDateString(
                          "bn-BD",
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">⌛</span> শেষ:{" "}
                        {new Date(election.endDate).toLocaleDateString("bn-BD")}
                      </div>
                    </div>

                    {/* Action Buttons Container */}
                    <div className="mt-auto grid grid-cols-1 gap-3 pt-6 border-t border-slate-100">
                      <Link
                        to={`/election/${election._id}`}
                        className="w-full text-center py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-2xl transition-all"
                      >
                        বিস্তারিত দেখুন
                      </Link>

                      {election.status === "created" && (
                        <Link
                          to={`/apply/${election._id}`}
                          className="w-full text-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                          প্রার্থী হিসাবে আবেদন
                        </Link>
                      )}

                      {election.status === "voting" && (
                        <Link
                          to={`/vote/${election._id}`}
                          className="w-full text-center py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-100 transition-all animate-bounce-subtle"
                        >
                          ভোট দিন (লাইভ)
                        </Link>
                      )}

                      {election.status === "completed" && (
                        <Link
                          to={`/results/${election._id}`}
                          className="w-full text-center py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-black text-sm rounded-2xl shadow-lg transition-all"
                        >
                          ফলাফল দেখুন
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
