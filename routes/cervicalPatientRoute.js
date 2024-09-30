const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateCervicalCancerPatient, deleteCervicalCancerPatient
} = require("../controllers/cervicalPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateCervicalCancerPatient/:patientId", updateCervicalCancerPatient);
router.post("/deleteCervicalCancerPatient/:patientId", deleteCervicalCancerPatient);

module.exports = router;
