import { Router } from "express";
import Message from "../models/message";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:userId", authMiddleware, async (req, res) => {
  const myId = (req as any).user.id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: otherId },
      { senderId: otherId, receiverId: myId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

export default router;

