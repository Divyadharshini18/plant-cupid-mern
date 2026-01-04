import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  console.log("Login: Rendering");
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    console.log("Login: Attempting login with email:", email);
    setError(""); // Clear previous errors
    
    // Validate inputs
    if (!email || !password) {
      const errorMsg = "Please enter both email and password";
      console.error("Login: Validation failed -", errorMsg);
      setError(errorMsg);
      return;
    }
    
    try {
      console.log("Login: Sending POST request to /auth/login");
      const res = await api.post("/auth/login", { email, password });
      console.log("LOGIN SUCCESS:", {
        status: res.status,
        hasToken: !!res.data.token,
        userEmail: res.data.email
      });
      
      // Verify token exists in response
      if (!res.data.token) {
        console.error("Login: No token in response", res.data);
        setError("Login successful but no token received. Please try again.");
        return;
      }
      
      // Extract user data from response (backend returns: _id, name, email, token)
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email
      };
      
      // Use AuthContext to store user and token (handles localStorage automatically)
      login(userData, res.data.token);
      
      // Redirect to dashboard
      console.log("Login: Redirecting to /dashboard");
      navigate("/dashboard");
    } catch (err) {
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const errorData = err.response.data;
        console.error("LOGIN FAILED:", {
          status,
          message: errorData?.message,
          data: errorData
        });
        setError(errorData?.message || `Login failed (${status}). Please try again.`);
      } else if (err.request) {
        // Request made but no response (network error)
        console.error("LOGIN FAILED: No response from server", err.request);
        setError("Cannot connect to server. Please check your connection.");
      } else {
        // Other error
        console.error("LOGIN FAILED: Unexpected error", err.message);
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input 
        placeholder="Email"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}