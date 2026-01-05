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
  const [error, setError] = useState(null); // null = no error, string = error message
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log("Login: Attempting login with email:", email);
    setError(null); // Clear previous errors
    setIsLoading(true);
    
    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
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
        setIsLoading(false);
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
      // Handle different error types with user-friendly messages
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const errorData = err.response.data;
        console.error("LOGIN FAILED:", {
          status,
          message: errorData?.message,
          data: errorData
        });
        
        // User-friendly messages based on status
        if (status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (status === 400) {
          errorMessage = errorData?.message || "Invalid request. Please check your input.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again in a few moments.";
        } else {
          errorMessage = errorData?.message || `Login failed. Please try again.`;
        }
      } else if (err.request) {
        // Request made but no response (network error)
        console.error("LOGIN FAILED: No response from server", err.request);
        errorMessage = "Cannot connect to the server. Please check your internet connection and try again.";
      } else {
        // Other error
        console.error("LOGIN FAILED: Unexpected error", err.message);
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "10px", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c33"
        }}>
          {error}
        </div>
      )}
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
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}