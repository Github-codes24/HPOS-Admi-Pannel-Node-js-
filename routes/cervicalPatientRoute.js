const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateCervicalCancerPatient,
} = require("../controllers/cervicalPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateCervicalCancerPatient/:patientId", updateCervicalCancerPatient);

module.exports = router;
