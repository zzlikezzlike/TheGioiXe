const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();
require("dotenv").config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Cấu hình multer để lưu file lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "images",
    allowed_formats: ["jpg", "jpeg", "png"], // Định dạng ảnh cho phép
  },
});

const upload = multer({ storage });

// Nhận nhiều ảnh từ frontend
router.post("/upload", upload.array("images", 10), (req, res) => {  // Max 10 ảnh
  if (!req.files) {
    return res.status(400).json({ error: "Không có file được gửi lên" });
  }

  // Lấy URL của ảnh đã upload
  const imageUrls = req.files.map(file => file.path);

  // Trả về URL của ảnh đã upload
  res.json({ imageUrls });
});

module.exports = router;
