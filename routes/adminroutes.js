const express = require("express");
const { registerUser, loginUser, getAllPatients,updatePatient,filterPatients } = require("../controllers/adminController"); // Import user-related controller functions
const { isAuth } = require("../middleware/Authmiddelware"); // Import authentication middleware

const router = express.Router(); // Initialize Express application

// Route for user registration
// This route handles POST requests to "/register" and calls the registerUser controller function
router.post("/register", registerUser);

// Route for user login
// This route handles POST requests to "/login" and calls the loginUser controller function
router.post("/login", loginUser);
router.get("/getAllPatients", getAllPatients);
router.put('/patients/:patientId', updatePatient);
router.get('/filter', filterPatients);

// Export the Express app to be used in other parts of the application
module.exports = router;
