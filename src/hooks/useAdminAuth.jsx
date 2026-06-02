import { createContext, useContext, useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { Outlet } from "react-router-dom";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load session persistence on mount
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem("WV_ADMIN_TOKEN");
      if (savedToken === "wv_authorized_v1") {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Could not query session persistence:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit passcode to API. Persists result inside sessionStorage
   */
  const login = async (pin) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await adminService.verifyPin(pin);
      if (result.success) {
        sessionStorage.setItem("WV_ADMIN_TOKEN", "wv_authorized_v1");
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(result.message || "Invalid Admin PIN");
      }
    } catch (err) {
      console.error("Passcode verification query failed:", err);
      setAuthError(err.message || "Verification failed. Check API connectivity.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Terminate active administration session
   */
  const logout = () => {
    try {
      sessionStorage.removeItem("WV_ADMIN_TOKEN");
    } catch (err) {
      console.error("Could not wipe session caches:", err);
    }
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, loading, authError, login, logout }}>
      {children || <Outlet />}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be resolved inside AdminAuthProvider context tree.");
  }
  return context;
};
