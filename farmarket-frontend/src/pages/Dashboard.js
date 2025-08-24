import React, { useState } from "react";
import "../styles/Dashboard.css";
import { FaUser, FaShoppingCart, FaBox, FaDollarSign } from "react-icons/fa";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", qty: "" });
  const [successMsg, setSuccessMsg] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Add product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.qty) {
      setProducts([...products, newProduct]);
      setNewProduct({ name: "", price: "", qty: "" });

      // Show success message
      setSuccessMsg("✅ Product added successfully!");
      setTimeout(() => setSuccessMsg(""), 2000); // hide after 2s
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="cards">
        {/* Total Users */}
        <div className="card orange">
          <FaUser className="icon" />
          <p>Total Users</p>
          <h3>3</h3>
        </div>

        {/* Total Orders */}
        <div className="card green">
          <FaShoppingCart className="icon" />
          <p>Total Orders</p>
          <h3>12</h3>
        </div>

        {/* Total Products */}
        <div className="card teal">
          <FaBox className="icon" />
          <p>Total Products</p>
          <h3>{209 + products.length}</h3>
        </div>

        {/* Total Sales */}
        <div className="card blue">
          <FaDollarSign className="icon" />
          <p>Total Sales</p>
          <h3>₱ 52,340</h3>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="add-product">
        <h3>Add Product</h3>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleChange}
          />
          <input
            type="number"
            name="qty"
            placeholder="Quantity"
            value={newProduct.qty}
            onChange={handleChange}
          />
          <button type="submit">Add</button>
        </form>

        {/* Success message */}
        {successMsg && <p className="success-msg">{successMsg}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
