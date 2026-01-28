import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import { initSocket } from "./socket";

// ✅ LOAD ENV VARIABLES
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

// ✅ SAFE CHECK
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env file");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });