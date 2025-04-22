const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'dqdvdwdlb', // Thay bằng cloud name của bạn
  api_key: '398565674914765',       // Thay bằng API key của bạn
  api_secret: 'gM4-fjgKRKm71PqtS4mWL2AA2PM', // Thay bằng API secret của bạn
});

// Xóa tất cả tài nguyên trong Cloudinary
cloudinary.api.delete_resources('multi-frontend', { resource_type: 'image' }, (error, result) => {
  if (error) {
    console.error('Error deleting images:', error);
  } else {
    console.log('All images deleted successfully:', result);
  }
});
