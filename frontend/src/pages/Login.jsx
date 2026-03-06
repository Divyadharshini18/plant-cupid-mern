import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.token) {
        setError("Login successful but no token received"); // This should not happen, but we handle it just in case
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        login(
          { _id: res.data._id, name: res.data.name, email: res.data.email },
          res.data.token
        );
        setIsLoading(false);

        navigate("/dashboard"); // login successful, redirect to dashboard
      }, 1000);

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status >= 500) {
        setError("Server error. Try again later.");
      } else if (err.request) {
        setError("Cannot connect to server");
      } else {
        setError("Something went wrong");
      }
      setSuccess(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h2 className="login-title">Login phytophile !</h2>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">Login successful!</p>}

        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link className="login-link" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}