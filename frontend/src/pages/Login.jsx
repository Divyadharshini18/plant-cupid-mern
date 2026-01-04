import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  console.log("Login: Rendering");
  
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    console.log("Login: Attempting login");
    setError(""); // Clear previous errors
    
    try {
      const res = await api.post("/users/login", { email, password });
      console.log("LOGIN SUCCESS:", res.data);
      
      // Save token to localStorage
      try {
        localStorage.setItem("token", res.data.token);
        console.log("Login: Token saved to localStorage");
      } catch (storageErr) {
        console.error("Login: Failed to save token to localStorage", storageErr);
        setError("Failed to save login session. Please try again.");
        return;
      }
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN FAILED:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
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