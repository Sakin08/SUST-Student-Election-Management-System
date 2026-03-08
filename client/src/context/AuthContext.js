import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.baseURL = API_URL;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log("AuthContext: Fetching user from API");
      console.log("AuthContext: API URL:", API_URL);
      console.log(
        "AuthContext: Token:",
        localStorage.getItem("token")?.substring(0, 20) + "...",
      );
      const res = await axios.get(`${API_URL}/api/auth/me`);
      console.log("AuthContext: User fetched successfully", res.data);
      console.log("AuthContext: User role:", res.data.role);
      setUser(res.data);
    } catch (error) {
      console.error("AuthContext: Error fetching user", error);
      console.error("AuthContext: Error response:", error.response?.data);
      console.error("AuthContext: Error status:", error.response?.status);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    console.log("AuthContext: Saving token to localStorage");
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.baseURL = API_URL;
    console.log("AuthContext: Fetching user data");
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
