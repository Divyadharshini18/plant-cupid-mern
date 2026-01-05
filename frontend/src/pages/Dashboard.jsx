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
  const [availablePlants, setAvailablePlants] = useState([]); // all plants from /api/plants
  const [plantsUnavailableMessage, setPlantsUnavailableMessage] = useState(null);
  const [newPlantId, setNewPlantId] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [addMessage, setAddMessage] = useState(null); // success/info message for adds
  const [isAddingPlant, setIsAddingPlant] = useState(false);

  // Helper to get a token from context or localStorage
  const getStoredToken = () => {
    return (
      token ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null)
    );
  };

  // Shared function to fetch user's plants (used on mount and after add)
  const fetchUserPlants = async () => {
    console.log("Dashboard: Fetching user plants");
    setIsFetchingPlants(true);

    try {
      const storedToken = getStoredToken();

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
        setError(
          "Network error while loading your plants. They will appear when the connection is restored."
        );
      } else {
        console.error("Dashboard: /api/user-plants unexpected error:", err.message);
        setError("An unexpected error occurred while loading your plants.");
      }
    } finally {
      setIsFetchingPlants(false);
    }
  };

  // On mount, fetch protected user plants using JWT from localStorage
  useEffect(() => {
    // Only attempt fetch once on mount
    fetchUserPlants();
  }, [token]);

  // On mount, fetch list of available plants (public, no auth)
  useEffect(() => {
    const fetchAvailablePlants = async () => {
      console.log("Dashboard: Fetching available plants");
      setPlantsUnavailableMessage(null);

      try {
        const res = await api.get("/plants");
        console.log("Dashboard: /api/plants success:", {
          status: res.status,
          count: Array.isArray(res.data) ? res.data.length : null,
        });

        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvailablePlants(res.data);
        } else {
          setAvailablePlants([]);
          setPlantsUnavailableMessage("Plants unavailable");
        }
      } catch (err) {
        console.error("Dashboard: /api/plants error:", err);
        setAvailablePlants([]);
        setPlantsUnavailableMessage("Plants unavailable");
      }
    };

    fetchAvailablePlants();
  }, []);

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

  const handleAddPlant = async (e) => {
    e.preventDefault();
    console.log("Dashboard: Attempting to add plant", {
      plantId: newPlantId,
      nickname: newNickname,
    });

    // Reset messages
    setAddMessage(null);

    // Basic validation
    if (!newPlantId) {
      setError("Please select a plant to add.");
      return;
    }

    const storedToken = getStoredToken();
    if (!storedToken) {
      setError("Please login again to add plants.");
      return;
    }

    setIsAddingPlant(true);

    try {
      const payload = { plantId: newPlantId };
      if (newNickname.trim()) {
        payload.nickname = newNickname.trim();
      }

      const res = await api.post("/user-plants", payload, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      console.log("Dashboard: /api/user-plants POST success:", {
        status: res.status,
        data: res.data,
      });

      setError(null);
      setAddMessage("Plant added successfully.");
      // Clear form fields
      setNewPlantId("");
      setNewNickname("");

      // Refresh plant list safely
      fetchUserPlants();
    } catch (err) {
      // Handle write errors without crashing UI
      let addErrorMessage = "Failed to add plant. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        console.error("Dashboard: /api/user-plants POST error response:", {
          status,
          data: errorData,
        });

        if (status === 400) {
          addErrorMessage =
            errorData?.message || "Invalid plant data. Please check the ID and try again.";
        } else if (status === 401 || status === 403) {
          addErrorMessage = "Please login again to add plants.";
        } else if (status >= 500) {
          addErrorMessage = "Server error while adding plant. Please try again later.";
        }
      } else if (err.request) {
        console.error("Dashboard: /api/user-plants POST network error:", err.request);
        addErrorMessage =
          "Network error while adding plant. The plant will be added when the connection is stable.";
      } else {
        console.error("Dashboard: /api/user-plants POST unexpected error:", err.message);
      }

      setError(addErrorMessage);
    } finally {
      setIsAddingPlant(false);
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

      {/* Minimal form to add a plant safely */}
      {isAuthenticated && (
        <form onSubmit={handleAddPlant} style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h3>Add a Plant</h3>
          {addMessage && (
            <div
              style={{
                padding: "8px",
                marginBottom: "8px",
                backgroundColor: "#eef",
                border: "1px solid #ccf",
                borderRadius: "4px",
                color: "#336",
              }}
            >
              {addMessage}
            </div>
          )}
          <div style={{ marginBottom: "8px" }}>
            {plantsUnavailableMessage ? (
              <p>{plantsUnavailableMessage}</p>
            ) : (
              <select
                value={newPlantId}
                onChange={(e) => {
                  setNewPlantId(e.target.value);
                  // Keep main error visible until user submits again
                }}
              >
                <option value="">Select a plant</option>
                {availablePlants.map((plant) => (
                  <option key={plant._id} value={plant._id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <input
              placeholder="Nickname (optional)"
              value={newNickname}
              onChange={(e) => {
                setNewNickname(e.target.value);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isAddingPlant || !newPlantId || !!plantsUnavailableMessage}
          >
            {isAddingPlant ? "Adding..." : "Add Plant"}
          </button>
        </form>
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