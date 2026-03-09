import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

const VoterManagement = ({ electionId }) => {
  const [voterListType, setVoterListType] = useState("all");
  const [eligibleVoters, setEligibleVoters] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [election, setElection] = useState(null);
  const [bulkInput, setBulkInput] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAutoPopulateModal, setShowAutoPopulateModal] = useState(false);
  const [autoPopulateForm, setAutoPopulateForm] = useState({
    department: "",
    batch: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchElection();
    fetchVoters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const fetchElection = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/elections/${electionId}`,
      );
      setElection(response.data);
    } catch (error) {
      console.error("Fetch election error:", error);
    }
  };

  const fetchVoters = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/eligible-voters/${electionId}?limit=10000`,
      );
      setVoterListType(response.data.voterListType);
      setEligibleVoters(response.data.voters);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Fetch voters error:", error);
    }
  };

  const handleTypeChange = async (newType) => {
    try {
      await axios.put(`${API_URL}/api/eligible-voters/${electionId}/type`, {
        voterListType: newType,
      });
      setVoterListType(newType);
      setMessage("ভোটার তালিকা ধরন আপডেট হয়েছে");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("আপডেট ব্যর্থ হয়েছে");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (registrationNumber.length !== 10) {
      setMessage("রেজিস্ট্রেশন নম্বর ১০ ডিজিটের হতে হবে");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (election?.type === "hall" && !selectedHall) {
      setMessage("হল নির্বাচন করুন");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const payload = { registrationNumber };
      if (election?.type === "hall") {
        payload.hall = selectedHall;
      }

      const response = await axios.post(
        `${API_URL}/api/eligible-voters/${electionId}/add`,
        payload,
      );
      setMessage(response.data.message);
      setRegistrationNumber("");
      setSelectedHall("");
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "যোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBulkAdd = async () => {
    const lines = bulkInput
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (lines.length === 0) {
      setMessage("রেজিস্ট্রেশন নম্বর প্রদান করুন");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Parse based on election type
    const registrationNumbers = [];

    if (election?.type === "hall") {
      // For hall elections, expect format: registrationNumber,hall
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          registrationNumbers.push({
            registrationNumber: parts[0],
            hall: parts[1],
          });
        }
      }
    } else {
      // For other elections, just registration numbers
      registrationNumbers.push(
        ...lines.map((n) => ({ registrationNumber: n })),
      );
    }

    if (registrationNumbers.length === 0) {
      setMessage(
        election?.type === "hall"
          ? "সঠিক format এ লিখুন: registrationNumber,hall"
          : "রেজিস্ট্রেশন নম্বর প্রদান করুন",
      );
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/eligible-voters/${electionId}/bulk`,
        { registrationNumbers },
      );
      setMessage(response.data.message);
      setBulkInput("");
      setShowBulkModal(false);
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "যোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setMessage("CSV ফাইল নির্বাচন করুন");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/eligible-voters/${electionId}/upload-csv`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const { added, skipped, foundInFile, totalCount } = response.data;

      let msg = response.data.message;
      if (foundInFile) {
        msg += `\n\nফাইলে পাওয়া গেছে: ${foundInFile} টি\nযুক্ত হয়েছে: ${added} টি`;
        if (skipped > 0) {
          msg += `\nবাদ দেওয়া হয়েছে: ${skipped} টি (ইতিমধ্যে ছিল)`;
        }
        msg += `\nমোট তালিকায়: ${totalCount} টি`;
      }

      setMessage(msg);
      setCsvFile(null);
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "আপলোড ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 8000);
    }
  };

  const handleAutoPopulate = async () => {
    if (!autoPopulateForm.department && !autoPopulateForm.batch) {
      setMessage("বিভাগ বা ব্যাচ নির্বাচন করুন");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/eligible-voters/${electionId}/auto-populate`,
        autoPopulateForm,
      );
      setMessage(response.data.message);
      setShowAutoPopulateModal(false);
      setAutoPopulateForm({ department: "", batch: "" });
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "যোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleRemove = async (regNum) => {
    if (!window.confirm(`${regNum} সরাতে চান?`)) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/eligible-voters/${electionId}/remove/${regNum}`,
      );
      setMessage(response.data.message);
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "সরাতে ব্যর্থ হয়েছে");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        `সব ${totalCount} জন ভোটার সরাতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      )
    )
      return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/eligible-voters/${electionId}/clear`,
      );
      setMessage(response.data.message);
      fetchVoters();
    } catch (error) {
      setMessage(error.response?.data?.message || "সরাতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const filteredVoters = eligibleVoters.filter((v) =>
    v.registrationNumber.includes(searchTerm),
  );

  // Show first 100 by default, or all if showAll is true
  const displayedVoters = showAll
    ? filteredVoters
    : filteredVoters.slice(0, 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <h3 className="text-2xl font-black text-slate-900 mb-6">
        ভোটার তালিকা ব্যবস্থাপনা
      </h3>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.includes("ব্যর্থ")
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <pre className="whitespace-pre-wrap font-sans text-sm">{message}</pre>
        </div>
      )}

      {/* Voter List Type Selection */}
      <div className="mb-8 p-6 bg-slate-50 rounded-xl">
        <label className="block text-sm font-bold text-slate-700 mb-3">
          ভোটার তালিকা ধরন
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={voterListType === "all"}
              onChange={() => handleTypeChange("all")}
              className="w-5 h-5"
            />
            <div>
              <span className="font-bold text-slate-900">
                সকল যোগ্য শিক্ষার্থী
              </span>
              <p className="text-xs text-slate-500">
                বিভাগ/ব্যাচ অনুযায়ী সকল শিক্ষার্থী ভোট দিতে পারবে
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={voterListType === "specific"}
              onChange={() => handleTypeChange("specific")}
              className="w-5 h-5"
            />
            <div>
              <span className="font-bold text-slate-900">নির্দিষ্ট তালিকা</span>
              <p className="text-xs text-slate-500">
                শুধুমাত্র নির্দিষ্ট রেজিস্ট্রেশন নম্বরের শিক্ষার্থীরা ভোট দিতে
                পারবে
              </p>
            </div>
          </label>
        </div>
      </div>

      {voterListType === "specific" && (
        <>
          {/* Add Single Voter */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              একক ভোটার যোগ করুন
            </label>
            <form onSubmit={handleAddSingle} className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="2021331008"
                  maxLength="10"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {election?.type === "hall" && (
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">হল নির্বাচন করুন</option>
                    <option value="SPH">Shah Paran Hall (SPH)</option>
                    <option value="B24H">Bijoy 24 Hall (B24H)</option>
                    <option value="SMAH">Syed Mujtaba Ali Hall (SMAH)</option>
                    <option value="ASH">Ayesha Siddiqa Hall (ASH)</option>
                    <option value="BSCH">
                      Begum Sirajunnesa Chowdhury Hall (BSCH)
                    </option>
                    <option value="FTZH">Fatimah Tuz Zahra Hall (FTZH)</option>
                  </select>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 whitespace-nowrap"
                >
                  যোগ করুন
                </button>
              </div>
              {election?.type === "hall" && (
                <p className="text-xs text-slate-500">
                  হল নির্বাচনের জন্য রেজিস্ট্রেশন নম্বর এবং হল উভয়ই প্রয়োজন
                </p>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm"
            >
              📝 একাধিক যোগ করুন
            </button>
            <label className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-sm cursor-pointer">
              📁 CSV আপলোড
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            {csvFile && (
              <button
                onClick={handleCsvUpload}
                disabled={loading}
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-sm"
              >
                ✓ {csvFile.name} আপলোড করুন
              </button>
            )}
            <button
              onClick={() => setShowAutoPopulateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 text-sm"
            >
              👥 স্বয়ংক্রিয় যোগ
            </button>
            {totalCount > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 text-sm"
              >
                🗑️ সব সরান
              </button>
            )}
          </div>

          {/* CSV Format Help */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-bold text-blue-900 mb-2">
              📋 CSV Format:
            </p>
            {election?.type === "hall" ? (
              <div className="text-xs text-blue-700 space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="font-mono mb-1">registrationNumber,hall</p>
                  <p className="font-mono">2021331008,SPH</p>
                  <p className="font-mono">2021331009,SMAH</p>
                  <p className="font-mono">2021331010,B24H</p>
                </div>
                <p className="font-semibold">
                  প্রতি লাইনে: রেজিস্ট্রেশন নম্বর, হল কোড (comma দিয়ে আলাদা)
                </p>
                <div className="bg-white p-2 rounded">
                  <p className="font-bold mb-1">হল কোড সমূহ:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <p className="font-mono">SPH - Shah Paran Hall</p>
                    <p className="font-mono">B24H - Bijoy 24 Hall</p>
                    <p className="font-mono">SMAH - Syed Mujtaba Ali Hall</p>
                    <p className="font-mono">ASH - Ayesha Siddiqa Hall</p>
                    <p className="font-mono">BSCH - Begum Sirajunnesa Hall</p>
                    <p className="font-mono">FTZH - Fatimah Tuz Zahra Hall</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-mono bg-white px-2 py-1 rounded">
                  2021331008
                </p>
                <p className="font-mono bg-white px-2 py-1 rounded">
                  2021331009
                </p>
                <p className="font-mono bg-white px-2 py-1 rounded">
                  2021331010
                </p>
                <p className="mt-2">প্রতি লাইনে একটি করে রেজিস্ট্রেশন নম্বর</p>
              </div>
            )}
          </div>

          {/* Voter List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-slate-800">
                যোগ্য ভোটার তালিকা ({totalCount} জন)
                {searchTerm &&
                  ` - খুঁজে পাওয়া গেছে: ${filteredVoters.length} জন`}
              </h4>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="খুঁজুন..."
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {filteredVoters.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-2">📋</p>
                <p>কোনো ভোটার যুক্ত করা হয়নি</p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          রেজিস্ট্রেশন নম্বর
                        </th>
                        {election?.type === "hall" && (
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                            হল
                          </th>
                        )}
                        <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                          অ্যাকশন
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedVoters.map((voter, index) => (
                        <tr
                          key={index}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {voter.registrationNumber}
                          </td>
                          {election?.type === "hall" && (
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold text-xs">
                                {voter.hall || "N/A"}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() =>
                                handleRemove(voter.registrationNumber)
                              }
                              className="text-rose-600 hover:text-rose-700 font-bold text-sm"
                            >
                              ❌ সরান
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!showAll && filteredVoters.length > 100 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                    >
                      আরো দেখুন ({filteredVoters.length - 100} জন বাকি)
                    </button>
                  </div>
                )}

                {showAll && filteredVoters.length > 100 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAll(false)}
                      className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300"
                    >
                      কম দেখুন
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-4">
              একাধিক ভোটার যোগ করুন
            </h3>

            {election?.type === "hall" ? (
              <>
                <p className="text-sm text-slate-600 mb-2">
                  প্রতি লাইনে: রেজিস্ট্রেশন নম্বর, হল কোড (comma দিয়ে আলাদা)
                </p>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-bold mb-2 text-sm text-blue-900">
                    হল কোড সমূহ:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    <p className="font-mono">SPH - Shah Paran Hall</p>
                    <p className="font-mono">B24H - Bijoy 24 Hall</p>
                    <p className="font-mono">SMAH - Syed Mujtaba Ali Hall</p>
                    <p className="font-mono">ASH - Ayesha Siddiqa Hall</p>
                    <p className="font-mono">BSCH - Begum Sirajunnesa Hall</p>
                    <p className="font-mono">FTZH - Fatimah Tuz Zahra Hall</p>
                  </div>
                </div>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows="10"
                  placeholder="2021331008,SPH&#10;2021331009,SMAH&#10;2021331010,B24H"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  প্রতি লাইনে একটি করে রেজিস্ট্রেশন নম্বর লিখুন
                </p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows="10"
                  placeholder="2021331008&#10;2021331009&#10;2021331010"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                />
              </>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkAdd}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300"
              >
                যোগ করুন
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Populate Modal */}
      {showAutoPopulateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-4">
              স্বয়ংক্রিয় ভোটার যোগ
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              বিভাগ এবং/অথবা ব্যাচ নির্বাচন করুন
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  বিভাগ (ঐচ্ছিক)
                </label>
                <select
                  value={autoPopulateForm.department}
                  onChange={(e) =>
                    setAutoPopulateForm({
                      ...autoPopulateForm,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">সব বিভাগ</option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="CEP">CEP</option>
                  <option value="IPE">IPE</option>
                  <option value="MCE">MCE</option>
                  <option value="PME">PME</option>
                  <option value="CEE">CEE</option>
                  <option value="ARC">ARC</option>
                  <option value="URP">URP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ব্যাচ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={autoPopulateForm.batch}
                  onChange={(e) =>
                    setAutoPopulateForm({
                      ...autoPopulateForm,
                      batch: e.target.value,
                    })
                  }
                  placeholder="2021"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAutoPopulate}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:bg-slate-300"
              >
                যোগ করুন
              </button>
              <button
                onClick={() => setShowAutoPopulateModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterManagement;
