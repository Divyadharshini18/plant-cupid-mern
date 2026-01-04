import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  console.log("Dashboard: Rendering");
  
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  // Show loading state while checking auth (graceful, doesn't block)
  if (isLoading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    console.log("Dashboard: Logging out");
    logout();
    // Redirect handled by ProtectedRoute or can navigate here
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {isAuthenticated && user ? (
        <div>
          <p>Welcome, {user.name || user.email}!</p>
          <p>Email: {user.email}</p>
          <p>Status: Logged in</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Status: Guest</p>
          <p>Please log in to access your dashboard.</p>
        </div>
      )}
    </div>
  );
}