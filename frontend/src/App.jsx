import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddPlant from "./pages/AddPlant";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-plant"
          element={
            <ProtectedRoute>
              <AddPlant />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;