const express = require("express");
const {
  getAllPatients, getAllPatientsCount
} = require("../controllers/cervicalPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);

module.exports = router;
