import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  const [error, setError] = useState(null);
  const [plantCount, setPlantCount] = useState(null);
  const [isFetchingPlants, setIsFetchingPlants] = useState(false);
  const [availablePlants, setAvailablePlants] = useState([]);
  const [plantsUnavailableMessage, setPlantsUnavailableMessage] = useState(null);
  const [newPlantId, setNewPlantId] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [addMessage, setAddMessage] = useState(null);
  const [isAddingPlant, setIsAddingPlant] = useState(false);

  const getStoredToken = () =>
    token || localStorage.getItem("token");

  const fetchUserPlants = async () => {
    setIsFetchingPlants(true);
    try {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setError("Session expired. Please log in again.");
        return;
      }

      const res = await api.get("/user-plants", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      setPlantCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Unable to load your plants.");
      }
    } finally {
      setIsFetchingPlants(false);
    }
  };

  useEffect(() => {
    fetchUserPlants();
  }, [token]);

  useEffect(() => {
    const fetchAvailablePlants = async () => {
      try {
        const res = await api.get("/plants");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvailablePlants(res.data);
        } else {
          setAvailablePlants([]);
          setPlantsUnavailableMessage("Plants unavailable");
        }
      } catch {
        setAvailablePlants([]);
        setPlantsUnavailableMessage("Plants unavailable");
      }
    };
    fetchAvailablePlants();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    setAddMessage(null);

    if (!newPlantId) return setError("Please select a plant.");
    if (!newNickname.trim()) return setError("Please give your plant a nickname.");

    const storedToken = getStoredToken();
    if (!storedToken) return setError("Please login again.");

    setIsAddingPlant(true);

    try {
      await api.post(
        "/user-plants",
        { plantId: newPlantId, nickname: newNickname.trim() },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setAddMessage("Plant added successfully.");
      setNewPlantId("");
      setNewNickname("");
      setError(null);
      fetchUserPlants();
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Nickname already exists. Try a different one.");
      } else {
        setError("Failed to add plant.");
      }
    } finally {
      setIsAddingPlant(false);
    }
  };

  if (isLoading) {
    return <p className="dashboard-loading">Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard 🌱</h1>

      {error && <p className="auth-error">{error}</p>}
      {addMessage && <p className="auth-success">{addMessage}</p>}

      {isAuthenticated && plantCount !== null && (
        <p className="dashboard-info">
          Your plants in collection: <strong>{plantCount}</strong>
        </p>
      )}

      {isAuthenticated && (
        <form className="dashboard-form" onSubmit={handleAddPlant}>
          <h3>Add a Plant</h3>

          {plantsUnavailableMessage ? (
            <p>{plantsUnavailableMessage}</p>
          ) : (
            <select
              className="auth-input"
              value={newPlantId}
              onChange={(e) => setNewPlantId(e.target.value)}
            >
              <option value="">Select a plant</option>
              {availablePlants.map((plant) => (
                <option key={plant._id} value={plant._id}>
                  {plant.name}
                </option>
              ))}
            </select>
          )}

          <input
            className="auth-input"
            placeholder="Nickname"
            value={newNickname}
            onChange={(e) => {
              setNewNickname(e.target.value);
              if (error) setError(null);
            }}
          />

          <button
            className="auth-button"
            type="submit"
            disabled={isAddingPlant || !newPlantId || !newNickname.trim()}
          >
            {isAddingPlant ? "Adding..." : "Add Plant"}
          </button>
        </form>
      )}

      {isAuthenticated && user ? (
        <div className="dashboard-user">
          <p>Welcome, {user.name || user.email}</p>
          <p>Email: {user.email}</p>
          <button className="dashboard-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in to access your dashboard.</p>
      )}
    </div>
  );
}