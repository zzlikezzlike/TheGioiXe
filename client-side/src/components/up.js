import React, { useState } from "react";

const DirectUpload = () => {
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh!");
      return;
    }

    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default"); // preset phải là unsigned
      formData.append("folder", "multi-frontend"); // optional

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dqdvdwdlb/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("Upload kết quả:", data);

        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          alert("Upload thất bại. Kiểm tra lại preset và cloud_name.");
          console.error("Upload error:", data);
        }
      } catch (error) {
        console.error("Lỗi khi upload:", error);
        alert("Có lỗi khi upload ảnh.");
      }
    }

    setImageUrls(uploadedUrls);
  };

  return (
    <div>
      <h3>Upload ảnh trực tiếp lên Cloudinary</h3>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button onClick={handleUpload}>Upload</button>

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        {imageUrls.map((url, idx) => (
          <img key={idx} src={url} alt={`Uploaded ${idx}`} width="200" />
        ))}
      </div>
    </div>
  );
};

export default DirectUpload;
