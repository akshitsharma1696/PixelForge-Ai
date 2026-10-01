const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getCommunity,
  getLibrary,
  updateImage,
  deleteImages,
  moveImages,
  createFolder,
  getDashboardStats,
} = require("../controllers/imageController");

const router = express.Router();

router.get("/community", getCommunity);
router.get("/library", protect, getLibrary);
router.get("/dashboard", protect, getDashboardStats);
router.patch("/:id", protect, updateImage);
router.post("/delete", protect, deleteImages);
router.post("/move", protect, moveImages);
router.post("/folders", protect, createFolder);

module.exports = router;
