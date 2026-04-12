import { useEffect, useState } from "react";
import { getProfile, deleteAccount } from "../services/userService";
import { getUserPlants } from "../services/plantService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userPlants, setUserPlants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const getToken = () => token || localStorage.getItem("token");

  const fetchProfileData = async (force = false) => {
    try {
      setLoading(true);
      setError("");

      const storedToken = getToken();

      const [profileData, plantsData] = await Promise.all([
        getProfile(storedToken, { force }),
        getUserPlants(storedToken, { force }),
      ]);

      setUser(profileData);
      setUserPlants(plantsData);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfileData();
  }, [isAuthenticated]);

  const handleDeleteAccount = async () => {
    const storedToken = getToken();

    if (!storedToken) {
      setError("Please login again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This will permanently remove your profile and your plant data."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteAccount(storedToken);

      logout();
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to delete account."
      );
    } finally {
      setDeleting(false);
    }
  };

  const waterLogs = userPlants.flatMap((plant) =>
    (plant.wateredHistory || []).map((entry) => ({
      nickname: plant.nickname,
      plantName: plant.plant?.name,
      date: entry.date,
    })),
  );

  const sortedLogs = [...waterLogs].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="dashboard-container">
        <div className="dashboard-hero-main profile-hero profile-hero-row">
          <div className="profile-hero-left">
            <h1 className="dashboard-heading">{user?.name}</h1>
            <p className="dashboard-text">{user?.email}</p>
            <p className="profile-subtext">
              You have {userPlants.length} plants in your care 🌱
            </p>
          </div>

          <div className="profile-hero-right">
            <button
              className="delete-account-btn"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>

        {error && <div className="dashboard-message error">{error}</div>}

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Watering History</h2>
            <span>{sortedLogs.length}</span>
          </div>

          {sortedLogs.length === 0 ? (
            <p className="panel-empty">No watering history yet</p>
          ) : (
            <div className="history-list">
              {sortedLogs.map((log, index) => (
                <div key={index} className="history-item">
                  <div>
                    <h4>{log.nickname}</h4>
                    <p>{log.plantName}</p>
                  </div>

                  <span>{new Date(log.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;