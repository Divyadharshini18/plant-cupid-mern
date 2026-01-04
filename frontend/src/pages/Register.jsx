import { useState } from "react";
import api from "../api/api";

export default function Register() {
  console.log("Register: Rendering");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    console.log("Register: Attempting registration");
    try {
      const res = await api.post("/users/register", { name, email, password });
      console.log("REGISTER SUCCESS:", res.data);
      // No redirects - just show success
    } catch (err) {
      console.error("REGISTER FAILED", err.response?.data);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input 
        placeholder="Name"
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
