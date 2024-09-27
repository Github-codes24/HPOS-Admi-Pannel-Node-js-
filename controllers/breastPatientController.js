const Patient = require("../models/breastPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const allPatients = await Patient.find();
    const totalCount = allPatients.length;
    return res.status(200).json({ totalCount: totalCount, data: allPatients });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

const filterPatients = async (req, res) => {
  const BPatient = require("../models/breastPatientModel");

  try {
    const allBreastCancerPatients = await BPatient.find();

    let totalData = [...allBreastCancerPatients];
    const {
      empName,
      centerCode,
      resultStatus,
      hplcStatus,
      bloodStatus,
      cardStatus
    } = req.query;

    // Filter by empName
    if (empName) {
      const regex = new RegExp(empName, 'i');
      totalData = totalData.filter(patient => regex.test(patient.employeeName));
    }

    // Filter by status fields
    if (resultStatus && resultStatus !== 'All') {
      totalData = totalData.filter(patient => patient.resultStatus === resultStatus);
    }
    if (hplcStatus && hplcStatus !== 'All') {
      totalData = totalData.filter(patient => patient.hplcStatus === hplcStatus);
    }
    if (bloodStatus && bloodStatus !== 'All') {
      totalData = totalData.filter(patient => patient.bloodStatus === bloodStatus);
    }
    if (cardStatus && cardStatus !== 'All') {
      totalData = totalData.filter(patient => patient.cardStatus === cardStatus);
    }

    // Filter by centerCode
    if (centerCode) {
      totalData = totalData.filter(patient => patient.centerCode === centerCode);
    }

    const { fromDate, toDate } = req.query;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      totalData = totalData.filter(
        (patient) =>
          new Date(patient.date) >= from && new Date(patient.date) <= to
      );
    }

    if (totalData.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }

    return res.status(200).json({ totalCount: totalData.length, totalData });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

const updatePatient = async (req, res) => {
  const BPatient = require("../models/breastPatientModel");

  const { patientId } = req.params; // Patient ID from the request parameters
  const updatedData = req.body; // Updated patient data coming from the request body

  try {
    let patient;

    patient = await BPatient.findById(patientId);
    if (patient) {
      await BPatient.findByIdAndUpdate(patientId, updatedData, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json({
        message: "Patient updated successfully",
      });
    }

    // If the patient id does not exist in any of the models
    return res
      .status(404)
      .json({ message: "Patient not found in any records" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

module.exports = { getAllPatients, filterPatients, updatePatient };
