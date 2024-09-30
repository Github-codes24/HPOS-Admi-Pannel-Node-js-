const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateSickleCellPatient,
} = require("../controllers/sickleCellPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateSickleCellPatient/:patientId", updateSickleCellPatient);

module.exports = router;
