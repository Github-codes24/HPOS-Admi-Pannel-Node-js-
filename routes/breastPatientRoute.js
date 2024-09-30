const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateBreastCancerPatient, deleteBreastCancerPatient,
} = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateBreastCancerPatient/:patientId", updateBreastCancerPatient);
router.post("/deleteBreastCancerPatient/:patientId", deleteBreastCancerPatient);

module.exports = router;
