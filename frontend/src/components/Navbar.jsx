import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // clear auth state
    navigate("/login");  // redirect to login page
  };

  return (
    <div className="navbar">
      <div className="title">Plant Cupid</div>

      <Link to="/dashboard" className="nav-link">Dashboard</Link>
      <Link to="/plants" className="nav-link">Plants</Link>
      <Link to="/profile" className="nav-link">Profile</Link>
      <Link to="/about" className="nav-link">About Us</Link>

      <div className="nav-right">
        <button className="nav-logout" onClick={handleLogout}> Logout </button>
      </div>
    </div>
  );
}

export default Navbar;