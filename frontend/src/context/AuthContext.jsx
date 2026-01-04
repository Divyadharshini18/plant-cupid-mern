import { createContext, useContext, useState, useMemo, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  console.log("AuthContext: Initializing");
  
  // Read token from localStorage once on mount (lazy initializer)
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token");
    } catch (err) {
      console.error("AuthContext: Error reading localStorage", err);
      return null;
    }
  });

  // Compute isAuthenticated from token
  const isAuthenticated = !!token;

  // Login function - stores token in state and localStorage
  const login = useCallback((newToken) => {
    console.log("AuthContext: Login called");
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } catch (err) {
      console.error("AuthContext: Error writing to localStorage", err);
    }
  }, []);

  // Logout function - removes token from state and localStorage
  const logout = useCallback(() => {
    console.log("AuthContext: Logout called");
    try {
      localStorage.removeItem("token");
      setToken(null);
    } catch (err) {
      console.error("AuthContext: Error removing from localStorage", err);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    isAuthenticated,
    login,
    logout
  }), [isAuthenticated, login, logout]);

  console.log("AuthContext: Rendering provider", { isAuthenticated });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within AuthProvider");
    // Return safe defaults instead of throwing
    return {
      isAuthenticated: false,
      login: () => {},
      logout: () => {}
    };
  }
  return context;
};