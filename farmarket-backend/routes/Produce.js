const express = require("express");
const router = express.Router();
const produceController = require("../controllers/Produce");
const { verify } = require("../auth");
const upload = require("../upload");

// Get all produce
router.get("/", produceController.getAll);

// Get all active produce
router.get("/active", produceController.getAllActive);

// Get produce by ID
router.get("/:produceID", produceController.getProduce);

// Search produce
router.post("/search/name", produceController.searchByProduceName);
router.post("/search/price", produceController.searchByProducePrice);

// Farmer-only routes
router.post("/", verify, upload.array("images", 5), produceController.addProduce);
router.put("/:produceID", verify, upload.array("images", 5), produceController.updateProduce);
router.delete("/:produceID", verify, produceController.deleteProduce);
router.put("/archive/:produceID", verify, produceController.archiveProduce);
router.put("/activate/:produceID", verify, produceController.activateProduce);

module.exports = router;
