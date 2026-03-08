import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const DebugRole = () => {
  const { user } = useContext(AuthContext);
  const [apiResponse, setApiResponse] = useState(null);

  const checkRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/auth/check-role", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiResponse(res.data);
    } catch (error) {
      setApiResponse({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Role Debug Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            From AuthContext (Frontend)
          </h2>
          <pre className="bg-slate-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
          <div className="mt-4">
            <p className="font-bold">
              Role: <span className="text-blue-600">{user?.role}</span>
            </p>
            <p className="font-bold">
              Is Superadmin:{" "}
              <span className="text-purple-600">
                {user?.role === "superadmin" ? "YES ✓" : "NO ✗"}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">From API (Backend)</h2>
          <button
            onClick={checkRole}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Check Role from API
          </button>
          {apiResponse && (
            <pre className="bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">LocalStorage</h2>
          <p className="mb-2">
            <strong>Token:</strong>
          </p>
          <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
            {localStorage.getItem("token")}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">
            ⚠️ If role is not "superadmin":
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Make sure the database has role: "superadmin"</li>
            <li>Log out completely</li>
            <li>Log in again with Google OAuth</li>
            <li>Come back to this page</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugRole;
