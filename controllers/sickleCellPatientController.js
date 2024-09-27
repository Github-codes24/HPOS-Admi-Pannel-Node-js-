const Patient = require("../models/sickleCellPatientModel");

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

const getAllPatientsCount = async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
  
      // Build the date filter if fromDate and toDate are provided
      const dateFilter = {};
      if (fromDate && toDate) {
        dateFilter.createdAt = {
          $gte: new Date(new Date(fromDate).setHours(00, 00, 00)),
          $lte: new Date(new Date(toDate).setHours(23, 59, 59))
        };
      }
  
      // Apply the date filter to each patient type
      const allCervicalCancerPatients = await Patient.find(dateFilter);
  
      // Combine all patients into a single array
      const totalData = [
          ...allCervicalCancerPatients,
        ];
      const totalCount = totalData.length;
      return res.status(200).json({ totalCount: totalCount });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving patient records", error });
    }
  };

module.exports = { getAllPatients, getAllPatientsCount };
