const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateSickleCellPatient, deleteSickleCellPatient, getSickleCellPatientById,
} = require("../controllers/sickleCellPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateSickleCellPatient/:patientId", updateSickleCellPatient);
router.post("/deleteSickleCellPatient/:patientId", deleteSickleCellPatient);
router.get("/getSickleCellPatientById/:patientId", getSickleCellPatientById);

module.exports = router;
