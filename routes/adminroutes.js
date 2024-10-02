const express = require("express");
const { registerUser, loginUser, getAllPatients, updateManyUsers, createCenterCode,
    getAllPatientsCount, updatePatient, deletePatient, getPatientCountsForGraph, getPatientById, getCenterCountsByCenterAndDate } = require("../controllers/adminController"); // Import user-related controller functions
const { isAuth } = require("../middleware/Authmiddelware"); // Import authentication middleware

const router = express.Router(); // Initialize Express application

// Route for user registration
// This route handles POST requests to "/register" and calls the registerUser controller function
router.post("/register", registerUser);

// Route for user login
// This route handles POST requests to "/login" and calls the loginUser controller function
router.post("/login", loginUser);
router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updatePatient/:patientId", updatePatient);
router.post("/deletePatient/:patientId", deletePatient);
router.get("/getPatientById/:patientId", getPatientById);
router.get("/getCenterCountsByCenterAndDate", getCenterCountsByCenterAndDate);
router.get("/getPatientCountsForGraph", getPatientCountsForGraph);
router.put("/updateManyUsers", updateManyUsers);
router.post("/createCenterCode", createCenterCode);

// Export the Express app to be used in other parts of the application
module.exports = router;
