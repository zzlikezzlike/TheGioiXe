require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối MongoDB Atlas
const MONGO_URI = "mongodb+srv://TruongSon:0918318110@cluster0.lzuskd0.mongodb.net/TheGioiXe?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB (phiên bản tối ưu cho MongoDB Driver mới)
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
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars.length > 0 ? cars : { message: "Không có dữ liệu xe trong collection" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCar) return res.status(404).json({ error: 'Không tìm thấy xe' });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
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