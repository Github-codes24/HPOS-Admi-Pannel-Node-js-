const Patient = require("../models/sickleCellPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const { personalName, resultStatus, fromDate, toDate, HPLC, centerCode, bloodStatus, cardStatus } = req.query;

     // Build the filter object dynamically
    const queryFilter = {};

    // Apply filters only if query parameters are provided
    if (personalName) queryFilter.personalName = personalName
    if (resultStatus) queryFilter.resultStatus = resultStatus;
    if (HPLC) queryFilter.HPLC = HPLC;
    if (centerCode) queryFilter.centerCode = centerCode;
    if (bloodStatus) queryFilter.bloodStatus = bloodStatus;
    if (cardStatus) queryFilter.cardStatus = cardStatus;

    // Apply date range filtering for createdAt field if fromDate and toDate are provided
    if (fromDate && fromDate !== null && toDate && toDate !== null) {
      queryFilter.createdAt = {
        $gte: new Date(new Date(fromDate).setHours(00, 00, 00)),
        $lte: new Date(new Date(toDate).setHours(23, 59, 59))
      };
    }

    const allPatients = await Patient.find(queryFilter);
    const totalCount = allPatients.length;
    return res.status(200).json({ data: allPatients });
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
    if (fromDate && fromDate !== null && toDate && toDate !== null) {
      dateFilter.createdAt = {
        $gte: new Date(new Date(fromDate).setHours(00, 00, 00)),
        $lte: new Date(new Date(toDate).setHours(23, 59, 59))
      };
    }

    // Apply the date filter to each patient type
    const allSickleCellCancerPatients = await Patient.find(dateFilter);
    const allSickleCellCancerMalePatients = (await Patient.find({gender: 'Male', ...dateFilter})).length;
    const allSickleCellCancerFemalePatients = (await Patient.find({gender: 'Female', ...dateFilter})).length;

    // Combine all patients into a single array
    const totalData = [
        ...allSickleCellCancerPatients
      ];
    const totalCount = totalData.length;
    return res.status(200).json({ totalCount: totalCount, allMalePatientsCount: allSickleCellCancerMalePatients, allFemalePatientCount: allSickleCellCancerFemalePatients
     });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

const updateSickleCellPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters
    const updatedData = req.body; // Updated patient data coming from the request body

    let patient;
    // Try to find the patient in model, stop once found
    patient = await Patient.findById(patientId);

    // If patient is not found in the models
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in any records" });
    };
    // Check if the request body has any fields for update
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: "No fields provided for update. Please pass at least one field to update.",
      });
    };
    await Patient.findByIdAndUpdate(patientId, updatedData, { new: true });
    return res.status(200).json({ message: "Sickle cell patient updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

const getSickleCellPatientById = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters

    let patient;
    // Try to find the patient in model, stop once found
    patient = await Patient.findById(patientId);

    // If patient is not found in the models
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in any records" });
    };
    return res.status(200).json({ message: "Sickle cell patient updated successfully", data: patient });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

const getCenterCountsForSickleCellCancer = async (req, res) => {
  try {
    // Aggregation to count patients grouped by `centerName` and the day they were created
    const sickleCellCancerCounts = await Patient.aggregate([
      {
        $group: {
          _id: {
            centerName: "$centerName",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          sickleCellCancerCount: { $sum: 1 }
        }
      }
    ]);

    // Combine counts by merging arrays and summing values for the same company and date
    const totalData = {};

    // Helper function to accumulate data
    const accumulateCounts = (dataArray, diseaseField) => {
      dataArray.forEach(({ _id, [diseaseField]: count }) => {
        const key = `${_id.centerName}-${_id.date}`;
        if (!totalData[key]) {
          totalData[key] = { centerName: _id.centerName, date: _id.date, totalCount: 0 };
        }
        // totalData[key][diseaseField] = count;
        totalData[key].totalCount += count;
      });
    };

    // Accumulate data for each disease
    accumulateCounts(sickleCellCancerCounts, "sickleCellCancerCount");

    // Convert the totalData object back to an array and sort by date
    const sortedTotalData = Object.values(totalData).sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({ totalData: sortedTotalData });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving patient records",
      error: error.message,
    });
  }
};

const getPatientCountsForGraphForSickleCellCancer = async (req, res) => {
  try {
    const { timeFrame } = req.query; // 'daily', 'weekly', or 'monthly'

    if (!timeFrame) {
        return res.status(400).json({ status: false, message: "timeFrame is required field " });
    };
    
    // Determine the appropriate date format based on the time frame
    let dateFormat;
    if (timeFrame === 'daily') {
      dateFormat = '%Y-%m-%d'; // Group by day
    } else if (timeFrame === 'weekly') {
      dateFormat = '%Y-%V'; // Group by week (ISO week number)
    } else if (timeFrame === 'monthly') {
      dateFormat = '%Y-%m'; // Group by month
    } else {
      return res.status(400).json({ message: "Invalid time frame. Choose 'daily', 'weekly', or 'monthly'." });
    }

    // Aggregation pipeline for each type of patient (breast cancer, cervical cancer, sickle cell)

    const sickleCellCancerCounts = await Patient.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } }
          },
          sickleCellCancerCount: { $sum: 1 }
        }
      }
    ]);

    // Initialize a combined data object to accumulate counts by date
    const totalData = {};

    // Helper function to accumulate counts for each type of disease
    const accumulateCounts = (dataArray, diseaseField) => {
      dataArray.forEach(({ _id, [diseaseField]: count }) => {
        const key = _id.date; // Unique key by date only
        if (!totalData[key]) {
          totalData[key] = { date: _id.date, totalCount: 0 }; // Initialize total count
        }
        totalData[key].totalCount += count; // Accumulate the total count across centers
      });
    };

    // Accumulate counts for each disease type
    accumulateCounts(sickleCellCancerCounts, "sickleCellCancerCount");

    // Convert totalData object back to an array and sort by date
    const sortedTotalData = Object.values(totalData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Return the response with aggregated and sorted data
    return res.status(200).json({ totalData: sortedTotalData });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving patient records",
      error: error.message,
    });
  }
};

const candidatesReport = async (req, res) => {
  try {
    // Count documents where resultStatus matches each condition
    const totalNormal = await Patient.countDocuments({ resultStatus: "Normal(HbAA)" });
    const totalSickleCellTrait = await Patient.countDocuments({ resultStatus: "Sickle Cell Trait(HbAS)" });
    const totalSickleCellDisease = await Patient.countDocuments({ resultStatus: "Sickle Cell Disease(HbSS)" });
    const totalCardDistributed = await Patient.countDocuments({ cardStatus: "Submitted" });

    // You can add more counts if necessary for other statuses

    // Return the counts in the response
    return res.status(200).json({
      totalNormal: totalNormal,
      totalSickleCellTrait: totalSickleCellTrait,
      totalSickleCellDisease: totalSickleCellDisease,
      totalCardDistributed: totalCardDistributed,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving patient records",
      error: error.message,
    });
  }
};


const deleteSickleCellPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters

    let patient;
    // Try to find the patient in model, stop once found
    patient = await Patient.findById(patientId);

    // If patient is not found in any of the models
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in any records" });
    };
    await Patient.findByIdAndUpdate(patientId, { isDeleted: true });
    return res.status(200).json({ message: "Sickle cell patient deleted successfully" });
    
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

module.exports = { getAllPatients, getAllPatientsCount, updateSickleCellPatient, deleteSickleCellPatient,
    getCenterCountsForSickleCellCancer, getPatientCountsForGraphForSickleCellCancer, candidatesReport, getSickleCellPatientById };
