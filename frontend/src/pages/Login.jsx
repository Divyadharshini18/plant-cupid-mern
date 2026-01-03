import { useState } from "react";
import api from "../api/api";

export default function Login() {
  console.log("Login: Rendering");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Login: Attempting login");
    try {
      const res = await api.post("/users/login", { email, password });
      console.log("LOGIN SUCCESS:", res.data);
      localStorage.setItem("token", res.data.token);
      console.log("Login: Token stored in localStorage");
      // No redirects yet - just store token
    } catch (err) {
      console.error("LOGIN FAILED", err.response?.data);
    }
  };

  return (
    <div>
      <h2>Login</h2>
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