import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  console.log("AuthContext: Initializing");
  
  // State for user data and token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("AuthContext: Checking localStorage for persisted auth");
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            console.log("AuthContext: Restored user from localStorage");
          } catch (parseErr) {
            console.error("AuthContext: Error parsing stored user", parseErr);
          }
        }
        console.log("AuthContext: Token restored from localStorage");
      } else {
        console.log("AuthContext: No token found in localStorage");
      }
    } catch (err) {
      console.error("AuthContext: Error reading localStorage", err);
    } finally {
      setIsLoading(false);
      console.log("AuthContext: Initialization complete");
    }
  }, []); // Run only once on mount

  // Compute isAuthenticated from token
  const isAuthenticated = !!token;

  // Login function - stores token and user in state and localStorage
  const login = useCallback((userData, authToken) => {
    console.log("AuthContext: Login called", { userEmail: userData?.email });
    try {
      // Store token
      localStorage.setItem("token", authToken);
      setToken(authToken);
      
      // Store user data
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
      
      console.log("AuthContext: Login successful, user and token stored");
    } catch (err) {
      console.error("AuthContext: Error saving to localStorage", err);
    }
  }, []);

  // Logout function - removes token and user from state and localStorage
  const logout = useCallback(() => {
    console.log("AuthContext: Logout called");
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      console.log("AuthContext: Logout successful");
    } catch (err) {
      console.error("AuthContext: Error removing from localStorage", err);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  }), [user, token, isAuthenticated, isLoading, login, logout]);

  console.log("AuthContext: Rendering provider", { 
    isAuthenticated, 
    hasUser: !!user, 
    isLoading 
  });

  // Always render children - loading state is available but doesn't block rendering
  // This prevents blank screens while still allowing components to show loading UI
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
      isAuthenticated: false,
      isLoading: false,
      login: () => {},
      logout: () => {}
    };
  }
  return context;
};