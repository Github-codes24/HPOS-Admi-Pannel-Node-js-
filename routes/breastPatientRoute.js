const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateBreastCancerPatient,
} = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateBreastCancerPatient/:patientId", updateBreastCancerPatient);

module.exports = router;
