const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  enhance,
  textToImage,
  imageToImage,
  variations,
  upscale,
  removeBackground,
} = require("../controllers/generateController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = express.Router();

router.use(protect);

router.post("/enhance", enhance);
router.post("/text-to-image", textToImage);
router.post("/image-to-image", upload.single("image"), imageToImage);
router.post("/variations", upload.single("image"), variations);
router.post("/upscale", upload.single("image"), upscale);
router.post("/remove-bg", upload.single("image"), removeBackground);

module.exports = router;
