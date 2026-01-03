import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  console.log("Dashboard: Rendering");
  
  const { user, logout, token } = useAuth();
  
  // Fallback to localStorage if context doesn't have token
  const localStorageToken = localStorage.getItem("token");
  const hasToken = token || localStorageToken;
  const userEmail = user?.email || (hasToken ? "User logged in" : "Not logged in");

  const handleLogout = () => {
    console.log("Dashboard: Logging out");
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
    }
    window.location.href = "/login";
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {userEmail}</p>
      <p>Token exists: {hasToken ? "Yes" : "No"}</p>
      {hasToken && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
}