
import { Server, Socket } from "socket.io";
import Message from "./models/message";

export const initSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });

    socket.on(
      "private_message",
      async ({
        receiverId,
        message,
      }: {
        receiverId: string;
        message: {
          senderId: string;
          content: string;
          clientId: string;
        };
      }) => {
        const saved = await Message.create({
          senderId: message.senderId,
          receiverId,
          content: message.content,
        });

        io.to(receiverId).emit("receive_message", {
          ...saved.toObject(),
          clientId: message.clientId,
        });

        io.to(message.senderId).emit("receive_message", {
          ...saved.toObject(),
          clientId: message.clientId,
        });
      }
    );
  });
};