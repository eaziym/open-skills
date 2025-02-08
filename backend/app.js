require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT;
const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");

// Connect to DB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith(process.env.FRONTEND_URL)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  next();
});

// Routes
const userRouter = require("./routes/userRouter");
const homeRouter = require("./routes/homeRouter");
const adminRouter = require("./routes/adminRouter");
const swipeRouter = require("./routes/swipeRouter");
const utilRouter = require("./routes/utilRouter");

app.use("/user", userRouter);
app.use("/home", homeRouter);
app.use("/swipe", swipeRouter);
app.use("/admin", adminRouter);
app.use("/", utilRouter);
app.use("/uploads", express.static("uploads"));

// Attach socket.io to the HTTP server
const io = new socketIO.Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Pass the io instance to the socket handler module
require("./socket/chatSocketHandler")(io);

server.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
