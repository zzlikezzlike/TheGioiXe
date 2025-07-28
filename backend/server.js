require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối MongoDB Atlas
const MONGO_URI = "mongodb+srv://TruongSon:0918318110@cluster0.lzuskd0.mongodb.net/TheGioiXe?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ file tĩnh

// Cấu hình Multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Kết nối MongoDB thành công! Database: TheGioiXe | Collection: Collection1'))
  .catch(err => {
    console.error('🔴 Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Schema cho collection
const carSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  manufacturer: String,
  image: String,
}, { collection: 'Collection1' });

const Car = mongoose.model('Car', carSchema);

// API Endpoints
app.get('/', async (req, res) => {
  console.log('🟢 Đã nhận yêu cầu GET /');
  try {
    const cars = await Car.find();
    res.json(cars.length > 0 ? cars : { message: "Không có dữ liệu xe trong collection" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm xe mới (với upload ảnh)
app.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, manufacturer } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : '';

    const newCar = new Car({
      name,
      category,
      price,
      manufacturer,
      image
    });

    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Các endpoint khác (PUT, DELETE) giữ nguyên
app.put('/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }

    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ error: 'Không tìm thấy xe' });
    res.json({ message: 'Xóa thành công', deletedCar });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`📚 Đang sử dụng collection: Collection1`);
});

// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: "dqdvdwdlb",
//   api_key: "398565674914765",
//   api_secret: "gM4-fjgKRKm71PqtS4mWL2AA2PM",
// });

// // Cấu hình storage dùng Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "multi-upload", // Thư mục trên Cloudinary
//     allowed_formats: ["jpg", "png", "jpeg"],
//   },
// });

// const upload = multer({ storage: storage });

// // API upload nhiều ảnh
// app.post("/api/upload", upload.array("images", 10), (req, res) => {
//   try {
//     const imageUrls = req.files.map((file) => file.path); // Cloudinary trả URL tại 'path'
//     res.json({ imageUrls });
//   } catch (error) {
//     res.status(500).json({ message: "Upload lỗi", error });
//   }
// });

// app.listen(5000, () => console.log("Server running on port 5000"));


