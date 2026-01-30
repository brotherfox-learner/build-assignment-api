import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;
app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/users", async (req, res) => {
  const users = await connectionPool.query("SELECT * FROM users");
  return res.json(users.rows);
});

app.post("/assignments", async (req, res) => {
  // 1. รับข้อมูลจากผู้ใช้งาน
  const newUser = { ...req.body, created_at: new Date(), updated_at: new Date(), published_at: new Date() };
  // 2. บันทึกข้อมูลลงฐานข้อมูล
  await connectionPool.query("INSERT INTO assignments (title, content, category) VALUES ($1, $2, $3)", [newUser.title, newUser.content, newUser.category]);
  // 3. ส่งข้อมูลกลับไปยังผู้ใช้งาน
  return res.status(201).json({ "message": "Created assignment successfully", "data": newUser });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
