const CervicalPatient = require("../models/cervicalPatientModel");

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
    const allPatients = await CervicalPatient.find(queryFilter);
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
    const allCervicalCancerPatients = await CervicalPatient.find(dateFilter);

    // Combine all patients into a single array
    const totalData = [
        ...allCervicalCancerPatients,
      ];
    const totalCount = totalData.length;
    return res.status(200).json({ totalCount: totalCount
     });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

const updateCervicalCancerPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters
    const updatedData = req.body; // Updated patient data coming from the request body

    let patient;
    // Try to find the patient in model, stop once found
    patient = await CervicalPatient.findById(patientId);

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
    await CervicalPatient.findByIdAndUpdate(patientId, updatedData, { new: true });
    return res.status(200).json({ message: "Cervical cancer patient updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

const getCervicalCancerPatientById = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters

    let patient;
    // Try to find the patient in model, stop once found
    patient = await CervicalPatient.findById(patientId);

    // If patient is not found in the models
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in any records" });
    };
    return res.status(200).json({ message: "Cervical cancer patient fetched successfully", data: patient });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

const getCenterCountsForCervicalCancer = async (req, res) => {
  try {
    // Aggregation to count patients grouped by `centerName` and the day they were created
    const cervicalCancerCounts = await CervicalPatient.aggregate([
      {
        $group: {
          _id: {
            centerName: "$centerName",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          cervicalCancerCount: { $sum: 1 }
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
    accumulateCounts(cervicalCancerCounts, "cervicalCancerCount");

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

const getPatientCountsForGraphForCervicalCancer = async (req, res) => {
  try {
    const { timeFrame } = req.query; // 'daily', 'weekly', or 'monthly'

    if (!timeFrame) {
      return res.status(400).json({ status: false, message: "timeFrame is a required field" });
    }

    // Get the current date
    const now = new Date();
    let startDate, endDate, dateFormat, isWeekly = false;

    if (timeFrame === 'daily') {
      // For daily, we group by hour of the current day
      startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of the day (12:00 AM)
      endDate = new Date(now.setHours(23, 59, 59, 999)); // End of the day (11:59 PM)
      dateFormat = '%Y-%m-%d %H:00'; // Group by hour (e.g., "2024-10-01 13:00" for 1 PM)
    } else if (timeFrame === 'weekly') {
      // Weekly: Filter for the current week (Monday to Sunday)
      const currentDay = now.getDay();
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
      startDate = new Date(now.setDate(diff)); // Set to the Monday of the current week
      startDate.setHours(0, 0, 0, 0); // Start of the week (12:00 AM)
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of the week (Sunday)
      endDate.setHours(23, 59, 59, 999);
      dateFormat = '%Y-%m-%d'; // Group by date for now, we'll map the days after fetching data
      isWeekly = true;
    } else if (timeFrame === 'monthly') {
      // Monthly: Filter for the current year (January to December)
      startDate = new Date(now.getFullYear(), 0, 1); // Start of the year (Jan 1)
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // End of the year (Dec 31)
      dateFormat = '%Y-%m'; // Group by month
    } else {
      return res.status(400).json({ message: "Invalid time frame. Choose 'daily', 'weekly', or 'monthly'." });
    }

    // Aggregation pipeline for each type of patient (breast cancer, cervical cancer, sickle cell)
    
    const cervicalCancerCounts = await CervicalPatient.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lte: endDate } } // Filter by date range
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } }
          },
          cervicalCancerCount: { $sum: 1 }
        }
      }
    ]);

    // Initialize a combined data object to accumulate counts by date or hour
    const totalData = {};

    // Helper function to accumulate counts for each type of disease
    const accumulateCounts = (dataArray, diseaseField) => {
      dataArray.forEach(({ _id, [diseaseField]: count }) => {
        const key = _id.date; // Unique key by date/hour
        if (!totalData[key]) {
          totalData[key] = { time: _id.date, totalCount: 0 }; // Initialize with `time` and `totalCount`
        }
        totalData[key].totalCount += count; // Accumulate the total count across centers
      });
    };

    // Accumulate counts for each disease type
    accumulateCounts(cervicalCancerCounts, "cervicalCancerCount");

    // If weekly, map the dates to day names (Monday, Tuesday, etc.)
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedTotalData = Object.values(totalData).map(entry => {
      if (isWeekly) {
        const dayIndex = new Date(entry.time).getDay();
        return {
          ...entry,
          dayName: weekDays[dayIndex], // Add day name
        };
      }
      return entry;
    }).sort((a, b) => {
      if (isWeekly) {
        // Sort by day of the week (Monday to Sunday)
        return weekDays.indexOf(a.dayName) - weekDays.indexOf(b.dayName);
      }
      // Otherwise, sort by date/time
      return new Date(a.time) - new Date(b.time);
    });

    // Return the response with aggregated and sorted data
    return res.status(200).json({ totalData: sortedTotalData });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving patient records",
      error: error.message,
    });
  }
};


const deleteCervicalCancerPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from the request parameters

    let patient;
    // Try to find the patient in model, stop once found
    patient = await CervicalPatient.findById(patientId);

    // If patient is not found in any of the models
    if (!patient) {
      return res.status(404).json({ message: "Patient not found in any records" });
    };
    await CervicalPatient.findByIdAndUpdate(patientId, { isDeleted: true });
    return res.status(200).json({ message: "Cervical cancer patient deleted successfully" });
    
  } catch (error) {
    return res.status(500).json({
      message: "Error updating patient data",
      error: error.message,
    });
  }
};

module.exports = { getAllPatients, getAllPatientsCount, updateCervicalCancerPatient, deleteCervicalCancerPatient,
    getCenterCountsForCervicalCancer, getPatientCountsForGraphForCervicalCancer, getCervicalCancerPatientById };
