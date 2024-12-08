require("dotenv").config();
console.log("MongoDB URI:", process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Import http to create a server
const { Server } = require("socket.io"); // Import Server from socket.io

const pollRoutes = require("./routes/pollRoutes");
const storePollRoutes = require("./routes/storePollRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Use http to create a server for both Express and Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO on the same server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to", mongoose.connection.db.databaseName);
  console.log("URI used:", process.env.MONGO_URI);
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/polls", pollRoutes); // For fetching
app.use("/api/storePollRoutes", storePollRoutes);  // For storing
app.use("/api/vote", voteRoutes);

// Socket.IO: handling discussion feature
io.on("connection", (socket) => {
  console.log("A voter has joined the discussion");
  socket.emit("message", "VoteChain: Welcome! Please be respectful and courteous to others as you participate in the discussion panel 😊");
  socket.on("disconnect", () => {
    console.log("A voter has left the discussion");
  });

  socket.on("chatmessage", msg => {
    io.emit("message", msg);
    console.log("Received message:", msg);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
