import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [userPlants, setUserPlants] = useState([]);
  const [availablePlants, setAvailablePlants] = useState([]);
  const [plantsUnavailableMessage, setPlantsUnavailableMessage] =
    useState(null);

  const [newPlantId, setNewPlantId] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [isFetchingPlants, setIsFetchingPlants] = useState(false);
  const [wateringPlantId, setWateringPlantId] = useState("");

  const getStoredToken = () => token || localStorage.getItem("token");

  const formatDate = (dateValue) => {
    if (!dateValue) return "Today";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchUserPlants = async () => {
    setIsFetchingPlants(true);

    try {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setError("Session expired. Please log in again.");
        return;
      }

      const res = await api.get("/user-plants", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      setUserPlants(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Unable to load your plants.");
      }
    } finally {
      setIsFetchingPlants(false);
    }
  };

  const fetchAvailablePlants = async () => {
    try {
      const res = await api.get("/plants");

      if (Array.isArray(res.data) && res.data.length > 0) {
        setAvailablePlants(res.data);
        setPlantsUnavailableMessage(null);
      } else {
        setAvailablePlants([]);
        setPlantsUnavailableMessage("Plants unavailable");
      }
    } catch {
      setAvailablePlants([]);
      setPlantsUnavailableMessage("Plants unavailable");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPlants();
      fetchAvailablePlants();
    }
  }, [token, isAuthenticated]);

  const duePlants = useMemo(() => {
    return userPlants.filter((plant) => plant?.reminder?.daysLeft === 0);
  }, [userPlants]);

  const stats = useMemo(() => {
    const totalPlants = userPlants.length;

    const dueToday = duePlants.length;

    const healthyPlants = userPlants.filter(
      (plant) =>
        typeof plant?.reminder?.daysLeft === "number" &&
        plant.reminder.daysLeft > 0
    ).length;

    const recentlyWatered = userPlants.filter(
      (plant) =>
        Array.isArray(plant.wateredHistory) && plant.wateredHistory.length > 0
    ).length;

    return { totalPlants, dueToday, healthyPlants, recentlyWatered };
  }, [userPlants, duePlants]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();

    if (isAddingPlant) return;

    setSuccess(null);

    if (!newPlantId) {
      setError("Please select a plant.");
      return;
    }

    if (!newNickname.trim()) {
      setError("Please give your plant a nickname.");
      return;
    }

    const storedToken = getStoredToken();
    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    setIsAddingPlant(true);

    try {
      await api.post(
        "/user-plants",
        {
          plantId: newPlantId,
          nickname: newNickname.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      setError(null);
      setSuccess("Plant added successfully 🌱");
      setNewPlantId("");
      setNewNickname("");

      await fetchUserPlants();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to add plant.");
      }
    } finally {
      setIsAddingPlant(false);
    }
  };

  const handleWaterPlant = async (plantId) => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    clearMessages();
    setWateringPlantId(plantId);

    try {
      const res = await api.post(
        `/user-plants/${plantId}/water`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      setSuccess(res.data?.message || "Plant watered successfully 💧");
      await fetchUserPlants();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to water plant right now.");
      }
    } finally {
      setWateringPlantId("");
    }
  };

  if (isLoading) {
    return <p className="dashboard-loading">Loading dashboard...</p>;
  }

  if (!isAuthenticated) {
    return <p className="dashboard-loading">Please log in to continue.</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-hero">
          <div className="dashboard-hero-main">
            <p className="dashboard-subtitle">Plant Overview</p>

            <h1 className="dashboard-heading">
              Welcome back, <span>{user?.name || "Plant Parent"}</span> 🌿
            </h1>

            <p className="dashboard-text">
              Track your plants, check which ones need care today, and manage
              your collection with a calm, clear overview.
            </p>

            <div className="dashboard-chip-row">
              <span className="dashboard-chip">Plant collection</span>
              <span className="dashboard-chip">Water reminders</span>
              <span className="dashboard-chip">Daily care</span>
            </div>
          </div>

          <div className="dashboard-user-card">
            <p className="dashboard-user-label">Your Profile</p>
            <h3 className="dashboard-user-name">
              {user?.name || "Plant Parent"}
            </h3>
            <p className="dashboard-user-email">{user?.email}</p>
            <p className="dashboard-user-status">
              <strong>Status:</strong> Logged in
            </p>

            <button className="dashboard-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>

        {error && <div className="dashboard-message error">{error}</div>}
        {success && <div className="dashboard-message success">{success}</div>}

        <section className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Plants</h3>
            <p>{stats.totalPlants}</p>
            <span>Your personal collection</span>
          </div>

          <div className="stat-card">
            <h3>Need Water Today</h3>
            <p>{stats.dueToday}</p>
            <span>Plants needing attention now</span>
          </div>

          <div className="stat-card">
            <h3>Healthy / Upcoming</h3>
            <p>{stats.healthyPlants}</p>
            <span>Plants with time left</span>
          </div>

          <div className="stat-card">
            <h3>Watered Before</h3>
            <p>{stats.recentlyWatered}</p>
            <span>Plants with watering history</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Quick Add Plant</h2>
              <span>{availablePlants.length} types</span>
            </div>

            <form className="dashboard-form" onSubmit={handleAddPlant}>
              {plantsUnavailableMessage ? (
                <p className="panel-empty">{plantsUnavailableMessage}</p>
              ) : (
                <select
                  className="dashboard-input"
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
                className="dashboard-input"
                placeholder="Enter a nickname"
                value={newNickname}
                onChange={(e) => {
                  setNewNickname(e.target.value);
                  if (error) setError(null);
                }}
              />

              <button
                className="dashboard-primary-btn"
                type="submit"
                disabled={isAddingPlant || !newPlantId || !newNickname.trim()}
              >
                {isAddingPlant ? "Adding..." : "Add Plant"}
              </button>
            </form>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Plants Needing Attention</h2>
              <span>{stats.dueToday}</span>
            </div>

            {duePlants.length === 0 ? (
              <p className="panel-empty">No plants need watering today 🌱</p>
            ) : (
              <div className="attention-list">
                {duePlants.slice(0, 4).map((plant) => (
                  <div className="attention-item" key={plant._id}>
                    <h4>{plant.nickname}</h4>
                    <p>{plant.plant?.name || "Unknown Plant"}</p>
                    <span>Water today</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-recent">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Your Recent Plants</h2>
              <span>{userPlants.length}</span>
            </div>

            {isFetchingPlants ? (
              <p className="panel-empty">Loading your plants...</p>
            ) : userPlants.length === 0 ? (
              <p className="panel-empty">
                No plants added yet. Start by adding one above.
              </p>
            ) : (
              <div className="recent-plants-grid">
                {userPlants.slice(0, 6).map((plant) => (
                  <div className="recent-plant-card" key={plant._id}>
                    <div className="recent-plant-top">
                      <h3>{plant.nickname}</h3>
                      <span>{plant.plant?.name || "Unknown Plant"}</span>
                    </div>

                    <div className="recent-plant-meta">
                      <p>
                        <strong>Next Water:</strong>{" "}
                        {formatDate(plant.reminder?.nextWaterDate)}
                      </p>
                      <p>
                        <strong>Days Left:</strong>{" "}
                        {typeof plant.reminder?.daysLeft === "number"
                          ? plant.reminder.daysLeft
                          : "Not available"}
                      </p>
                      <p>
                        <strong>Sunlight:</strong>{" "}
                        {plant.plant?.sunlight || "Not specified"}
                      </p>
                    </div>

                    <button
                      className="dashboard-primary-btn"
                      style={{ marginTop: "16px" }}
                      onClick={() => handleWaterPlant(plant._id)}
                      disabled={wateringPlantId === plant._id}
                    >
                      {wateringPlantId === plant._id
                        ? "Updating..."
                        : "Mark Watered"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}