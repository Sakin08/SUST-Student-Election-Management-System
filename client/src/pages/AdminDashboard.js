import { useState, useEffect, useContext } from "react";
import { API_URL } from "../config";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import CandidateDetailsModal from "./CandidateDetailsModal";
import VoterManagement from "../components/VoterManagement";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "elections",
  );
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [editingElection, setEditingElection] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "",
    startDate: "",
    endDate: "",
    applicationFee: 0,
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVotingTimeModal, setShowVotingTimeModal] = useState(false);
  const [selectedElectionForVoting, setSelectedElectionForVoting] =
    useState(null);
  const [votingTimeForm, setVotingTimeForm] = useState({
    startTime: "",
    endTime: "",
  });

  // Sync activeTab with URL parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["elections", "candidates", "voters", "audit"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Debug: Log user role
  useEffect(() => {
    console.log("=== AdminDashboard Debug ===");
    console.log("Current user object:", user);
    console.log("User role:", user?.role);
    console.log("Is superadmin?", user?.role === "superadmin");
    console.log("========================");
  }, [user]);

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Refreshed user data:", res.data);
      alert(
        `Current role from server: ${res.data.role}\n\nIf this shows "superadmin" but buttons don't appear, you need to log out and log in again to get a fresh token.`,
      );

      // Force reload the page to refresh AuthContext
      if (res.data.role === "superadmin") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      alert("Error checking role. Please log out and log in again.");
    }
  };

  useEffect(() => {
    fetchElections();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/elections`);
      console.log("Admin fetched all elections:", res.data.length, "elections");
      setElections(res.data);
    } catch (error) {
      console.error("Error fetching elections:", error);
      alert("নির্বাচন লোড করতে সমস্যা হয়েছে");
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/candidates/election/${electionId}`,
      );
      console.log("Fetched candidates:", res.data);
      res.data.forEach((candidate, index) => {
        console.log(`Candidate ${index}:`, {
          name: candidate.studentId?.name,
          photo: candidate.candidatePhoto,
          hasPhoto: !!candidate.candidatePhoto,
        });
      });
      setCandidates(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/audit`);
      setAuditLogs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateElectionStatus = async (electionId, status) => {
    try {
      await axios.put(`${API_URL}/api/elections/${electionId}/status`, {
        status,
      });
      fetchElections();
      alert("স্ট্যাটাস আপডেট হয়েছে");
    } catch (error) {
      alert("আপডেট ব্যর্থ হয়েছে");
    }
  };

  const updateCandidateStatus = async (candidateId, status) => {
    try {
      await axios.put(`${API_URL}/api/candidates/${candidateId}/status`, {
        status,
      });
      fetchCandidates(selectedElection);
      fetchAuditLogs();
      alert(
        `প্রার্থী ${status === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"} হয়েছে`,
      );
    } catch (error) {
      alert("আপডেট ব্যর্থ হয়েছে");
    }
  };

  const deleteElection = async (electionId) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই নির্বাচন মুছে ফেলতে চান?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/elections/${electionId}`);
      fetchElections();
      fetchAuditLogs();
      alert("নির্বাচন মুছে ফেলা হয়েছে");
    } catch (error) {
      alert(
        "মুছে ফেলা ব্যর্থ হয়েছে: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const startEditElection = async (election) => {
    setEditingElection(election._id);
    setEditForm({
      title: election.title,
      type: election.type,
      startDate: new Date(election.startDate).toISOString().split("T")[0],
      endDate: new Date(election.endDate).toISOString().split("T")[0],
      applicationFee: election.applicationFee || 0,
    });

    try {
      await Promise.all([
        axios.get(`${API_URL}/api/positions/election/${election._id}`),
        axios.get(`${API_URL}/api/panels/election/${election._id}`),
      ]);
    } catch (error) {
      console.error("Error fetching positions/panels:", error);
    }
  };

  const cancelEdit = () => {
    setEditingElection(null);
    setEditForm({
      title: "",
      type: "",
      startDate: "",
      endDate: "",
      applicationFee: 0,
    });
  };

  const saveElection = async (electionId) => {
    try {
      // Just update the election details, don't touch positions/panels
      await axios.put(`${API_URL}/api/elections/${electionId}`, editForm);

      fetchElections();
      fetchAuditLogs();
      setEditingElection(null);
      alert("নির্বাচন আপডেট হয়েছে");
    } catch (error) {
      alert(
        "আপডেট ব্যর্থ হয়েছে: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const openVotingTimeModal = (election) => {
    setSelectedElectionForVoting(election);
    setVotingTimeForm({
      startTime: election.votingStartTime || "",
      endTime: election.votingEndTime || "",
    });
    setShowVotingTimeModal(true);
  };

  const startVotingWithTime = async () => {
    if (!votingTimeForm.startTime || !votingTimeForm.endTime) {
      alert("দয়া করে ভোটিং শুরু এবং শেষের সময় নির্বাচন করুন");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/elections/${selectedElectionForVoting._id}/status`,
        {
          status: "voting",
          votingStartTime: votingTimeForm.startTime,
          votingEndTime: votingTimeForm.endTime,
        },
      );
      fetchElections();
      setShowVotingTimeModal(false);
      setSelectedElectionForVoting(null);
      alert("ভোটিং শুরু হয়েছে");
    } catch (error) {
      alert("ভোটিং শুরু ব্যর্থ হয়েছে");
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      voting:
        "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse",
      completed: "bg-slate-100 text-slate-700 border-slate-200",
      candidateFinalized: "bg-blue-100 text-blue-700 border-blue-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.pending}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                অ্যাডমিন ড্যাশবোর্ড
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                SUST নির্বাচন ব্যবস্থাপনা সিস্টেম
              </p>
            </div>
            {user && (
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-sm text-slate-600">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === "superadmin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {user.role === "superadmin" ? "👑 SUPER ADMIN" : "🔑 ADMIN"}
                  </span>
                  <button
                    onClick={refreshUserData}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    title="Check current role"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Modern Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap p-1 bg-slate-200/50 rounded-xl w-full sm:w-fit mb-6 md:mb-8 gap-1">
          {[
            { id: "elections", label: "নির্বাচন পরিচালনা" },
            { id: "candidates", label: "প্রার্থী অনুমোদন" },
            { id: "voters", label: "ভোটার তালিকা" },
            { id: "audit", label: "অডিট লগ" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === "elections" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    নির্বাচন তালিকা
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    সকল নির্বাচন দেখছেন ({elections.length} টি)
                  </p>
                </div>
                <Link
                  to="/create-election"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  + নতুন নির্বাচন তৈরি করুন
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {elections.map((election) => (
                  <div
                    key={election._id}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {editingElection === election._id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                          ✏️ নির্বাচন সম্পাদনা
                        </h3>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            শিরোনাম
                          </label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            ধরন
                          </label>
                          <select
                            value={editForm.type}
                            onChange={(e) =>
                              setEditForm({ ...editForm, type: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="main">শিক্ষার্থী সংসদ</option>
                            <option value="hall">হল সংসদ</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              শুরুর তারিখ
                            </label>
                            <input
                              type="date"
                              value={editForm.startDate}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  startDate: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              শেষ তারিখ
                            </label>
                            <input
                              type="date"
                              value={editForm.endDate}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  endDate: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Application Fee - Only for hall, main, and society elections */}
                        {(editForm.type === "hall" ||
                          editForm.type === "main" ||
                          editForm.type === "society") && (
                          <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              আবেদন ফি (টাকা)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.applicationFee}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  applicationFee: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="যেমন: 500 (0 মানে ফি নেই)"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              প্রার্থী হওয়ার জন্য ফি নির্ধারণ করুন। 0 দিলে কোনো
                              ফি লাগবে না।
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => saveElection(election._id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-colors"
                          >
                            ✓ সংরক্ষণ
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg font-bold transition-colors"
                          >
                            ✕ বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                              {election.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                {election.type === "hall"
                                  ? "🏢 হল সংসদ"
                                  : election.type === "society"
                                    ? "🏛️ সোসাইটি"
                                    : election.type === "cr"
                                      ? "👤 CR"
                                      : "🎓 শিক্ষার্থী সংসদ"}
                              </span>
                              {election.type === "hall" && election.hall && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md font-medium">
                                  🏢{" "}
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
                              )}
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md font-medium">
                                📅{" "}
                                {new Date(
                                  election.startDate,
                                ).toLocaleDateString("bn-BD")}
                              </span>
                              {election.status === "voting" &&
                                election.votingStartTime &&
                                election.votingEndTime && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md font-medium">
                                    ⏰ {election.votingStartTime} -{" "}
                                    {election.votingEndTime}
                                  </span>
                                )}
                            </div>
                          </div>
                          <span className={getStatusBadge(election.status)}>
                            {election.status === "pending" && "⏳ PENDING"}
                            {election.status === "candidateFinalized" &&
                              "✓ FINALIZED"}
                            {election.status === "voting" && "🗳️ VOTING"}
                            {election.status === "completed" && "✅ COMPLETED"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                          <button
                            onClick={() =>
                              updateElectionStatus(
                                election._id,
                                "candidateFinalized",
                              )
                            }
                            disabled={
                              election.status === "candidateFinalized" ||
                              election.status === "voting" ||
                              election.status === "completed"
                            }
                            className="text-sm font-bold py-3 px-5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✓ প্রার্থী চূড়ান্ত
                          </button>
                          <button
                            onClick={() => openVotingTimeModal(election)}
                            disabled={
                              election.status === "voting" ||
                              election.status === "completed"
                            }
                            className="text-sm font-bold py-3 px-5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            🗳️ ভোটিং শুরু
                          </button>
                          <button
                            onClick={() =>
                              updateElectionStatus(election._id, "completed")
                            }
                            disabled={election.status === "completed"}
                            className="col-span-2 text-sm font-bold py-3 px-5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            🏁 সম্পন্ন করুন
                          </button>
                        </div>

                        {/* Super Admin Only: Edit & Delete */}
                        {user?.role === "superadmin" && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                            <button
                              onClick={() => startEditElection(election)}
                              className="text-sm font-bold py-3 px-5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors border border-amber-100"
                            >
                              ✏️ সম্পাদনা
                            </button>
                            <button
                              onClick={() => deleteElection(election._id)}
                              className="text-sm font-bold py-3 px-5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-red-100"
                            >
                              🗑️ মুছে ফেলুন
                            </button>
                          </div>
                        )}

                        {/* Debug: Show if condition is not met */}
                        {user?.role !== "superadmin" && (
                          <div className="mt-4 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                            Current role: {user?.role || "loading..."} (Need
                            superadmin for edit/delete)
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="animate-in fade-in duration-500">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📋 নির্বাচন বাছাই করুন
                </label>
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="w-full md:w-1/2 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">-- নির্বাচন নির্বাচন করুন --</option>
                  {elections.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} (
                      {e.type === "hall"
                        ? "হল সংসদ"
                        : e.type === "society"
                          ? "সোসাইটি"
                          : "শিক্ষার্থী সংসদ"}
                      )
                    </option>
                  ))}
                </select>
                {selectedElection && (
                  <p className="text-xs text-slate-500 mt-3">
                    💡 প্রার্থীদের আবেদন পর্যালোচনা করুন এবং
                    অনুমোদন/প্রত্যাখ্যান করুন
                  </p>
                )}
              </div>

              {!selectedElection ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
                    👆
                  </div>
                  <p className="text-slate-400 font-bold text-lg">
                    উপরে থেকে একটি নির্বাচন নির্বাচন করুন
                  </p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
                    📭
                  </div>
                  <p className="text-slate-400 font-bold text-lg">
                    এই নির্বাচনে কোনো প্রার্থী নেই
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                    >
                      <div className="p-8 flex-1">
                        <div className="flex justify-between items-start mb-6">
                          {candidate.candidatePhoto ? (
                            <img
                              src={candidate.candidatePhoto}
                              alt={candidate.studentId?.name}
                              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                              onError={(e) => {
                                console.error(
                                  "Failed to load candidate photo:",
                                  candidate.candidatePhoto,
                                );
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-3xl shadow-sm"
                            style={{
                              display: candidate.candidatePhoto
                                ? "none"
                                : "flex",
                            }}
                          >
                            {candidate.studentId?.name?.charAt(0)}
                          </div>
                          <span className={getStatusBadge(candidate.status)}>
                            {candidate.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {candidate.studentId?.name}
                        </h3>
                        <p className="text-base text-blue-600 font-bold mb-5">
                          {candidate.positionId?.title}
                        </p>

                        <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-5 rounded-xl">
                          <p>
                            🆔{" "}
                            <span className="font-medium ml-1">
                              রেজি: {candidate.studentId?.registrationNumber}
                            </span>
                          </p>
                          {candidate.panelId && (
                            <p>
                              🚩{" "}
                              <span className="font-medium ml-1">
                                প্যানেল: {candidate.panelId.name}
                              </span>
                            </p>
                          )}
                          <p className="line-clamp-2 italic opacity-80 mt-2">
                            "{candidate.manifesto}"
                          </p>
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            📄 বিস্তারিত দেখুন
                          </button>
                        </div>
                      </div>

                      {candidate.status === "pending" && (
                        <div className="flex border-t border-slate-100">
                          <button
                            onClick={() =>
                              updateCandidateStatus(candidate._id, "approved")
                            }
                            className="flex-1 py-5 text-base font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <span>✓</span> অনুমোদন
                          </button>
                          <div className="w-px bg-slate-100" />
                          <button
                            onClick={() =>
                              updateCandidateStatus(candidate._id, "rejected")
                            }
                            className="flex-1 py-5 text-base font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <span>✕</span> প্রত্যাখ্যান
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "voters" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  ভোটার তালিকা ব্যবস্থাপনা
                </h2>
                <p className="text-sm text-slate-600">
                  নির্বাচন নির্বাচন করুন এবং যোগ্য ভোটারদের তালিকা পরিচালনা করুন
                </p>
              </div>

              {selectedElection ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setSelectedElection("")}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300"
                    >
                      ← ফিরে যান
                    </button>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {
                          elections.find((e) => e._id === selectedElection)
                            ?.title
                        }
                      </h3>
                      <p className="text-sm text-slate-500">
                        {
                          elections.find((e) => e._id === selectedElection)
                            ?.type
                        }{" "}
                        নির্বাচন
                      </p>
                    </div>
                  </div>
                  <VoterManagement electionId={selectedElection} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {elections.map((election) => (
                    <div
                      key={election._id}
                      onClick={() => setSelectedElection(election._id)}
                      className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {election.title}
                      </h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          📋 ধরন:{" "}
                          <span className="font-bold">{election.type}</span>
                        </p>
                        {election.type === "hall" && election.hall && (
                          <p>
                            🏢 হল:{" "}
                            <span className="font-bold">
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
                          </p>
                        )}
                        <p>
                          📊 স্ট্যাটাস:{" "}
                          <span className="font-bold">{election.status}</span>
                        </p>
                        {election.voterListType && (
                          <p>
                            👥 ভোটার:{" "}
                            <span className="font-bold">
                              {election.voterListType === "all"
                                ? "সকল যোগ্য"
                                : `নির্দিষ্ট (${election.eligibleVoters?.length || 0})`}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="mt-4 text-blue-600 font-bold text-sm">
                        পরিচালনা করুন →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "audit" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-sm sm:text-base text-slate-800">
                  অডিট লগ ইতিহাস
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        সময়
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        অ্যাডমিন
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        কার্যক্রম
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        বিবরণ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                          {new Date(log.createdAt).toLocaleString("bn-BD")}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-900">
                          {log.adminId?.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Voting Time Selection Modal */}
      {showVotingTimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl">
                🗳️
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                ভোটিং সময় নির্ধারণ করুন
              </h3>
              <p className="text-slate-600 text-sm">
                ভোটিং শুরু এবং শেষের সময় নির্বাচন করুন
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ভোটিং শুরুর সময় <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={votingTimeForm.startTime}
                  onChange={(e) =>
                    setVotingTimeForm({
                      ...votingTimeForm,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ভোটিং শেষের সময় <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={votingTimeForm.endTime}
                  onChange={(e) =>
                    setVotingTimeForm({
                      ...votingTimeForm,
                      endTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700">
                  💡 নির্ধারিত সময়ের মধ্যেই শিক্ষার্থীরা ভোট দিতে পারবে। সময়ের
                  বাইরে ভোট দেওয়া যাবে না।
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startVotingWithTime}
                className="w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                ভোটিং শুরু করুন
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  setShowVotingTimeModal(false);
                  setSelectedElectionForVoting(null);
                }}
                className="w-full font-bold py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
