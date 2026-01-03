import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  console.log("AuthContext: Initializing");
  
  // Initialize user state from localStorage token if available
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for token on mount (only once)
  useEffect(() => {
    console.log("AuthContext: Checking for token in localStorage");
    const token = localStorage.getItem("token");
    if (token) {
      console.log("AuthContext: Token found, setting user");
      // For now, just set a basic user object
      // In future, you can decode token here if needed
      setUser({ token, email: "User" });
    } else {
      console.log("AuthContext: No token found");
    }
    setIsLoading(false);
  }, []); // Empty dependency array - only run once on mount

  const login = (userData) => {
    console.log("AuthContext: Login called", userData);
    setUser(userData);
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token: user?.token || localStorage.getItem("token"),
    login,
    logout,
    isLoading
  }), [user, isLoading]);

  console.log("AuthContext: Rendering provider with value", value);

  // Always render children - don't block rendering during loading
  // The loading state is just for components that need to know
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
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      isLoading: false
    };
  }
  return context;
};