const User = require("../models/User");
const { createAccessToken } = require("../auth");
const bcrypt = require("bcrypt");

// ------------------ REGISTER ------------------
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, address, password } = req.body;

    // Check for existing email/contact
    const existingUser = await User.findOne({
      $or: [{ email }, { contactNumber }],
    });
    if (existingUser)
      return res.status(400).json({ error: "Email or contact number already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // All users start as Consumer, not approved
    const newUser = new User({
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      password: hashedPassword,
      role: "Consumer",     // 🔒 force role = Consumer
      isApproved: false,    // Farmers must apply later
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        contactNumber: newUser.contactNumber,
        address: newUser.address,
        role: newUser.role,
        isApproved: newUser.isApproved,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error. Please check your input." });
  }
};

// ------------------ LOGIN ------------------
exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ error: "Please provide credentials" });

    const user = await User.findOne({
      $or: [{ email: identifier }, { contactNumber: identifier }],
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    let isMatch = false;

    if (user.password) {
      if (user.password.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = password === user.password;
      }
    } else {
      return res.status(500).json({ error: "User has no password set" });
    }

    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    const token = createAccessToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
};

// ------------------ GET PROFILE ------------------
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ RESET PASSWORD ------------------
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password || password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
};

// ------------------ APPLY AS FARMER ------------------
exports.applyAsFarmer = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Only Consumers can apply
    if (user.role !== "Consumer") {
      return res.status(400).json({ error: "Only Consumers can apply as Farmers" });
    }

    // If already applied
    if (user.hasAppliedFarmer) {
      return res.status(400).json({ error: "You already applied. Please wait for approval." });
    }

    // Mark application
    user.hasAppliedFarmer = true;
    user.isApproved = false;
    await user.save();

    res.json({ message: "Farmer application submitted", user });
  } catch (err) {
    console.error("Apply as farmer error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ ADMIN: Get Pending Farmers ------------------
exports.getFarmerApplicants = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find all Consumers who applied
    const applicants = await User.find({ role: "Consumer", hasAppliedFarmer: true })
      .select("-password");

    res.json({ applicants });
  } catch (err) {
    console.error("Get farmer applicants error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ ADMIN: Approve Farmer ------------------
exports.approveFarmer = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "Consumer" || !user.hasAppliedFarmer) {
      return res.status(400).json({ error: "This user has not applied to be a farmer" });
    }

    user.role = "Farmer";
    user.isApproved = true;
    user.hasAppliedFarmer = false;
    await user.save();

    res.json({ message: "Farmer approved successfully", user });
  } catch (err) {
    console.error("Approve farmer error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ ADMIN: Reject Farmer ------------------
exports.rejectFarmer = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "Consumer" || !user.hasAppliedFarmer) {
      return res.status(400).json({ error: "This user has no farmer application" });
    }

    user.role = "Consumer";
    user.isApproved = false;
    user.hasAppliedFarmer = false;
    await user.save();

    res.json({ message: "Farmer application rejected", user });
  } catch (err) {
    console.error("Reject farmer error:", err);
    res.status(500).json({ error: "Server error" });
  }
};