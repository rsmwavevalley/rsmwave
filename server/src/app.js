const express = require("express");
const cors = require("cors");

require("dotenv").config();

const path = require("path");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const configRoutes = require("./routes/configRoutes");
const capacityRoutes = require("./routes/capacityRoutes");
const app = express();

/* =========================
   MIDDLEWARE
========================= */

const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-pin"],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve E-ticket PDF files statically
app.use("/tickets", express.static(path.join(__dirname, "../tickets")));

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("RSM Wave Valley Backend Running");
});

/* =========================
   ROUTES
========================= */

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/config", configRoutes);

app.use("/api/capacity", capacityRoutes);
//app.use("/api/payments", paymentRoutes);
/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});