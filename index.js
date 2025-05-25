import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import meRoutes from "./routes/auth.me.route.js";
import websiteRoutes from "./routes/websites.route.js";
import {
  getCronFrequency,
  updateCronFrequency,
} from "./cron/websiteCheck.cron.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://website-monitor-client.vercel.app",
      "https://monitor.spiderworks.org",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

let connectedClients = [];

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  connectedClients.push(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    connectedClients = connectedClients.filter((s) => s.id !== socket.id);
  });
});

export const sendWebsiteFailureAlert = (data) => {
  connectedClients.forEach((socket) => {
    socket.emit("website-failure", data);
  });
};

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://website-monitor-client.vercel.app",
      "https://monitor.spiderworks.org",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// cron routes

app.get("/api/cron/frequency", async (req, res) => {
  try {
    const frequency = await getCronFrequency();
    res.status(200).json({ frequency });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch frequency" });
  }
});

app.post("/api/cron/update-frequency", async (req, res) => {
  const { frequency } = req.body;
  try {
    await updateCronFrequency(frequency);
    res.status(200).json({ message: "Frequency updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// other routes

app.use("/api/auth", authRoutes);
app.use("/api/current-user", meRoutes);
app.use("/api/websites", websiteRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server + Socket.IO running on port ${PORT}`)
);
