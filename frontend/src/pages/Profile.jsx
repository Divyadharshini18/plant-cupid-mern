import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { token, isAuthenticated } = useAuth();

  const [user, setUser] = useState(null);
  const [userPlants, setUserPlants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => token || localStorage.getItem("token");

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      const storedToken = getToken();

      const [userRes, plantsRes] = await Promise.all([
        api.get("/users/profile", {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
        api.get("/user-plants", {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
      ]);

      setUser(userRes.data);
      setUserPlants(plantsRes.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfileData();
  }, [isAuthenticated]);

  // -------- WATER LOG --------

  const waterLogs = userPlants.flatMap((plant) =>
    (plant.wateredHistory || []).map((entry) => ({
      nickname: plant.nickname,
      plantName: plant.plant?.name,
      date: entry.date,
    })),
  );

  const sortedLogs = waterLogs.sort(
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

        <div className="dashboard-hero-main profile-hero">
          <h1 className="dashboard-heading">{user?.name}</h1>
          <p className="dashboard-text">{user?.email}</p>
          <p className="profile-subtext">
            You have {userPlants.length} plants in your care 🌱
          </p>
        </div>

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