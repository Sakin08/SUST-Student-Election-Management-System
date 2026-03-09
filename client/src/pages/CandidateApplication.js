import { useState, useEffect, useContext, useRef } from "react";
import { API_URL } from "../config";
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
  // eslint-disable-next-line no-unused-vars
  const [candidatePhoto, setCandidatePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const shouldAutoSubmitRef = useRef(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [voterHall, setVoterHall] = useState(null); // Hall from admin's eligible voters list

  useEffect(() => {
    const loadData = async () => {
      // Check eligibility first to get hall from admin input
      try {
        const response = await axios.get(
          `${API_URL}/api/eligible-voters/${electionId}/check-eligibility`,
        );
        if (response.data.hall) {
          setVoterHall(response.data.hall);
          console.log("Voter hall from admin input:", response.data.hall);
        }
      } catch (error) {
        console.error("Eligibility check error:", error);
      }

      // Then fetch election data
      await fetchData();
    };

    loadData();

    // Check if there's a completed payment
    const completedPaymentId = localStorage.getItem("completedPaymentId");
    const shouldAutoSubmit = localStorage.getItem("autoSubmitAfterPayment");
    const savedFormData = localStorage.getItem("pendingFormData");

    console.log("Checking for completed payment:", completedPaymentId);
    console.log("Should auto submit:", shouldAutoSubmit);
    console.log("Saved form data:", savedFormData);

    if (completedPaymentId) {
      setPaymentId(completedPaymentId);
      localStorage.removeItem("completedPaymentId");

      // Restore form data if available
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData({
            positionId: parsedData.positionId,
            panelId: parsedData.panelId,
            manifesto: parsedData.manifesto,
          });
          // Restore uploaded photo URL
          if (parsedData.candidatePhotoUrl) {
            setUploadedPhotoUrl(parsedData.candidatePhotoUrl);
            console.log("Photo URL restored:", parsedData.candidatePhotoUrl);
          }
          localStorage.removeItem("pendingFormData");
          console.log("Form data restored:", parsedData);
        } catch (e) {
          console.error("Error parsing saved form data:", e);
        }
      }

      // If auto submit flag is set
      if (shouldAutoSubmit === "true") {
        setMessage("পেমেন্ট সফল হয়েছে! আবেদন স্বয়ংক্রিয়ভাবে জমা হচ্ছে...");
        localStorage.removeItem("autoSubmitAfterPayment");
        shouldAutoSubmitRef.current = true;
      } else {
        setMessage("পেমেন্ট সফল হয়েছে! এখন আবেদন জমা দিন।");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  // Auto submit after payment if flag is set
  useEffect(() => {
    if (shouldAutoSubmitRef.current && paymentId && formData.positionId) {
      console.log("Auto submitting form after payment...");
      console.log("PaymentId:", paymentId);
      console.log("FormData:", formData);
      shouldAutoSubmitRef.current = false;

      // Directly call handleSubmit after a delay
      setTimeout(() => {
        console.log("Triggering handleSubmit programmatically...");
        // Create a fake event object
        const fakeEvent = {
          preventDefault: () => {},
        };
        handleSubmit(fakeEvent);
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, formData]);

  const fetchData = async () => {
    try {
      const [elecRes, posRes, panelRes] = await Promise.all([
        axios.get(`${API_URL}/api/elections/${electionId}`),
        axios.get(`${API_URL}/api/positions/election/${electionId}`),
        axios.get(`${API_URL}/api/panels/election/${electionId}`),
      ]);
      setElection(elecRes.data);

      // For hall elections, filter positions and panels by voter's hall from admin input
      if (elecRes.data.type === "hall" && voterHall) {
        const filteredPositions = posRes.data.filter(
          (pos) => pos.hall === voterHall,
        );
        const filteredPanels = panelRes.data.filter(
          (panel) => panel.hall === voterHall,
        );
        setPositions(filteredPositions);
        setPanels(filteredPanels);
        console.log(
          `Filtered positions for hall ${voterHall}:`,
          filteredPositions,
        );
        console.log(`Filtered panels for hall ${voterHall}:`, filteredPanels);
      } else {
        setPositions(posRes.data);
        setPanels(panelRes.data);
      }

      console.log("Election data:", elecRes.data);
      console.log("Application fee:", elecRes.data.applicationFee);

      // Check if user already applied for any position in this election
      try {
        const myApplicationsRes = await axios.get(
          `${API_URL}/api/candidates/my-applications`,
        );
        const existingApplication = myApplicationsRes.data.find(
          (app) => app.electionId._id === electionId,
        );
        if (existingApplication) {
          setAlreadyApplied(true);
          setMessage(
            `আপনি ইতিমধ্যে "${existingApplication.positionId.title}" পদের জন্য আবেদন করেছেন। স্ট্যাটাস: ${
              existingApplication.status === "pending"
                ? "অপেক্ষমাণ"
                : existingApplication.status === "approved"
                  ? "অনুমোদিত"
                  : "প্রত্যাখ্যাত"
            }`,
          );
        }
      } catch (error) {
        console.error("Error checking existing applications:", error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    // Upload immediately to Cloudinary
    setIsUploadingPhoto(true);
    setMessage("ছবি আপলোড হচ্ছে...");

    const photoFormData = new FormData();
    photoFormData.append("candidatePhoto", file);

    try {
      console.log("Uploading photo immediately...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const uploadRes = await axios.post(
        `${API_URL}/api/candidates/upload-photo`,
        photoFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setUploadedPhotoUrl(uploadRes.data.photoUrl);
      console.log("Photo uploaded successfully:", uploadRes.data.photoUrl);
      setMessage("ছবি সফলভাবে আপলোড হয়েছে! ✓");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (uploadError) {
      console.error("Photo upload failed:", uploadError);
      console.error("Upload error response:", uploadError.response?.data);
      setMessage(
        `ছবি আপলোড ব্যর্থ হয়েছে: ${uploadError.response?.data?.message || uploadError.message}`,
      );
      setCandidatePhoto(null);
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if payment is required first
    if (
      election?.applicationFee > 0 &&
      (election?.type === "hall" ||
        election?.type === "main" ||
        election?.type === "society") &&
      !paymentId
    ) {
      // Payment required but not done yet - show payment modal
      setPaymentAmount(election.applicationFee);
      setShowPaymentModal(true);
      setIsSubmitting(false);
      return;
    }

    // If we reach here, either payment is not required or payment is already done
    const submitData = new FormData();
    submitData.append("positionId", formData.positionId);
    submitData.append("electionId", electionId);
    submitData.append("panelId", formData.panelId || "");
    submitData.append("manifesto", formData.manifesto);

    // Use the uploaded photo URL (already uploaded when user selected the photo)
    if (uploadedPhotoUrl) {
      submitData.append("candidatePhotoUrl", uploadedPhotoUrl);
      console.log("Submitting with uploaded photo URL:", uploadedPhotoUrl);
    } else {
      console.log("No photo URL available for submission");
    }

    if (paymentId) {
      submitData.append("paymentId", paymentId);
      console.log("Submitting with paymentId:", paymentId);
    } else {
      console.log("No paymentId available");
    }

    try {
      await axios.post(`${API_URL}/api/candidates`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("আবেদন সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।");

      // Clear localStorage after successful submission
      localStorage.removeItem("pendingFormData");
      localStorage.removeItem("autoSubmitAfterPayment");
      localStorage.removeItem("pendingElectionId");
      localStorage.removeItem("pendingPositionId");

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Candidate submission error:", error.response?.data);
      setMessage(error.response?.data?.message || "আবেদন জমা ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);

      // Save form data and photo URL to localStorage before payment
      localStorage.setItem(
        "pendingFormData",
        JSON.stringify({
          positionId: formData.positionId,
          panelId: formData.panelId,
          manifesto: formData.manifesto,
          candidatePhotoUrl: uploadedPhotoUrl, // Photo already uploaded
        }),
      );
      localStorage.setItem("autoSubmitAfterPayment", "true");
      localStorage.setItem("pendingElectionId", electionId);
      localStorage.setItem("pendingPositionId", formData.positionId);

      console.log("Saved to localStorage before payment:", {
        electionId: localStorage.getItem("pendingElectionId"),
        positionId: localStorage.getItem("pendingPositionId"),
        photoUrl: uploadedPhotoUrl,
      });

      const response = await axios.post(`${API_URL}/api/payments/init`, {
        electionId,
        positionId: formData.positionId,
        amount: paymentAmount,
      });

      if (response.data.success && response.data.paymentUrl) {
        // Store payment transaction ID
        localStorage.setItem("pendingPaymentId", response.data.transactionId);
        localStorage.setItem("pendingElectionId", electionId);
        localStorage.setItem("pendingPositionId", formData.positionId);

        // Redirect to payment gateway
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      setMessage("পেমেন্ট শুরু করতে ব্যর্থ হয়েছে");
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
          {/* Application Closed Warning */}
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

          {/* Application Fee Info */}
          {election?.applicationFee > 0 &&
            (election?.type === "hall" ||
              election?.type === "main" ||
              election?.type === "society") && (
              <div className="mb-8 p-5 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
                  💳
                </div>
                <div className="flex-1">
                  <p className="text-amber-800 font-black text-sm mb-1">
                    আবেদন ফি প্রয়োজন
                  </p>
                  <p className="text-amber-600 text-sm">
                    এই নির্বাচনে প্রার্থী হতে{" "}
                    <span className="font-bold">
                      ৳{election.applicationFee}
                    </span>{" "}
                    টাকা ফি প্রদান করতে হবে। আবেদন জমা দেওয়ার সময় পেমেন্ট
                    গেটওয়েতে নিয়ে যাওয়া হবে।
                  </p>
                  {paymentId && (
                    <p className="text-emerald-600 text-sm font-bold mt-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
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
                      পেমেন্ট সম্পন্ন হয়েছে
                    </p>
                  )}
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

            {/* Panel Select - Hide for society and CR elections */}
            {election?.type !== "society" && election?.type !== "cr" && (
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
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {uploadedPhotoUrl && (
                      <div className="absolute top-1 right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center ${
                      isUploadingPhoto
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm font-bold text-blue-600">
                          আপলোড হচ্ছে...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm font-bold text-slate-600">
                          ছবি আপলোড করুন
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          সর্বোচ্চ ৫ MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                </label>
              </div>
              {uploadedPhotoUrl && (
                <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                  <span className="text-base">✓</span>
                  ছবি সফলভাবে আপলোড হয়েছে
                </p>
              )}
              {!uploadedPhotoUrl && (
                <p className="mt-2 text-xs text-slate-400">
                  এই ছবিটি নির্বাচনের সময় ব্যালট পেপারে প্রদর্শিত হবে।
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  alreadyApplied ||
                  (election?.type === "society" &&
                    election?.department !== user?.department) ||
                  isSubmitting
                }
                className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  alreadyApplied ||
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
                ) : alreadyApplied ? (
                  "ইতিমধ্যে আবেদন করা হয়েছে"
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl">
                💳
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                আবেদন ফি প্রদান করুন
              </h3>
              <p className="text-slate-600 text-sm">
                প্রার্থী হিসাবে আবেদন করতে আপনাকে ফি প্রদান করতে হবে
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-bold text-sm">
                  আবেদন ফি
                </span>
                <span className="text-3xl font-black text-blue-600">
                  ৳{paymentAmount}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                SSLCommerz এর মাধ্যমে নিরাপদ পেমেন্ট
              </p>
            </div>

            {/* Info about photo */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-blue-900 font-bold text-sm mb-1">
                    গুরুত্বপূর্ণ তথ্য
                  </p>
                  <p className="text-blue-700 text-xs">
                    {uploadedPhotoUrl
                      ? "আপনার ছবি ইতিমধ্যে আপলোড হয়েছে। পেমেন্ট সফল হলে স্বয়ংক্রিয়ভাবে আবেদন জমা হবে।"
                      : "পেমেন্ট সফল হওয়ার পর আপনাকে এই পেজে ফিরিয়ে আনা হবে এবং আবেদন স্বয়ংক্রিয়ভাবে জমা হবে।"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={isSubmitting}
                className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    প্রক্রিয়াকরণ...
                  </>
                ) : (
                  <>
                    পেমেন্ট করুন
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
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
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

export default CandidateApplication;
