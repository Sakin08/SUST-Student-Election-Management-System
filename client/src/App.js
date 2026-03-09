import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import ElectionDetails from "./pages/ElectionDetails";
import VotingPage from "./pages/VotingPage";
import CandidateApplication from "./pages/CandidateApplication";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import CandidateProfile from "./pages/CandidateProfile";
import ForceRelogin from "./pages/ForceRelogin";
import DebugRole from "./pages/DebugRole";
import PaymentCallback from "./pages/PaymentCallback";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/force-relogin" element={<ForceRelogin />} />
            <Route path="/debug-role" element={<DebugRole />} />
            <Route
              path="/payment/:status/:transactionId"
              element={<PaymentCallback />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-election"
              element={
                <PrivateRoute adminOnly>
                  <CreateElection />
                </PrivateRoute>
              }
            />
            <Route
              path="/election/:id"
              element={
                <PrivateRoute>
                  <ElectionDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/vote/:electionId"
              element={
                <PrivateRoute>
                  <VotingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/apply/:electionId"
              element={
                <PrivateRoute>
                  <CandidateApplication />
                </PrivateRoute>
              }
            />
            <Route
              path="/results/:electionId"
              element={
                <PrivateRoute>
                  <Results />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate-profile"
              element={
                <PrivateRoute>
                  <CandidateProfile />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
