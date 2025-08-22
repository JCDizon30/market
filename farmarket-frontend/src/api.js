import axios from "axios";

const USER_API = "http://localhost:4000/users";
const PRODUCE_API = "http://localhost:4000/produces";

// ✅ Helper to get Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ------------------ USER ------------------

// Register
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${USER_API}/register`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Login
export const loginUser = async (identifier, password) => {
  try {
    const res = await axios.post(`${USER_API}/login`, { identifier, password });

    // Store session info in localStorage
    localStorage.setItem("accessToken", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    localStorage.setItem("isApproved", res.data.user.isApproved);

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Get profile
export const getProfile = async () => {
  try {
    const res = await axios.get(`${USER_API}/profile`, { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to fetch profile" };
  }
};

// Reset password
export const resetPass = async (newPassword) => {
  try {
    const res = await axios.post(
      `${USER_API}/reset-password`,
      { password: newPassword },
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to reset password" };
  }
};

// ------------------ PRODUCE ------------------

// Get all produce
export const getAllProduce = async () => {
  const res = await axios.get(PRODUCE_API);
  return res.data;
};

// Get all active produce
export const getAllActiveProduce = async () => {
  const res = await axios.get(`${PRODUCE_API}/active`);
  return res.data;
};

// Get produce by ID
export const getProduceByID = async (id) => {
  const res = await axios.get(`${PRODUCE_API}/${id}`);
  return res.data;
};

// Search produce by name
export const searchProduceByName = async (name) => {
  const res = await axios.post(`${PRODUCE_API}/search/name`, { name });
  return res.data;
};

// Search produce by price
export const searchProduceByPrice = async (minPrice, maxPrice) => {
  const res = await axios.post(`${PRODUCE_API}/search/price`, { minPrice, maxPrice });
  return res.data;
};

// ------------------ FARMER ONLY ------------------

// Add produce (with images) using FormData
export const addProduce = async (produceData) => {
  try {
    const formData = new FormData();

    formData.append("name", produceData.name);
    formData.append("category", produceData.category);
    formData.append("description", produceData.description);
    formData.append("mass", produceData.mass);
    formData.append("price", produceData.price);
    formData.append("stock", produceData.stock);

    if (produceData.images && produceData.images.length > 0) {
      produceData.images.forEach((file) => formData.append("images", file));
    }

    const res = await axios.post(PRODUCE_API, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Update produce using FormData
export const updateProduce = async (produceID, produceData) => {
  try {
    const formData = new FormData();

    formData.append("name", produceData.name);
    formData.append("category", produceData.category);
    formData.append("description", produceData.description);
    formData.append("mass", produceData.mass);
    formData.append("price", produceData.price);
    formData.append("stock", produceData.stock);

    if (produceData.images && produceData.images.length > 0) {
      produceData.images.forEach((file) => formData.append("images", file));
    }

    const res = await axios.put(`${PRODUCE_API}/${produceID}`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Delete produce
export const deleteProduce = async (produceID) => {
  const res = await axios.delete(`${PRODUCE_API}/${produceID}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

// Archive produce
export const archiveProduce = async (produceID) => {
  const res = await axios.put(
    `${PRODUCE_API}/archive/${produceID}`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Activate produce
export const activateProduce = async (produceID) => {
  const res = await axios.put(
    `${PRODUCE_API}/activate/${produceID}`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};
