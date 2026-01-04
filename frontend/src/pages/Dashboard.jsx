export default function Dashboard() {
  console.log("Dashboard: Rendering");
  
  // Safely read token from localStorage
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch (err) {
    console.error("Dashboard: Error reading localStorage", err);
  }
  
  const status = token ? "Logged in" : "Guest";

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Status: {status}</p>
    </div>
  );
}