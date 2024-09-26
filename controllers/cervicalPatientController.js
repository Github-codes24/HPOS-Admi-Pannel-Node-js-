const CervicalPatient = require("../models/cervicalPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const allPatients = await CervicalPatient.find();
    return res.json(allPatients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

module.exports = { getAllPatients };
