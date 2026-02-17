import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addresses.js";
import userRoutes from "./routes/users.js";
import paymentRoutes from "./routes/payment.js";
import fabricRoutes from "./routes/fabrics.js";
import categoriesRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

/* ==============================
   Middleware
============================== */

// CORS first so all responses (including errors) get CORS headers
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://casawood.com",
  "https://www.casawood.com",
  "https://api.casawood.com",
  "https://www.api.casawood.com",
  "https://admin.casawood.com",
  "https://www.admin.casawood.com",
  "https://admin.api.casawood.com",
  "https://www.admin.api.casawood.com",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];
// In development, allow any localhost/127.0.0.1 origin (Vite may use different port)
const isDev = process.env.NODE_ENV !== "production";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        return callback(null, true);
      // Reject without throwing so we don't send 403 (just omit Allow-Origin)
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Security middleware – allow cross-origin so frontend can call API
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
  })
);

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix for Google Auth popup issue
app.use((req, res, next) => {
  res.setHeader(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );
  next();
});

/* ==============================
   Routes
============================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Casawood API Running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/admin", adminRoutes);

/* ==============================
   404 Handler
============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ==============================
   Global Error Handler
============================== */
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack
    })
  });
});

/* ==============================
   Database Connection
============================== */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✓");
  } catch (error) {
    console.error("MongoDB Connection Failed ❌", error.message);
    process.exit(1);
  }
};

/* ==============================
   Start Server
============================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
