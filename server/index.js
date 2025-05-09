const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // Your React frontend
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));

app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend running and MongoDB connected!" });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
