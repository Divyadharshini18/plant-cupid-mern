import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) { // prevents unauthenticated users from accessing certain pages
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // if user is not logged in, redirect to login page
  }

  return children; // user is logged in - render the page they wanted
}