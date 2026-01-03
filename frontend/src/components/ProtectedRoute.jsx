import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  console.log("ProtectedRoute: Checking authentication");
  
  const { token, isLoading } = useAuth();
  
  // Also check localStorage directly as fallback
  const localStorageToken = localStorage.getItem("token");
  const hasToken = token || localStorageToken;

  console.log("ProtectedRoute: Token check", { token, localStorageToken, hasToken, isLoading });

  // Don't redirect while loading
  if (isLoading) {
    console.log("ProtectedRoute: Still loading, showing nothing");
    return null;
  }

  // If no token, redirect to login
  if (!hasToken) {
    console.log("ProtectedRoute: No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Token found, rendering children");
  return children;
}