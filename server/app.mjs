import express from "express";
import connectionPool from "./utils/db.mjs";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend local (Vite)
      "http://localhost:3000", // Frontend local (React แบบอื่น)
      "https://your-frontend.vercel.app", // Frontend ที่ Deploy แล้ว
      // ✅ ให้เปลี่ยน https://your-frontend.vercel.app เป็น URL จริงของ Frontend ที่ deploy แล้ว
    ],
  })
);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/users", async (req, res) => {
  const users = await connectionPool.query("SELECT * FROM users");
  return res.json(users.rows);
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.post("/assignments", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    // 1. ทำการ Validate ข้อมูลที่ส่งมาจากผู้ใช้งาน
    if (!title || !content || !category) {
      return res.status(400).json({
        "message": "Server could not create assignment because there are missing data from client",
      });
    }

    // 2. ทำการ Insert ข้อมูลลงฐานข้อมูล
    const result = await connectionPool.query(
      `INSERT INTO assignments (title, content, category)
       VALUES ($1, $2, $3)
       RETURNING assignment_id, title, content, category`,
      [title, content, category]
    );
    // 3. ส่งข้อมูลกลับไปยังผู้ใช้งาน
    return res.status(201).json({ "message": "Created assignment successfully", "data": result.rows[0] });
  } catch (error) {
    // 4. จัดการ Error ที่เกิดขึ้น
    return res.status(500).json({ "message": "Server could not create assignment because database connection" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
