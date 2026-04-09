import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  // prevents unauthenticated users from accessing certain pages
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // if user is not logged in, redirect to login page
  }

  return children; // user is logged in - render the page they wanted
}