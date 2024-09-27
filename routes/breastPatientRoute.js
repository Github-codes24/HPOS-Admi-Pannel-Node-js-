const express = require("express");
const { getAllPatients,updatePatient,filterPatients } = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.put('/patients/:patientId', updatePatient);
router.get('/filter', filterPatients);

module.exports = router;
