import React, { useState, useEffect } from "react";
import "../styles/Marketplace.css";
import {
  getAllActiveProduce,
  addProduce,
  updateProduce,
  deleteProduce,
  archiveProduce,
  activateProduce,
} from "../api";

const BACKEND_URL = "http://localhost:4000"; // ✅ Used for image paths

const Marketplace = ({ user }) => {
  const [produces, setProduces] = useState([]);
  const [filteredProduces, setFilteredProduces] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduce, setEditingProduce] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    mass: "",
    price: "",
    stock: "",
    images: [],
  });

  // ✅ Only approved farmers can add produce
  const isApprovedFarmer =
    (user?.role === "Farmer" || localStorage.getItem("role") === "Farmer") &&
    (user?.isApproved === true || localStorage.getItem("isApproved") === "true");

  // Fetch produce
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllActiveProduce();
      if (!res.error) setProduces(res);
    };
    fetchData();
  }, []);

  // Filter + search
  useEffect(() => {
    let filtered = produces;

    if (categoryFilter !== "All") {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    if (searchName.trim() !== "") {
      const regex = new RegExp(searchName.trim(), "i");
      filtered = filtered.filter(
        (p) => regex.test(p.name) || regex.test(p.category)
      );
    }

    setFilteredProduces(filtered);
  }, [searchName, categoryFilter, produces]);

  // Input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData({ ...formData, images: files ? Array.from(files) : [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Open form
  const openForm = (produce = null) => {
    if (produce) {
      setEditingProduce(produce);
      setFormData({
        name: produce.name,
        category: produce.category,
        description: produce.description,
        mass: produce.mass,
        price: produce.price,
        stock: produce.stock,
        images: [], // reset for new upload
      });
    } else {
      setEditingProduce(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        mass: "",
        price: "",
        stock: "",
        images: [],
      });
    }
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  // ✅ Convert formData to FormData object for images
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("category", formData.category.trim());
    fd.append("description", formData.description.trim());
    fd.append("mass", formData.mass);
    fd.append("price", formData.price);
    fd.append("stock", formData.stock);

    formData.images.forEach((file) => fd.append("images", file));

    return fd;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = buildFormData();

      let res;
      if (editingProduce) {
        res = await updateProduce(editingProduce._id, fd);
        setProduces((prev) =>
          prev.map((p) =>
            p._id === res.produce._id ? res.produce : p
          )
        );
      } else {
        res = await addProduce(fd);
        setProduces((prev) => [...prev, res.produce]);
      }

      closeForm();
    } catch (err) {
      console.error("Add/Update produce error:", err);
      alert(
        err.response?.data?.error ||
          "Failed to submit produce. Make sure you are an approved farmer."
      );
    }
  };

  // Delete produce
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this produce?")) {
      const res = await deleteProduce(id);
      if (!res.error) {
        setProduces((prev) => prev.filter((p) => p._id !== id));
      } else alert(res.error);
    }
  };

  // Archive / Activate
  const handleToggleActive = async (produce) => {
    const res = produce.isActive
      ? await archiveProduce(produce._id)
      : await activateProduce(produce._id);

    if (!res.error) {
      setProduces((prev) =>
        prev.map((p) =>
          p._id === produce._id ? { ...p, isActive: !produce.isActive } : p
        )
      );
    } else alert(res.error);
  };

  return (
    <div className="marketplace-container">
      <div className="hero-banner">
        <h2>Welcome to Our Local Farmer’s Marketplace!</h2>
        <p>Discover fresh, organic produce directly from our local farmers.</p>
      </div>

      <h1>Local Produce Marketplace</h1>

      {/* Only approved farmers can add */}
      {isApprovedFarmer && (
        <button className="add-produce-btn" onClick={() => openForm()}>
          + Add New Produce
        </button>
      )}

      <div className="filter-search-container">
        <input
          type="text"
          placeholder="Search produce or category..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option>All</option>
          {[...new Set(produces.map((p) => p.category))].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Add / Edit Form */}
      {formOpen && (
        <div className="form-overlay">
          <form className="produce-form" onSubmit={handleSubmit}>
            <h2>{editingProduce ? "Edit Produce" : "Add Produce"}</h2>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Produce Name"
              required
            />
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Category"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <input
              name="mass"
              type="number"
              value={formData.mass}
              onChange={handleChange}
              placeholder="Mass (kg)"
              required
            />
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (₱)"
              required
            />
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock"
              required
            />
            <input type="file" name="images" multiple onChange={handleChange} />

            <div className="form-buttons">
              <button type="submit" className="save-btn">
                {editingProduce ? "Update Produce" : "Add Produce"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Produce List */}
      <div className="produce-list">
        {filteredProduces.length === 0 && <p>No produce available.</p>}
        {filteredProduces.map((p) => (
          <div key={p._id} className="produce-card">
            {p.images && p.images.length > 0 && (
              <img src={`${BACKEND_URL}/${p.images[0]}`} alt={p.name} />
            )}
            <div className="produce-details">
              <div className={`badge ${p.category.replace(/\s+/g, "")}`}>
                {p.category}
              </div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>
                <strong>Mass:</strong> {p.mass} kg
              </p>
              <p>
                <strong>Price:</strong> ₱{p.price}
              </p>
              <p>
                <strong>Stock:</strong> {p.stock}
              </p>
              {!isApprovedFarmer && (
                <p>
                  <strong>Farmer:</strong> {p.farmer?.firstName} {p.farmer?.lastName}
                </p>
              )}
            </div>

            {/* Farmer Actions */}
            {isApprovedFarmer && (
              <div className="card-buttons">
                <button onClick={() => openForm(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)}>Delete</button>
                <button onClick={() => handleToggleActive(p)}>
                  {p.isActive ? "Archive" : "Activate"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
