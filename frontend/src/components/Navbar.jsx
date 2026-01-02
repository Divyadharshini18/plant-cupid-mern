import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: "1rem", marginBottom: "20px" }}>
      {user && (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/add-plant">Add Plant</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}