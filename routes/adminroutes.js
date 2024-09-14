const express = require("express");
const { registerUser, loginUser } = require("../controllers/adminController"); // Import user-related controller functions
const { isAuth } = require("../middleware/Authmiddelware"); // Import authentication middleware

const app = express(); // Initialize Express application

// Route for user registration
// This route handles POST requests to "/register" and calls the registerUser controller function
app.post("/register", registerUser);

// Route for user login
// This route handles POST requests to "/login" and calls the loginUser controller function
app.post("/login", loginUser);

// Export the Express app to be used in other parts of the application
module.exports = app;
