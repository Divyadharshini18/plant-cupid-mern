import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

console.log("App.jsx: Rendering routes");

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? ( <Navigate to="/dashboard" replace/> ) : <Home /> } />
      <Route path="/login" element={isAuthenticated ? ( <Navigate to="/dashboard" replace/> ) : <Login /> } />
      <Route path="/signup" element={isAuthenticated ? ( <Navigate to="/dashboard" replace/> ) : <Signup /> } />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}