import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { FaCamera, FaUser, FaEdit } from "react-icons/fa";
import "../styles/Profile.css";

const Profile = ({ setUser }) => {
  const [user, setLocalUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNumber: "",
    defaultAddress: "",
    avatar: "",
    role: "",
    isApproved: false,
    hasAppliedFarmer: false,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    contactNumber: "",
    defaultAddress: "",
  });

  // ---------------- Fetch Profile ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          Swal.fire("Error", "Please login first", "error");
          window.location.href = "/login"; // redirect if no token
          return;
        }

        const res = await fetch("http://localhost:4000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            Swal.fire("Session Expired", "Please login again", "warning");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return;
          }
          throw new Error(data.error || "Failed to load profile");
        }

        setLocalUser(data.user);
        setUser && setUser(data.user);

        setAvatarPreview(data.user.avatar || null);
        setFormData({
          email: data.user.email || "",
          address: data.user.address || "",
          contactNumber: data.user.contactNumber || "",
          defaultAddress: data.user.defaultAddress || "",
        });
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    };

    fetchProfile();
  }, [setUser]);

  // ---------------- Avatar Preview ----------------
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  // ---------------- Form Change ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Save Profile ----------------
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Please login first");

      const form = new FormData();
      form.append("email", formData.email);
      form.append("address", formData.address);
      form.append("contactNumber", formData.contactNumber);
      form.append("defaultAddress", formData.defaultAddress);

      const fileInput = document.getElementById("avatarUpload");
      if (fileInput?.files?.[0]) form.append("avatar", fileInput.files[0]);

      const res = await fetch("http://localhost:4000/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setLocalUser(data.user);
      setAvatarPreview(data.user.avatar || null);
      setIsEditing(false);
      Swal.fire("Success", "Profile updated successfully!", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ---------------- Apply as Farmer ----------------
  const handleApplyFarmer = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Please login first");

      const res = await fetch("http://localhost:4000/users/apply-farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply as farmer");

      setLocalUser(data.user);
      setUser && setUser(data.user);
      Swal.fire("Success", "Farmer application submitted!", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <Container className="profile-page-container mt-4 mb-5">
      <Card className="profile-card shadow-lg border-0">
        {/* Banner */}
        <div className="profile-banner" />

        {/* Header */}
        <div className="profile-header text-center">
          <div className="avatar-wrapper mx-auto">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="profile-avatar rounded-circle shadow"
              />
            ) : (
              <div className="profile-avatar rounded-circle shadow placeholder-avatar">
                <FaUser className="placeholder-icon" />
              </div>
            )}
            <label
              htmlFor="avatarUpload"
              className="camera-overlay"
              title="Change profile picture"
            >
              <FaCamera size={18} />
            </label>
            <Form.Control
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="d-none"
            />
          </div>

          <h1 className="profile-name mt-3 mb-1">
            {user.firstName || "First"} {user.lastName || "Last"}
          </h1>
          <span className="profile-role badge bg-success">{user.role || "Consumer"}</span>

          {user.role === "Farmer" && (
            <div className="mt-2">
              {user.isApproved ? (
                <span className="badge bg-success">✅ Approved Farmer</span>
              ) : (
                <span className="badge bg-warning text-dark">⏳ Pending Farmer Approval</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <Card.Body className="pt-4">
          <Row className="g-4">
            <Col lg={12}>
              <div className="profile-section p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="section-title m-0">Account Information</h5>
                  {!isEditing && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => setIsEditing(true)}
                    >
                      <FaEdit className="me-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                <hr className="my-3" />

                {isEditing ? (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, City, Province"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="09xxxxxxxxx"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Default Delivery Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="defaultAddress"
                        value={formData.defaultAddress}
                        onChange={handleChange}
                        placeholder="Enter your default delivery address"
                      />
                    </Form.Group>

                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="success"
                        className="rounded-pill px-4"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-pill px-4"
                        onClick={() => {
                          setFormData({
                            email: user.email || "",
                            address: user.address || "",
                            contactNumber: user.contactNumber || "",
                            defaultAddress: user.defaultAddress || "",
                          });
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user.email || "Not Provided"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Address</span>
                      <span className="info-value">{user.address || "Not Provided"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Default Address</span>
                      <span className="info-value">{user.defaultAddress || "Not Provided"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Contact</span>
                      <span className="info-value">{user.contactNumber || "Not Provided"}</span>
                    </div>
                  </>
                )}

                {user.role === "Consumer" && (
                  <div className="mt-4 text-center">
                    {user.hasAppliedFarmer ? (
                      <Button variant="secondary" disabled className="rounded-pill px-4">
                        Application Pending
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="rounded-pill px-4"
                        onClick={handleApplyFarmer}
                      >
                        Apply as Farmer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
