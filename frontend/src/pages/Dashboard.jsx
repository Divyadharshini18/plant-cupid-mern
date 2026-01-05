import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function Dashboard() {
  console.log("Dashboard: Rendering");
  
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const [error, setError] = useState(null); // null = no error, string = error message
  const [plantCount, setPlantCount] = useState(null); // null = unknown, number when loaded
  const [isFetchingPlants, setIsFetchingPlants] = useState(false);

  // On mount, fetch protected user plants using JWT from localStorage
  useEffect(() => {
    const fetchUserPlants = async () => {
      console.log("Dashboard: Fetching user plants");
      setIsFetchingPlants(true);

      try {
        // Prefer token from AuthContext, fall back to localStorage
        const storedToken =
          token || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);

        if (!storedToken) {
          console.warn("Dashboard: No token found, skipping user plants fetch");
          setError("Session expired. Please log in again.");
          setIsFetchingPlants(false);
          return;
        }

        const res = await api.get("/user-plants", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        console.log("Dashboard: /api/user-plants success:", {
          status: res.status,
          count: Array.isArray(res.data) ? res.data.length : null,
        });

        if (Array.isArray(res.data)) {
          setPlantCount(res.data.length);
        } else {
          setPlantCount(0);
        }
      } catch (err) {
        // Handle errors gracefully without crashing the UI
        if (err.response) {
          const status = err.response.status;
          console.error("Dashboard: /api/user-plants error response:", {
            status,
            data: err.response.data,
          });

          if (status === 401 || status === 403) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Unable to load your plants right now. Please try again later.");
          }
        } else if (err.request) {
          console.error("Dashboard: /api/user-plants network error:", err.request);
          setError("Network error while loading your plants. They will appear when the connection is restored.");
        } else {
          console.error("Dashboard: /api/user-plants unexpected error:", err.message);
          setError("An unexpected error occurred while loading your plants.");
        }
      } finally {
        setIsFetchingPlants(false);
      }
    };

    // Only attempt fetch once on mount
    fetchUserPlants();
  }, [token]);

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
      {/* Show simple info about protected data fetch */}
      {isAuthenticated && plantCount !== null && (
        <p>Your plants in collection: {plantCount}</p>
      )}
      {isAuthenticated && plantCount === null && isFetchingPlants && (
        <p>Loading your plants...</p>
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