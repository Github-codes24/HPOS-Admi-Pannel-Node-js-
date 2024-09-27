const CervicalPatient = require("../models/cervicalPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const allPatients = await CervicalPatient.find();
    const totalCount = allPatients.length;
    return res.status(200).json({ totalCount: totalCount, data: allPatients });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};



const filterPatients = async(req,res)=>{

  
  const CPatient = require("../models/cervicalPatientModel");
  
    try {
      const allCervicalCancerPatients = await CPatient.find();  
      let totalData = [...allCervicalCancerPatients];
  
      const allowedFields = ['empName', 'centerCode', 'resultStatus', 'hplcStatus', 'bloodStatus', 'cardStatus'];
  
      allowedFields.forEach((field) => {
        if (req.query[field]) {
          if (field === 'empName') {
            const regex = new RegExp(req.query[field], 'i');
            totalData = totalData.filter(patient => regex.test(patient.employeeName));
          } else if (field === 'resultStatus' || field === 'hplcStatus' || field === 'bloodStatus' || field === 'cardStatus') {
            if (req.query[field] !== 'All') {
              totalData = totalData.filter(patient => patient[field] === req.query[field]);
            }
          } else if (field === 'centerCode') {
            totalData = totalData.filter(patient => patient.centerCode === req.query[field]);
          }
        }
      });
  
      const { fromDate, toDate } = req.query;
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        totalData = totalData.filter(patient => new Date(patient.date) >= from && new Date(patient.date) <= to);
      }
  
      if (totalData.length === 0) {
        return res.status(404).json({ message: 'No patients found' });
      }
  
      return res.status(200).json({ totalCount: totalData.length, totalData });
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving patient records', error });
    }
  };


  const updatePatient = async (req, res) => {
    const CPatient = require("../models/cervicalPatientModel");

    const { patientId } = req.params; // Patient ID from the request parameters
    const updatedData = req.body; // Updated patient data coming from the request body
  
    try {
      let patient;
        
      patient = await CPatient.findById(patientId);
      if (patient) {
        await CPatient.findByIdAndUpdate(patientId, updatedData, { new: true, runValidators: true });
        return res.status(200).json({
          message: 'Patient updated successfully'
        });
      }
  
      // If the patient id does not exist in any of the models
      return res.status(404).json({ message: 'Patient not found in any records' });
  
    } catch (error) {
      return res.status(500).json({
        message: 'Error updating patient data',
        error: error.message,
      });
    }
  };

module.exports = { getAllPatients,filterPatients,updatePatient };
