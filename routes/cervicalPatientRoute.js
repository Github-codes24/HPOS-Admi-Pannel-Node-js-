const express = require("express");
const {
  getAllPatients,
} = require("../controllers/cervicalPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);

module.exports = router;
