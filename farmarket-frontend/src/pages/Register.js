import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerUser } from "../api";
import "../styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData); // just register, no auto login

      Swal.fire(
        "Success",
        "Registration successful! Please log in to continue.",
        "success"
      );

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.error || err?.message || "Something went wrong",
        "error"
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <h1>Welcome to FARMARKET</h1>
        <p>Sign up and start exploring local produce!</p>
      </div>

      <div className="register-right">
        <h2>Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button className="filled-btn" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
