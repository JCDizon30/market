import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginUser } from "../api";
import "../styles/Login.css";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(identifier, password);

      // Save token
      if (data.token) localStorage.setItem("accessToken", data.token);

      // Save user info in state and localStorage
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user); // update parent state immediately
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        showConfirmButton: false,
        timer: 1200,
      });

      // Redirect based on role and approval
      if (data.user.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "Farmer") {
        if (data.user.isApproved) {
          // Approved farmers -> dashboard
          navigate("/dashboard");
        } else {
          // Pending farmers -> marketplace (cannot add produce)
          Swal.fire(
            "Application Pending",
            "Your farmer application is under review. You cannot add produce yet.",
            "info"
          );
          navigate("/marketplace");
        }
      } else {
        // Regular consumer
        navigate("/marketplace");
      }
    } catch (err) {
      Swal.fire(
        "Login Failed",
        err?.error || err?.message || "Invalid credentials",
        "error"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Welcome Back!</h1>
        <p>Access your account and connect with local farmers.</p>
      </div>

      <div className="login-right">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Contact Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="filled-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
