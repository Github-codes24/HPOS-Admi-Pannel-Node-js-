const express = require("express");
const {
  getAllPatients, getAllPatientsCount, updateBreastCancerPatient, deleteBreastCancerPatient, getBreastCancerPatientById,
  getCenterCountsForBreastCancer, getPatientCountsForGraphBreastCancer, updateManyUsersForBreastCancer,
} = require("../controllers/breastPatientController");
const router = express.Router();

router.get("/getAllPatients", getAllPatients);
router.get("/getAllPatientsCount", getAllPatientsCount);
router.put("/updateBreastCancerPatient/:patientId", updateBreastCancerPatient);
router.post("/deleteBreastCancerPatient/:patientId", deleteBreastCancerPatient);
router.get("/getBreastCancerPatientById/:patientId", getBreastCancerPatientById);
router.get("/getCenterCountsForBreastCancer", getCenterCountsForBreastCancer);
router.get("/getPatientCountsForGraphBreastCancer", getPatientCountsForGraphBreastCancer);
router.put("/updateManyUsersForBreastCancer", updateManyUsersForBreastCancer);

module.exports = router;
