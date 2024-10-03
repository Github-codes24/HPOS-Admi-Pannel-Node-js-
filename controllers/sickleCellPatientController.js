const Patient = require("../models/sickleCellPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build the filter object dynamically by copying all request query parameters
    let queryFilter = { ...req.query };

    // Remove fromDate and toDate from the queryFilter since we handle them separately
    delete queryFilter.fromDate;
    delete queryFilter.toDate;
    // Apply date range filtering for createdAt field if fromDate and toDate are provided
    if (fromDate && fromDate !== null && toDate && toDate !== null) {
      queryFilter.createdAt = {
        $gte: new Date(new Date(fromDate).setHours(00, 00, 00)),
        $lte: new Date(new Date(toDate).setHours(23, 59, 59))
      };
    }

    const allPatients = await Patient.find(queryFilter);
    const totalCount = allPatients.length;
    const formattedData = allPatients.map(patient => {
        if (patient.birthYear) {
          const [day, month, year] = patient.birthYear.split('-'); // Assuming birthYear format is dd-mm-yyyy
          return {
            ...patient._doc, // Spread other patient data
            birthDay: day,
            birthMonth: month,
            birthYear: year
          };
        }
        return patient;
    });
    return res.status(200).json({ data: formattedData });
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

const getAllPatientsForSubmittedForSickleCellCancer = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build the filter object dynamically by copying all request query parameters
    let queryFilter = { ...req.query };

    // Remove fromDate and toDate from the queryFilter since we handle them separately
    delete queryFilter.fromDate;
    delete queryFilter.toDate;
    // Apply date range filtering for createdAt field if fromDate and toDate are provided
    if (fromDate && fromDate !== null && toDate && toDate !== null) {
      queryFilter.createdAt = {
        $gte: new Date(new Date(fromDate).setHours(00, 00, 00)),
        $lte: new Date(new Date(toDate).setHours(23, 59, 59))
      };
    }
    const bStatus = ["A+ve", "A-ve", "B+ve", "B-ve", "O+ve", "O-ve", "AB+ve", "AB-ve"]
    const rStatus = ["Normal(HbAA)", "Sickle Cell Trait(HbAS)", "Sickle Cell Disease(HbSS)"]

    const allSickleCellCancerPatients = await Patient.find({...queryFilter, bloodStatus: { $in: bStatus }, resultStatus: { $in: rStatus }, cardStatus: "Submitted" });

    // Combine all patients into a single array
    const totalData = [
        ...allSickleCellCancerPatients
      ];
    return res.status(200).json({ totalData: totalData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

const getCenterCountsForSickleCellCancer = async (req, res) => {
  try {
    const allPatients = await Patient.find();
    const allPatientsSubmitted = await Patient.find({ cardStatus: "Submitted"});
    const allPatientsHangOut = await Patient.find({ cardStatus: "HangOut"});
    const allPatientsPending = await Patient.find({ cardStatus: "Pending"});
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

    return res.status(200).json({ totalData: sortedTotalData, totalCard: allPatients.length, totalDistributed: allPatientsSubmitted.length,
        totalPrinted: allPatientsHangOut.length, totalRemaining: allPatientsPending.length
     });
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
      return res.status(400).json({ status: false, message: "timeFrame is a required field" });
    }

    // Get the current date
    const now = new Date();
    let startDate, endDate, dateFormat, isWeekly = false, isMonthly = false, isDaily = false;

    if (timeFrame === 'daily') {
      // For daily, we group by hour of the current day
      startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of the day (12:00 AM)
      endDate = new Date(now.setHours(23, 59, 59, 999)); // End of the day (11:59 PM)
      dateFormat = '%Y-%m-%d %H:00'; // Group by hour (e.g., "2024-10-01 13:00" for 1 PM)
      isDaily = true;
    } else if (timeFrame === 'weekly') {
      // Weekly: Filter for the current week (Monday to Sunday)
      const currentDay = now.getDay();
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
      startDate = new Date(now.setDate(diff)); // Set to the Monday of the current week
      startDate.setHours(0, 0, 0, 0); // Start of the week (12:00 AM)
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of the week (Sunday)
      endDate.setHours(23, 59, 59, 999);
      dateFormat = '%Y-%m-%d'; // Group by date for now
      isWeekly = true;
    } else if (timeFrame === 'monthly') {
      // Monthly: Filter for the current year (January to December)
      startDate = new Date(now.getFullYear(), 0, 1); // Start of the year (Jan 1)
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // End of the year (Dec 31)
      dateFormat = '%Y-%m'; // Group by month
      isMonthly = true;
    } else {
      return res.status(400).json({ message: "Invalid time frame. Choose 'daily', 'weekly', or 'monthly'." });
    }

    // Aggregation pipeline for each type of patient (sickle cell)
    
    const sickleCellCancerCounts = await Patient.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lte: endDate } } // Filter by date range
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } }
          },
          sickleCellCancerCount: { $sum: 1 }
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
    accumulateCounts(sickleCellCancerCounts, "sickleCellCancerCount");

    // For daily, initialize the totalData with zeros for each hour of the day
    const sortedTotalDataDaily = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:00`;
      
      // Format hour to AM/PM
      const formattedHour = hour % 12 === 0 ? '12' : (hour % 12).toString(); // Convert to 12-hour format
      const amPm = hour < 12 ? 'AM' : 'PM'; // Determine AM or PM
      
      sortedTotalDataDaily.push({
        time: `${formattedHour} ${amPm}`, // AM/PM format
        totalCount: totalData[hourKey]?.totalCount || 0 // Use existing count or 0
      });
    }

    // Initialize the totalData with zeros for each month of the year
    const sortedTotalDataMonthly = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let month = 0; month < 12; month++) {
      const formattedMonth = `${now.getFullYear()}-${(month + 1).toString().padStart(2, '0')}`; // Format to YYYY-MM
      sortedTotalDataMonthly.push({
        time: monthNames[month], // Month name
        totalCount: totalData[formattedMonth]?.totalCount || 0 // Use existing count or 0
      });
    }

    // Return the response based on the time frame
    if (isDaily) {
      return res.status(200).json({ totalData: sortedTotalDataDaily });
    } else if (isWeekly) {
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const sortedTotalDataWeekly = [];

      // Initialize the totalData with zeros for each day of the week
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i); // Get each day of the week
        const formattedDate = dayDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
        sortedTotalDataWeekly.push({
          time: formattedDate,
          dayName: weekDays[(i + 1) % 7], // Adjust to get day name
          totalCount: totalData[formattedDate]?.totalCount || 0 // Use existing count or 0
        });
      }

      return res.status(200).json({ totalData: sortedTotalDataWeekly });
    } else if (isMonthly) {
      return res.status(200).json({ totalData: sortedTotalDataMonthly });
    } else {
      return res.status(200).json({ totalData: Object.values(totalData).sort((a, b) => new Date(a.time) - new Date(b.time)) });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving patient records",
      error: error.message,
    });
  }
};

const updateManyUsersForSickleCellCancer = async (req, res) => {
  try {
    const { updates } = req.body; // Expecting updates to be an array of objects with { id, data }
    const ids = updates.map(update => update.id); // Extract all IDs from the updates array

    // Create an array to hold update promises
    const updatePromises = [];


    // Check and update in SPatient model
    const sPatients = await Patient.find({ _id: { $in: ids } });
    sPatients.forEach(sPatient => {
      const updateData = updates.find(update => update.id.toString() === sPatient._id.toString());
      if (updateData) {
        updatePromises.push(Patient.findByIdAndUpdate(sPatient._id, updateData.data, { new: true }));
      }
    });

    // Wait for all updates to complete
    const updatedDocuments = await Promise.all(updatePromises);

    // Send a response with the updated documents
    return res.status(200).json({
      message: 'Documents updated successfully',
      data: updatedDocuments,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating documents',
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

module.exports = { getAllPatients, getAllPatientsCount, updateSickleCellPatient, deleteSickleCellPatient, updateManyUsersForSickleCellCancer,
    getCenterCountsForSickleCellCancer, getPatientCountsForGraphForSickleCellCancer, candidatesReport, getSickleCellPatientById, getAllPatientsForSubmittedForSickleCellCancer };
