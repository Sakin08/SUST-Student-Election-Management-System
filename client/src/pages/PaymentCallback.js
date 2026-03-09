import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const PaymentCallback = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Extract status and transactionId from params
  // Supports both /payment/:status/:transactionId and /payment/success/:transactionId
  const status =
    params.status ||
    (window.location.pathname.includes("/success")
      ? "success"
      : window.location.pathname.includes("/fail")
        ? "fail"
        : window.location.pathname.includes("/cancel")
          ? "cancel"
          : "unknown");
  const transactionId = params.transactionId;

  useEffect(() => {
    if (transactionId) {
      handlePaymentCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const handlePaymentCallback = async () => {
    try {
      // Check payment status
      const response = await axios.get(
        `${API_URL}/api/payments/status/${transactionId}`,
      );

      if (response.data.status === "success") {
        // Get stored election and position IDs
        const electionId = localStorage.getItem("pendingElectionId");
        const positionId = localStorage.getItem("pendingPositionId");

        console.log("Retrieved from localStorage:", { electionId, positionId });

        // Store payment ID for candidate application
        localStorage.setItem("completedPaymentId", response.data._id);

        // Clear pending payment ID but keep election/position for redirect
        localStorage.removeItem("pendingPaymentId");

        if (electionId) {
          setMessage("পেমেন্ট সফল হয়েছে! আবেদন পেজে ফিরে যাচ্ছেন...");
          // Redirect back to application page after 2 seconds
          setTimeout(() => {
            navigate(`/apply/${electionId}`);
          }, 2000);
        } else {
          setMessage(
            "পেমেন্ট সফল হয়েছে! ড্যাশবোর্ডে ফিরে গিয়ে আবেদন সম্পূর্ণ করুন।",
          );
        }
      } else {
        setMessage("পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (error) {
      console.error("Payment callback error:", error);
      setMessage("পেমেন্ট যাচাই করতে সমস্যা হয়েছে। ড্যাশবোর্ডে ফিরে যান।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              পেমেন্ট যাচাই করা হচ্ছে...
            </h2>
            <p className="text-slate-500">অনুগ্রহ করে অপেক্ষা করুন</p>
          </>
        ) : (
          <>
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ${
                status === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {status === "success" ? "✓" : "✗"}
            </div>
            <h2
              className={`text-2xl font-black mb-4 ${
                status === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {status === "success" ? "পেমেন্ট সফল!" : "পেমেন্ট ব্যর্থ"}
            </h2>
            <p className="text-slate-600 mb-6">{message}</p>

            <button
              onClick={() => {
                const electionId = localStorage.getItem("pendingElectionId");
                if (electionId && status === "success") {
                  navigate(`/apply/${electionId}`);
                } else {
                  navigate("/");
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              {status === "success"
                ? "আবেদন পেজে ফিরে যান"
                : "ড্যাশবোর্ডে ফিরে যান"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
