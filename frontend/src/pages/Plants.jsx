import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Plants() {
  const { token, isLoading, isAuthenticated } = useAuth();

  const [userPlants, setUserPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState("");
  const [nickname, setNickname] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [images, setImages] = useState({});

  const getStoredToken = () => token || localStorage.getItem("token");

  const fetchUserPlants = async () => {
    try {
      setLoading(true);
      setError("");

      const storedToken = getStoredToken();

      if (!storedToken) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      const res = await api.get("/user-plants", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      setUserPlants(Array.isArray(res.data) ? res.data : []);
      await fetchPlantImages(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your plants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPlants();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, token]);

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

      await api.delete(`/user-plants/${id}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      setSuccess("Plant removed successfully 🪴");
      setUserPlants((prev) => prev.filter((plant) => plant._id !== id));

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

  const fetchPlantImages = async (plants) => {
    const newImages = {};

    for (let item of plants) {
      try {
        const res = await api.get(
          `/images?query=${encodeURIComponent(item.plant?.name)}`,
        );

        newImages[item._id] = res.data.imageUrl;
      } catch {
        newImages[item._id] = "";
      }
    }

    setImages(newImages);
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

      const res = await api.patch(
        `/user-plants/${id}`,
        { nickname: nickname.trim() },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        },
      );

      setUserPlants((prev) =>
        prev.map((plant) =>
          plant._id === id
            ? { ...plant, nickname: res.data.nickname || nickname.trim() }
            : plant,
        ),
      );

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
    return <div className="plants-page">Loading your plants...</div>;
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
            View your added plants, check care details, and manage nicknames.
          </p>
        </div>

        {error && <div className="dashboard-message error">{error}</div>}
        {success && <div className="dashboard-message success">{success}</div>}

        {userPlants.length === 0 ? (
          <div className="dashboard-panel plants-empty-state">
            <h2>No plants added yet</h2>
            <p>Add a plant from your dashboard to see it here.</p>
          </div>
        ) : (
          <div className="plants-grid">
            {userPlants.map((item) => (
              <div key={item._id} className="plant-card">
                <img
                  src={images[item._id] || "/fallback.jpg"}
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
