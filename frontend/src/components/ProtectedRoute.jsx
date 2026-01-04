import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  console.log("ProtectedRoute: Checking authentication");
  
  // Safely get isAuthenticated from context (returns false if context is missing)
  const { isAuthenticated } = useAuth();

  console.log("ProtectedRoute: Authentication status", { isAuthenticated });

  // If not authenticated, redirect to login
  // Using 'replace' prevents adding to history stack (avoids infinite redirects)
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Authenticated, rendering children");
  return children;
}