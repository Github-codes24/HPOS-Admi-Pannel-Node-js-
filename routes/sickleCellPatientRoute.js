const express = require("express");
const {
  getAllPatients,
} = require("../controllers/sickleCellPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);

module.exports = router;
