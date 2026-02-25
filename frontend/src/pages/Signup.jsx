import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/users/signup", { name, email, password }); // send data to backend
      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      navigate("/login"); // redirect to login page after successful registration
    } catch (err) {
      if (err.response?.status === 409) {
        setError("An account with this email already exists");
      } else if (err.response?.status >= 500) {
        setError("Server error. Try again later.");
      } else if (err.request) {
        setError("Cannot connect to server");
      } else {
        setError("Signup failed");
      }
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">New Phytophile 🌸</h2>

      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">Signup successful!</p>}

      <input
        className="auth-input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="auth-input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="auth-button"
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? "Signing up..." : "Sign up"}
      </button>
    </div>
  );
}