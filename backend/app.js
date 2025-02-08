require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const userRouter = require("./routes/userRouter");
const homeRouter = require("./routes/homeRouter");
const adminRouter = require("./routes/adminRouter");
const swipeRouter = require("./routes/swipeRouter");
const utilRouter = require("./routes/utilRouter");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT;
const cors = require("cors");

connectDB();

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

app.use("/user", userRouter);

app.use("/home", homeRouter);

app.use("/swipe", swipeRouter);

app.use("/admin", adminRouter); // For testing purposes  // can make a admin dashboard in future

app.use("/", utilRouter);

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log("server is running on ", PORT);
});
