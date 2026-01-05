import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  console.log("Register: Rendering");

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // null = no error, string = error message
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    console.log("Register: Attempting registration");
    // Clear any previous errors and success messages at the start
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    // Validate inputs
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
      console.log("Register: Sending POST request to /users/register", {
        url: "/users/register",
        data: { name, email, password: "[REDACTED]" }
      });
      const res = await api.post("/users/register", { name, email, password });
      console.log("REGISTER SUCCESS:", {
        status: res.status,
        data: res.data
      });
      
      // Clear error on successful registration
      setError(null);
      setSuccess(true);
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // After successful registration, navigate to login
      console.log("Register: Redirecting to /login after successful registration");
      navigate("/login");
    } catch (err) {
      // Handle different error types with user-friendly messages
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        console.error("REGISTER FAILED:", {
          status,
          message: errorData?.message,
          data: errorData
        });
        
        // User-friendly messages based on status
        if (status === 400) {
          errorMessage = errorData?.message || "Invalid information. Please check your input and try again.";
        } else if (status === 409 || errorData?.message?.toLowerCase().includes("already exists")) {
          errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again in a few moments.";
        } else {
          errorMessage = errorData?.message || "Registration failed. Please try again.";
        }
      } else if (err.request) {
        console.error("REGISTER FAILED: No response from server", err.request);
        errorMessage = "Cannot connect to the server. Please check your internet connection and try again.";
      } else {
        console.error("REGISTER FAILED: Unexpected error", err.message);
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      // Clear success message if there's an error
      setSuccess(false);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
      {success && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "10px", 
          backgroundColor: "#efe", 
          border: "1px solid #cfc",
          borderRadius: "4px",
          color: "#3c3"
        }}>
          Registration successful! You can now log in.
        </div>
      )}
      <input 
        placeholder="Name"
        value={name} 
        onChange={(e) => {
          setName(e.target.value);
          // Clear error when user starts typing
          if (error) setError(null);
        }} 
      />
      <input 
        placeholder="Email"
        value={email} 
        onChange={(e) => {
          setEmail(e.target.value);
          // Clear error when user starts typing
          if (error) setError(null);
        }} 
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          // Clear error when user starts typing
          if (error) setError(null);
        }}
      />
      <button onClick={handleRegister} disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
