export default function PlantCard({ plant, onWater }) {
  const { nickname, plant: plantInfo, reminder, _id } = plant;

  const canWater = reminder.daysLeft === 0;

  return (
    <div className="plant-card">
      <h3>{nickname || plantInfo.name}</h3>
      <p>Plant: {plantInfo.name}</p>
      <p>Next Water: {new Date(reminder.nextWaterDate).toDateString()}</p>
      <p>Days Left: {reminder.daysLeft}</p>

      <button
        onClick={() => onWater(_id)}
        disabled={!canWater}
      >
        {canWater ? "Water 💧" : "Too Soon"}
      </button>
    </div>
  );
}
