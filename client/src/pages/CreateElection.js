import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "main",
    hall: "",
    department: "",
    startDate: "",
    endDate: "",
  });

  const [positions, setPositions] = useState([
    { title: "", isHallSpecific: false, isDepartmentSpecific: false },
  ]);

  const [panels, setPanels] = useState([{ name: "", description: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When election type changes, update all positions' isHallSpecific/isDepartmentSpecific
  const handleTypeChange = (newType) => {
    setFormData({ ...formData, type: newType });

    if (newType === "hall") {
      // Hall election: all positions hall-specific
      const updatedPositions = positions.map((p) => ({
        ...p,
        isHallSpecific: true,
        isDepartmentSpecific: false,
      }));
      setPositions(updatedPositions);
    } else if (newType === "society") {
      // Society election: all positions department-specific
      const updatedPositions = positions.map((p) => ({
        ...p,
        isHallSpecific: false,
        isDepartmentSpecific: true,
      }));
      setPositions(updatedPositions);
    } else {
      // Main election: no restrictions
      const updatedPositions = positions.map((p) => ({
        ...p,
        isHallSpecific: false,
        isDepartmentSpecific: false,
      }));
      setPositions(updatedPositions);
    }
  };

  const addPosition = () => {
    // New positions inherit restrictions based on election type
    const isHallSpecific = formData.type === "hall";
    const isDepartmentSpecific = formData.type === "society";
    setPositions([
      ...positions,
      { title: "", isHallSpecific, isDepartmentSpecific },
    ]);
  };

  const removePosition = (index) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const updatePosition = (index, field, value) => {
    const updated = [...positions];
    updated[index][field] = value;
    setPositions(updated);
  };

  const addPanel = () => {
    setPanels([...panels, { name: "", description: "" }]);
  };

  const removePanel = (index) => {
    setPanels(panels.filter((_, i) => i !== index));
  };

  const updatePanel = (index, field, value) => {
    const updated = [...panels];
    updated[index][field] = value;
    setPanels(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create election first
      const electionRes = await axios.post(
        `${API_URL}/api/elections`,
        formData,
      );
      const electionId = electionRes.data._id;

      // Create positions
      const positionPromises = positions
        .filter((p) => p.title.trim())
        .map((position) =>
          axios.post(`${API_URL}/api/positions`, {
            ...position,
            electionId,
            maxWinners: 1,
          }),
        );

      // Create panels (skip for society elections)
      const panelPromises =
        formData.type !== "society"
          ? panels
              .filter((p) => p.name.trim())
              .map((panel) =>
                axios.post(`${API_URL}/api/panels`, {
                  ...panel,
                  electionId,
                }),
              )
          : [];

      await Promise.all([...positionPromises, ...panelPromises]);

      const successMessage =
        formData.type === "society"
          ? "সোসাইটি নির্বাচন এবং পদ সফলভাবে তৈরি হয়েছে!"
          : "নির্বাচন, পদ এবং প্যানেল সফলভাবে তৈরি হয়েছে!";
      alert(successMessage);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(
        "তৈরি ব্যর্থ হয়েছে: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm mb-4 transition-colors group"
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

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-200">
              🗳️
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                নতুন নির্বাচন তৈরি করুন
              </h1>
              <p className="text-slate-500 mt-1">
                নির্বাচন, পদ এবং প্যানেল একসাথে সেটআপ করুন
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Election Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                  📋
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  নির্বাচনের তথ্য
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    শিরোনাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: কেন্দ্রীয় ছাত্র সংসদ নির্বাচন ২০২৪"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    নির্বাচনের ধরন <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="main">🎓 শিক্ষার্থী সংসদ নির্বাচন</option>
                    <option value="hall">🏢 হল সংসদ নির্বাচন</option>
                    <option value="society">🏛️ সোসাইটি নির্বাচন</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    {formData.type === "main"
                      ? "সকল ছাত্রদের জন্য কেন্দ্রীয় নির্বাচন"
                      : formData.type === "hall"
                        ? "প্রতিটি হলের জন্য আলাদা নির্বাচন (সব পদ হল-নির্দিষ্ট)"
                        : "একটি নির্দিষ্ট বিভাগের জন্য নির্বাচন (প্যানেল নেই)"}
                  </p>
                </div>

                {formData.type === "society" && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      বিভাগ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      required
                    >
                      <option value="">বিভাগ নির্বাচন করুন</option>
                      <optgroup label="Engineering">
                        <option value="CSE">CSE</option>
                        <option value="EEE">EEE</option>
                        <option value="Mechanical Engineering">
                          Mechanical Engineering
                        </option>
                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>
                        <option value="Chemical Engineering">
                          Chemical Engineering
                        </option>
                        <option value="IPE">IPE</option>
                        <option value="PME">PME</option>
                        <option value="Food Engineering">
                          Food Engineering
                        </option>
                        <option value="Architecture">Architecture</option>
                        <option value="Software Engineering">
                          Software Engineering
                        </option>
                      </optgroup>
                      <optgroup label="Physical Sciences">
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Statistics">Statistics</option>
                        <option value="Oceanography">Oceanography</option>
                        <option value="Geography and Environmental Studies">
                          Geography and Environmental Studies
                        </option>
                      </optgroup>
                      <optgroup label="Life Sciences">
                        <option value="Bio-Chemistry and Molecular Biology">
                          Bio-Chemistry and Molecular Biology
                        </option>
                        <option value="Genetic Engineering and Biotechnology">
                          Genetic Engineering and Biotechnology
                        </option>
                        <option value="Forestry and Environmental Science">
                          Forestry and Environmental Science
                        </option>
                      </optgroup>
                      <optgroup label="Business & Social Sciences">
                        <option value="Business Administration">
                          Business Administration
                        </option>
                        <option value="Economics">Economics</option>
                        <option value="Anthropology">Anthropology</option>
                        <option value="Political Studies">
                          Political Studies
                        </option>
                        <option value="Public Administration">
                          Public Administration
                        </option>
                        <option value="Social Work">Social Work</option>
                        <option value="Sociology">Sociology</option>
                      </optgroup>
                      <optgroup label="Arts & Humanities">
                        <option value="English">English</option>
                        <option value="Bangla">Bangla</option>
                      </optgroup>
                      <optgroup label="Mathematics">
                        <option value="Mathematics">Mathematics</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                <div></div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    শুরুর তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    শেষের তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Positions Section */}
            <div className="space-y-6 pt-6 border-t-2 border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
                    👔
                  </div>
                  <h2 className="text-xl font-black text-slate-900">পদসমূহ</h2>
                </div>
                <button
                  type="button"
                  onClick={addPosition}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  পদ যোগ করুন
                </button>
              </div>

              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border-2 border-emerald-100"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="পদের নাম (যেমন: ভাইস প্রেসিডেন্ট, জেনারেল সেক্রেটারি)"
                        className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        value={position.title}
                        onChange={(e) =>
                          updatePosition(index, "title", e.target.value)
                        }
                      />
                    </div>
                    {positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePosition(index)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 p-2 rounded-lg transition-all"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Panels Section - Hide for society elections */}
            {formData.type !== "society" && (
              <div className="space-y-6 pt-6 border-t-2 border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                      🚩
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        প্যানেলসমূহ
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ঐচ্ছিক - প্যানেল ছাড়াও প্রার্থী হওয়া যাবে
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addPanel}
                    className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all"
                  >
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    প্যানেল যোগ করুন
                  </button>
                </div>

                <div className="space-y-4">
                  {panels.map((panel, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100"
                    >
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="প্যানেলের নাম (যেমন: প্রগতিশীল ছাত্র জোট)"
                          className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          value={panel.name}
                          onChange={(e) =>
                            updatePanel(index, "name", e.target.value)
                          }
                        />
                        <textarea
                          placeholder="বিবরণ (ঐচ্ছিক) - প্যানেল সম্পর্কে সংক্ষিপ্ত তথ্য"
                          className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                          rows="2"
                          value={panel.description}
                          onChange={(e) =>
                            updatePanel(index, "description", e.target.value)
                          }
                        />
                      </div>
                      {panels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePanel(index)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 p-2 rounded-lg transition-all"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100">
              <Link
                to="/"
                className="px-8 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
              >
                বাতিল করুন
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-xl shadow-blue-200 flex items-center gap-2 ${
                  isSubmitting
                    ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    সম্পূর্ণ নির্বাচন তৈরি করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateElection;
