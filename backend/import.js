const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://TruongSon:0918318110@cluster0.lzuskd0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function importData() {
    const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true }); 
    
    try {
        await client.connect();
        console.log("Đã kết nối MongoDB Atlas!");

        const database = client.db("TheGioiXe");
        const collection = database.collection("Collection1");


        const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} bản ghi đã được import thành công!`);

    } catch (error) {
        console.error("Lỗi import dữ liệu:", error);
    } finally {
        await client.close();
    }
}

importData();
