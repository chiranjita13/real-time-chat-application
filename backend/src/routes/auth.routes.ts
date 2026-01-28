
  import { Router } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth"; // ✅ FIX

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, username },
    process.env.JWT_SECRET!
  );

  res.json({ token });
});

// 🔒 Protected route
router.get("/users", authMiddleware, async (req, res) => {
  const users = await User.find({}, "_id username");
  res.json(users);
});

export default router;