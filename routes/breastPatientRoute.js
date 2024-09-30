const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateBreastCancerPatient, deleteBreastCancerPatient, getBreastCancerPatientById
} = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateBreastCancerPatient/:patientId", updateBreastCancerPatient);
router.post("/deleteBreastCancerPatient/:patientId", deleteBreastCancerPatient);
router.get("/getBreastCancerPatientById/:patientId", getBreastCancerPatientById);

module.exports = router;
