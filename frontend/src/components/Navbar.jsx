import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 className="title">Plant Cupid | </h2>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/plants" className="nav-link">Plants</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/about" className="nav-link">About Us</Link>
      </div>

      <div className="nav-right">
        <button className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </nav>
  );
}

export default Navbar;