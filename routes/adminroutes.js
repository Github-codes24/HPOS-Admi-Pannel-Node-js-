const express = require("express");
const { registerUser, loginUser, getAllPatients, updateManyUsers, createCenterCode,getAllPatientsForSubmitted, getCities, getCenterName,
    getAllPatientsCount, updatePatient, deletePatient, getPatientCountsForGraph, getPatientById, getCenterCountsByCenterAndDate, getCategory, getCaste } = require("../controllers/adminController"); // Import user-related controller functions
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
router.get("/getAllPatientsForSubmitted", getAllPatientsForSubmitted);
router.put("/updateManyUsers", updateManyUsers);
router.post("/createCenterCode", createCenterCode);
router.get("/getCities", getCities);
router.get("/getCenterName", getCenterName);
router.get("/getCategory", getCategory);
router.get("/getCaste", getCaste);

// Export the Express app to be used in other parts of the application
module.exports = router;
