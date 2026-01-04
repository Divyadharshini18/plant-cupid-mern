import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  console.log("ProtectedRoute: Checking authentication");
  
  // Safely get auth state from context (returns safe defaults if context is missing)
  const { isAuthenticated, isLoading } = useAuth();

  console.log("ProtectedRoute: Authentication status", { isAuthenticated, isLoading });

  // Show loading state while checking auth (graceful, doesn't block)
  if (isLoading) {
    console.log("ProtectedRoute: Still loading, showing loading state");
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  // Using 'replace' prevents adding to history stack (avoids infinite redirects)
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Authenticated, rendering children");
  return children;
}