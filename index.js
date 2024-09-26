const express = require("express");
require("dotenv").config(); // Load environment variables from .env file
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express(); // Initialize Express application

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Parse cookies attached to the client request
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
app.use(
    cors({
        origin: "*", // Allow all origins (for development purposes; adjust for production)
    })
);

// File imports

// Database connection configuration
const db = require("./config/db");

// Import user-related routes
const userRoutes = require("./routes/adminroutes");
const sickleCellPatientRoutes = require("./routes/sickleCellPatientRoute");
const cervicalPatientRoutes = require("./routes/cervicalPatientRoute");
const breastPatientRoutes = require("./routes/breastPatientRoute");

// Import utility functions (e.g., cron jobs)n
const { cleanUpBin } = require("./utils/corn");

const PORT = process.env.PORT; // Port number for the server

// Routes setup

// User routes (e.g., /user/register, /user/login)
app.use("/admin", userRoutes);
app.use("/sickleCell", sickleCellPatientRoutes);
app.use("/cervical", cervicalPatientRoutes);
app.use("/breastCancer", breastPatientRoutes);

// Start the server and set up cron jobs

app.listen(PORT, () => {
    console.log("Server running at port:", PORT);

    // Start the cleanup cron job
    cleanUpBin();
});
