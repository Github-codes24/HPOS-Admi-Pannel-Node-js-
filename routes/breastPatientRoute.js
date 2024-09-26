const express = require("express");
const {
  getAllPatients,
} = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);

module.exports = router;
