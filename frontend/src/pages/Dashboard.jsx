import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  console.log("Dashboard: Rendering");
  
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const [error, setError] = useState(null); // null = no error, string = error message

  // Show loading state while checking auth (graceful, doesn't block)
  if (isLoading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    console.log("Dashboard: Logging out");
    try {
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Dashboard: Logout error", err);
      setError("Failed to log out. Please try again.");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {error && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "10px", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c33"
        }}>
          {error}
        </div>
      )}
      {isAuthenticated && user ? (
        <div>
          <p>Welcome, {user.name || user.email}!</p>
          <p>Email: {user.email}</p>
          <p>Status: Logged in</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Status: Guest</p>
          <p>Please log in to access your dashboard.</p>
        </div>
      )}
    </div>
  );
}