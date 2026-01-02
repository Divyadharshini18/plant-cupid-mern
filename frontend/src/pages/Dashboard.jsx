import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import PlantCard from "../components/PlantCard";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState("");

  const fetchPlants = async () => {
    try {
      const data = await apiRequest("/user-plants");
      setPlants(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const waterPlant = async (id) => {
    try {
      await apiRequest(`/user-plants/${id}/water`, "POST");
      fetchPlants(); // refresh after watering
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return (
    <div>
      <h1>My Plants 🌱</h1>
      {error && <p>{error}</p>}

      {plants.map((plant) => (
        <PlantCard
          key={plant._id}
          plant={plant}
          onWater={waterPlant}
        />
      ))}
    </div>
  );
}
