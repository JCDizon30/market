const express = require("express");
const router = express.Router();
const userController = require("../controllers/User");
const { verify, isAdmin } = require("../auth");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/profile", verify, userController.getUserProfile);
router.post("/reset-password", verify, userController.resetPassword);

router.post("/apply-farmer", verify, userController.applyAsFarmer);

router.get("/farmers-applicants", verify, isAdmin, userController.getFarmerApplicants);
router.put("/approve-farmer/:userId", verify, isAdmin, userController.approveFarmer);
router.put("/reject-farmer/:id", verify, isAdmin, userController.rejectFarmer);

module.exports = router;
