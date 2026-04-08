import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAvailablePlants,
  getUserPlants,
  addUserPlant,
  waterUserPlant,
} from "../services/plantService";
import { clearProfileCache } from "../services/cache";

export default function Dashboard() {
  const { user, token, isAuthenticated, isLoading } = useAuth();

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

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

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

  const fetchUserPlants = async (force = false) => {
    setIsFetchingPlants(true);

    try {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setError("Session expired. Please log in again.");
        return;
      }

      const plants = await getUserPlants(storedToken, { force });
      setUserPlants(plants);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your plants.");
    } finally {
      setIsFetchingPlants(false);
    }
  };

  const fetchAvailablePlants = async (force = false) => {
    try {
      const plants = await getAvailablePlants({ force });

      if (Array.isArray(plants) && plants.length > 0) {
        setAvailablePlants(plants);
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
        plant.reminder.daysLeft > 0,
    ).length;

    const recentlyWatered = userPlants.filter(
      (plant) =>
        Array.isArray(plant.wateredHistory) && plant.wateredHistory.length > 0,
    ).length;

    return { totalPlants, dueToday, healthyPlants, recentlyWatered };
  }, [userPlants, duePlants]);

  const canWaterPlant = (plant) => {
    return plant?.reminder?.daysLeft === 0;
  };

  const getWaterButtonText = (plant) => {
    if (wateringPlantId === plant._id) return "Updating...";
    if (canWaterPlant(plant)) return "Water Now";
    return "Watered";
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
      await addUserPlant(storedToken, {
        plantId: newPlantId,
        nickname: newNickname.trim(),
      });

      clearProfileCache();
      setError(null);
      setSuccess("Plant added successfully 🌱");
      setNewPlantId("");
      setNewNickname("");

      await fetchUserPlants(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add plant.");
    } finally {
      setIsAddingPlant(false);
    }
  };

  const handleWaterPlant = async (plant) => {
    if (!canWaterPlant(plant)) return;

    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    clearMessages();
    setWateringPlantId(plant._id);

    try {
      const res = await waterUserPlant(storedToken, plant._id);

      clearProfileCache();
      setSuccess(res?.message || "Plant watered successfully 💧");
      await fetchUserPlants(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to water plant right now.",
      );
    } finally {
      setWateringPlantId("");
    }
  };

  if (isLoading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <p className="dashboard-loading">Please log in to continue.</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-hero simple-hero">
          <div className="dashboard-hero-main hero-full">
            <p className="dashboard-subtitle">Plant Overview</p>

            <h1 className="dashboard-heading">
              Welcome back, <span>{user?.name || "Plant Parent"}</span> 🌿
            </h1>

            <p className="dashboard-text">
              Track your plants, see what needs watering today, and manage your
              collection in one clean space.
            </p>

            <div className="dashboard-chip-row">
              <span className="dashboard-chip">Plant collection</span>
              <span className="dashboard-chip">Water reminders</span>
              <span className="dashboard-chip">Care tracking</span>
            </div>
          </div>
        </section>

        <section className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Plants</h3>
            <p>{stats.totalPlants}</p>
            <span>Your plant collection</span>
          </div>

          <div className="stat-card">
            <h3>Need Water Today</h3>
            <p>{stats.dueToday}</p>
            <span>Needs care now</span>
          </div>

          <div className="stat-card">
            <h3>Healthy / Upcoming</h3>
            <p>{stats.healthyPlants}</p>
            <span>Still in cooldown</span>
          </div>

          <div className="stat-card">
            <h3>Watered Before</h3>
            <p>{stats.recentlyWatered}</p>
            <span>Has watering history</span>
          </div>
        </section>

        {error && <div className="dashboard-message error">{error}</div>}
        {success && <div className="dashboard-message success">{success}</div>}

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
                    <div className="attention-top">
                      <div>
                        <h4>{plant.nickname}</h4>
                        <p>{plant.plant?.name || "Unknown Plant"}</p>
                      </div>

                      <button
                        type="button"
                        className={`water-action-btn ${
                          canWaterPlant(plant) ? "active" : "inactive"
                        }`}
                        onClick={() => handleWaterPlant(plant)}
                        disabled={
                          wateringPlantId === plant._id || !canWaterPlant(plant)
                        }
                      >
                        {getWaterButtonText(plant)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-recent">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Your Plants</h2>
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
                {userPlants.map((plant) => (
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
                      <p>
                        <strong>Frequency:</strong>{" "}
                        {plant.plant?.waterFrequency || "Not set"} days
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`dashboard-primary-btn card-water-btn ${
                        canWaterPlant(plant) ? "" : "button-watered"
                      }`}
                      onClick={() => handleWaterPlant(plant)}
                      disabled={
                        wateringPlantId === plant._id || !canWaterPlant(plant)
                      }
                    >
                      {getWaterButtonText(plant)}
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
