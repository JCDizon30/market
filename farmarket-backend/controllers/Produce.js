const Produce = require("../models/Produce");

// Format produce object
const formatProduce = (produce) => ({
  id: produce._id,
  farmer: produce.farmer
    ? { id: produce.farmer._id, firstName: produce.farmer.firstName, lastName: produce.farmer.lastName }
    : null,
  name: produce.name,
  category: produce.category,
  description: produce.description,
  mass: produce.mass,
  price: produce.price,
  stock: produce.stock,
  images: produce.images || [],
  isActive: produce.isActive,
  createdAt: produce.createdAt ? produce.createdAt.toISOString() : null,
  updatedAt: produce.updatedAt ? produce.updatedAt.toISOString() : null
});

// ------------------- MIDDLEWARE -------------------

// Verify farmer role AND approved status
const verifyApprovedFarmer = (req, res, next) => {
  if (!req.user || req.user.role !== "Farmer") {
    return res.status(403).send({ error: "Farmer access only" });
  }
  if (!req.user.isApproved) {
    return res.status(403).send({ error: "Your farmer account is not yet approved" });
  }
  next();
};

// ------------------- CONTROLLER METHODS -------------------

// GET all produce
module.exports.getAll = (req, res) => {
  Produce.find()
    .populate("farmer", "firstName lastName")
    .then((produce) => res.status(200).send(produce.map(formatProduce)))
    .catch(() => res.status(500).send({ error: "Something went wrong" }));
};

// GET all active produce (for consumers)
module.exports.getAllActive = (req, res) => {
  Produce.find({ isActive: true })
    .populate("farmer", "firstName lastName")
    .then((produce) => res.status(200).send(produce.map(formatProduce)))
    .catch(() => res.status(500).send({ error: "Something went wrong" }));
};

// GET produce by ID
module.exports.getProduce = (req, res) => {
  Produce.findById(req.params.produceID)
    .populate("farmer", "firstName lastName")
    .then((produce) => {
      if (!produce) return res.status(404).send({ error: "Produce not found" });
      res.status(200).send(formatProduce(produce));
    })
    .catch(() => res.status(500).send({ error: "Something went wrong" }));
};

// SEARCH by name
module.exports.searchByProduceName = (req, res) => {
  const regex = new RegExp(req.body.name, "i");
  Produce.find({ name: regex })
    .populate("farmer", "firstName lastName")
    .then((produce) => res.status(200).send(produce.map(formatProduce)))
    .catch(() => res.status(500).send({ error: "Something went wrong" }));
};

// SEARCH by price
module.exports.searchByProducePrice = (req, res) => {
  const minPrice = req.body.minPrice || 0;
  const maxPrice = req.body.maxPrice || Number.MAX_SAFE_INTEGER;
  Produce.find({ price: { $gte: minPrice, $lte: maxPrice } })
    .populate("farmer", "firstName lastName")
    .then((produce) => res.status(200).send(produce.map(formatProduce)))
    .catch(() => res.status(500).send({ error: "Something went wrong" }));
};

// ------------------- FARMER ONLY -------------------

// ADD produce
exports.addProduce = async (req, res) => {
  try {
    // ✅ Ensure only approved farmers can add
    if (req.user.role !== "Farmer" || !req.user.isApproved) {
      return res.status(403).json({ error: "Only approved farmers can add produce" });
    }

    // ✅ Collect image paths
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    // ✅ Attach logged-in farmer ID
    const newProduce = new Produce({
      farmer: req.user.id,   // 🔥 auto-set farmer from token
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      mass: req.body.mass,
      price: req.body.price,
      stock: req.body.stock,
      images: imagePaths,
    });

    await newProduce.save();
    res.status(201).json({ message: "Produce added successfully", produce: newProduce });
  } catch (err) {
    console.error("Add produce error:", err);
    res.status(500).json({ error: "Failed to add produce", details: err.message });
  }
};

// UPDATE produce
exports.updateProduce = async (req, res) => {
  try {
    // ✅ Only approved farmers can update
    if (req.user.role !== "Farmer" || !req.user.isApproved) {
      return res.status(403).json({ error: "Only approved farmers can update produce" });
    }

    const { produceID } = req.params;

    // ✅ Find the produce
    const produce = await Produce.findById(produceID);
    if (!produce) {
      return res.status(404).json({ error: "Produce not found" });
    }

    // ✅ Ownership check
    if (produce.farmer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own produce" });
    }

    // ✅ Handle images
    const imagePaths = req.files ? req.files.map(file => file.path) : produce.images;

    // ✅ Update fields
    produce.name = req.body.name || produce.name;
    produce.category = req.body.category || produce.category;
    produce.description = req.body.description || produce.description;
    produce.mass = req.body.mass || produce.mass;
    produce.price = req.body.price || produce.price;
    produce.stock = req.body.stock || produce.stock;
    produce.images = imagePaths;

    await produce.save();

    res.json({ message: "Produce updated successfully", produce });
  } catch (err) {
    console.error("Update produce error:", err);
    res.status(500).json({ error: "Failed to update produce", details: err.message });
  }
};

// DELETE produce
exports.deleteProduce = async (req, res) => {
  try {
    if (req.user.role !== "Farmer" || !req.user.isApproved) {
      return res.status(403).json({ error: "Only approved farmers can delete produce" });
    }

    const { produceID } = req.params;
    const produce = await Produce.findById(produceID);
    if (!produce) return res.status(404).json({ error: "Produce not found" });

    if (produce.farmer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own produce" });
    }

    await produce.deleteOne();
    res.json({ message: "Produce deleted successfully" });
  } catch (err) {
    console.error("Delete produce error:", err);
    res.status(500).json({ error: "Failed to delete produce", details: err.message });
  }
};

// ARCHIVE produce
exports.archiveProduce = async (req, res) => {
  try {
    const { produceID } = req.params;
    const produce = await Produce.findById(produceID);
    if (!produce) return res.status(404).json({ error: "Produce not found" });

    // Ownership check
    if (produce.farmer.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "You can only archive your own produce" });
    }

    produce.isActive = false;
    await produce.save();

    res.json({ message: "Produce archived successfully", produce });
  } catch (err) {
    console.error("Archive produce error:", err);
    res.status(500).json({ error: "Failed to archive produce", details: err.message });
  }
};

// ACTIVATE produce
exports.activateProduce = async (req, res) => {
  try {
    const { produceID } = req.params;
    const produce = await Produce.findById(produceID);
    if (!produce) return res.status(404).json({ error: "Produce not found" });

    // Ownership check
    if (produce.farmer.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "You can only activate your own produce" });
    }

    produce.isActive = true;
    await produce.save();

    res.json({ message: "Produce activated successfully", produce });
  } catch (err) {
    console.error("Activate produce error:", err);
    res.status(500).json({ error: "Failed to activate produce", details: err.message });
  }
};

