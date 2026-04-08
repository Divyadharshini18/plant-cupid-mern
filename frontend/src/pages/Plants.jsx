import { useEffect, useState } from "react";
import {
  getAvailablePlants,
  getUserPlants,
  addUserPlant,
  updateUserPlantNickname,
  deleteUserPlant,
  getPlantImage,
} from "../services/plantService";
import { clearProfileCache } from "../services/cache";
import { useAuth } from "../context/AuthContext";

function Plants() {
  const { token, isLoading, isAuthenticated } = useAuth();

  const USER_PLANTS_CACHE_KEY = "plant_cupid_user_plants";
  const AVAILABLE_PLANTS_CACHE_KEY = "plant_cupid_available_plants";
  const PLANT_IMAGES_CACHE_KEY = "plant_cupid_plant_images";

  const readCache = (key, fallback) => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeCache = (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore cache errors
    }
  };

  const [userPlants, setUserPlants] = useState([]);
  const [availablePlants, setAvailablePlants] = useState([]);
  const [images, setImages] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState("");
  const [nickname, setNickname] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [newPlantId, setNewPlantId] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [isAddingPlant, setIsAddingPlant] = useState(false);

  const getStoredToken = () => token || localStorage.getItem("token");

  const fetchPlantImages = async (plants) => {
    const nextImages = { ...images };

    for (const item of plants) {
      const plantName = item.plant?.name;
      const imageKey = plantName?.toLowerCase();

      if (!plantName || nextImages[imageKey]) continue;

      const imageUrl = await getPlantImage(plantName);
      nextImages[imageKey] = imageUrl;
    }

    setImages(nextImages);
  };

  const fetchUserPlantsData = async (force = false) => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    const plantsData = await getUserPlants(storedToken, { force });
    setUserPlants(plantsData);
    await fetchPlantImages(plantsData);
  };

  const fetchAvailablePlantsData = async (force = false) => {
    const plantsData = await getAvailablePlants({ force });
    setAvailablePlants(plantsData);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([fetchUserPlants(), fetchAvailablePlants()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plants data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setLoading(false);
      return;
    }

    if (!isAuthenticated) return;

    const loadPlantsPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [plantsData, availableData] = await Promise.all([
          getUserPlants(getStoredToken()),
          getAvailablePlants(),
        ]);

        setUserPlants(plantsData);
        setAvailablePlants(availableData);
        await fetchPlantImages(plantsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load plants data.");
      } finally {
        setLoading(false);
      }
    };

    loadPlantsPage();
  }, [isAuthenticated, isLoading, token]);

  const handleAddPlant = async (e) => {
    e.preventDefault();

    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    if (!newPlantId) {
      setError("Please select a plant.");
      return;
    }

    if (!newNickname.trim()) {
      setError("Please give your plant a nickname.");
      return;
    }

    try {
      setIsAddingPlant(true);
      setError("");
      setSuccess("");

      const created = await addUserPlant(storedToken, {
        plantId: newPlantId,
        nickname: newNickname.trim(),
      });

      const selectedPlant = availablePlants.find((p) => p._id === newPlantId);

      const newUserPlant = {
        _id: created._id,
        nickname: newNickname.trim(),
        plant: selectedPlant || null,
        reminder: { nextWaterDate: new Date().toISOString(), daysLeft: 0 },
        wateredHistory: [],
      };

      setUserPlants((prev) => [newUserPlant, ...prev]);

      if (selectedPlant?.name) {
        const imageUrl = await getPlantImage(selectedPlant.name);
        setImages((prev) => ({
          ...prev,
          [selectedPlant.name.toLowerCase()]: imageUrl,
        }));
      }

      clearProfileCache();
      setSuccess("Plant added successfully 🌱");
      setNewPlantId("");
      setNewNickname("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add plant.");
    } finally {
      setIsAddingPlant(false);
    }
  };

  const handleDelete = async (id, plantName) => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${plantName || "this plant"} from your collection?`,
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");

      await deleteUserPlant(storedToken, id);

      setSuccess("Plant removed successfully 🪴");
      setUserPlants((prev) => prev.filter((plant) => plant._id !== id));

      clearProfileCache();

      if (editingId === id) {
        setEditingId("");
        setNickname("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete plant.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleUpdate = async (id) => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    if (!nickname.trim()) {
      setError("Nickname cannot be empty.");
      return;
    }

    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");

      const updatedPlant = await updateUserPlantNickname(
        storedToken,
        id,
        nickname.trim(),
      );

      setUserPlants((prev) =>
        prev.map((plant) =>
          plant._id === id
            ? { ...plant, nickname: updatedPlant.nickname || nickname.trim() }
            : plant,
        ),
      );

      clearProfileCache();
      setSuccess("Nickname updated successfully 🌱");
      setEditingId("");
      setNickname("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update nickname.");
    } finally {
      setActionLoadingId("");
    }
  };

  const startEditing = (plant) => {
    setEditingId(plant._id);
    setNickname(plant.nickname);
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId("");
    setNickname("");
  };

  if (isLoading || loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading your plants...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="plants-page">Please log in to view your plants.</div>
    );
  }

  return (
    <div className="plants-page">
      <div className="dashboard-container">
        <div className="dashboard-hero-main plants-hero">
          <p className="dashboard-subtitle">My Plants</p>
          <h1 className="dashboard-heading">Your plant collection 🌿</h1>
          <p className="dashboard-text">
            View your added plants, check care details, manage nicknames, and
            add more plants here.
          </p>
        </div>

        {error && <div className="dashboard-message error">{error}</div>}
        {success && <div className="dashboard-message success">{success}</div>}

        <div className="dashboard-panel plants-add-panel">
          <div className="panel-header">
            <h2>Add Plant</h2>
            <span>{availablePlants.length} types</span>
          </div>

          <form className="dashboard-form" onSubmit={handleAddPlant}>
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

            <input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="dashboard-input"
              placeholder="Enter nickname"
            />

            <button
              type="submit"
              className="dashboard-primary-btn"
              disabled={isAddingPlant}
            >
              {isAddingPlant ? "Adding..." : "Add Plant"}
            </button>
          </form>
        </div>

        {userPlants.length === 0 ? (
          <div className="dashboard-panel plants-empty-state">
            <h2>No plants added yet</h2>
            <p>Add a plant above to start your collection.</p>
          </div>
        ) : (
          <div className="plants-grid">
            {userPlants.map((item) => (
              <div key={item._id} className="plant-card">
                <img
                  src={
                    images[item.plant?.name?.toLowerCase()] || "/fallback.png"
                  }
                  alt={item.plant?.name || "Plant"}
                  className="plant-img"
                />

                <div className="plant-body">
                  <div className="plant-card-top">
                    <div>
                      <h3 className="plant-nickname-main">{item.nickname}</h3>
                      <p className="plant-type">{item.plant?.name}</p>
                    </div>

                    <span className="plant-badge">
                      {typeof item.reminder?.daysLeft === "number"
                        ? item.reminder.daysLeft === 0
                          ? "Water today"
                          : `${item.reminder.daysLeft} day(s) left`
                        : "Care info"}
                    </span>
                  </div>

                  <div className="plant-info">
                    <p>
                      <strong>Water Frequency:</strong>{" "}
                      {item.plant?.waterFrequency || "Not set"} day(s)
                    </p>
                    <p>
                      <strong>Sunlight:</strong>{" "}
                      {item.plant?.sunlight || "Not specified"}
                    </p>
                    <p>
                      <strong>Temperature:</strong>{" "}
                      {item.plant?.temperature || "Not specified"}
                    </p>
                    <p>
                      <strong>Watered Times:</strong>{" "}
                      {item.wateredHistory?.length || 0}
                    </p>
                  </div>

                  <div className="plant-tips-box">
                    <p className="tips-title">Care Tips</p>
                    <ul className="plant-tips">
                      {item.plant?.tips?.length ? (
                        item.plant.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))
                      ) : (
                        <li>No care tips available</li>
                      )}
                    </ul>
                  </div>

                  <div className="plant-actions">
                    {editingId === item._id ? (
                      <>
                        <input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="dashboard-input"
                          placeholder="Edit nickname"
                        />

                        <div className="plant-action-row">
                          <button
                            onClick={() => handleUpdate(item._id)}
                            className="dashboard-primary-btn"
                            disabled={actionLoadingId === item._id}
                          >
                            {actionLoadingId === item._id
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            onClick={cancelEditing}
                            className="edit-btn"
                            disabled={actionLoadingId === item._id}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="plant-action-row">
                        <button
                          onClick={() => startEditing(item)}
                          className="edit-btn"
                          disabled={actionLoadingId === item._id}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              item._id,
                              item.plant?.name || item.nickname,
                            )
                          }
                          className="delete-btn"
                          disabled={actionLoadingId === item._id}
                        >
                          {actionLoadingId === item._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Plants;
