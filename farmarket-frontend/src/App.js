import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import Marketplace from "./pages/Marketplace";
import ProtectedRoute from "./ProtectedRoute";
import { getProfile } from "./api";

function App() {
  const [user, setUser] = useState(null);

  // ✅ Load session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      // Try fetching fresh profile from backend
      getProfile().then((res) => {
        if (!res.error) {
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
        } else {
          // fallback if backend fails but we still have data
          setUser(JSON.parse(storedUser));
        }
      });
    }
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <NavigationBar user={user} setUser={setUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace user={user} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/admin-dashboard" element={<AdminUsers />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={["Farmer"]}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute user={user} allowedRoles={["Admin"]}>
              <AdminUsers user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} allowedRoles={["Consumer", "Farmer", "Admin"]}>
              <Profile user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;