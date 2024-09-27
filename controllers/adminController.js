const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/admin");
const { default: mongoose } = require("mongoose");
const { use } = require("../routes/adminroutes");
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS); // Number of salt rounds for bcrypt hashing
const ObjectId = mongoose.Types.ObjectId;

// POST - Register User
const registerUser = async (req, res) => {
  // Data Validation using Joi
  const isValid = Joi.object({
    Fullname: Joi.string().required(),
    username: Joi.string().min(3).max(25).alphanum().required(),
    password: Joi.string().min(8).required(),
    confirmpassword: Joi.string().min(8).required(),
  }).validate(req.body);

  // Check if validation failed
  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Input",
      data: isValid.error,
    });
  }

  // Check if passwords match
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).send({
      status: 400,
      message: "Passwords do not match",
    });
  }

  try {
    // Check if the Fullname orusername already exists in the database
    const userExists = await User.find({
      $or: [{ username: req.body.username }],
    });

    // If user already exists, return an error
    if (userExists.length !== 0) {
      return res.status(400).send({
        status: 400,
        message: "Username/Mobile number already exists",
      });
    }
  } catch (err) {
    // Handle error while checking existing user
    return res.status(400).send({
      status: 400,
      message: "Error while checking if username or mobile number exists",
      data: err,
    });
  }

  // Hash the user's password before saving
  const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

  // Generate a JWT token for the user
  const token = await jwt.sign(
    {
      Fullname: req.body.userid,
      password: hashedPassword,
    },
    process.env.JWT_SECRET
  );
  console.log(token);

  // Create a new user object with the hashed password and token
  const userObj = new User({
    Fullname: req.body.Fullname,
    password: hashedPassword,
    username: req.body.username,
    token: token,
  });

  try {
    await userObj.save();

    return res.status(201).send({
      status: 201,
      message: "User registered successfully",
    });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Error while save user to DB",
      data: err,
    });
  }
};
// POST - Login User
const loginUser = async (req, res) => {
  const { userName, password } = req.body;

  // Validate the login data using Joi
  const isValid = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  // Check if validation failed
  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Username/password",
      data: isValid.error,
    });
  }

  let userData;

  try {
    // Find the user in the database by Fullname
    userData = await User.findOne({ userName });

    // If no user is found, return an error
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: "No user found! Please register",
      });
    }
  } catch (err) {
    // Handle error while fetching user data
    return res.status(400).send({
      status: 400,
      message: "Error while fetching user data",
      data: err,
    });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordSame = await bcrypt.compare(password, userData.password);

  // If the password does not match, return an error
  if (!isPasswordSame) {
    return res.status(400).send({
      status: 400,
      message: "Incorrect Password",
    });
  }
  console.log(userData);

  const payload = {
    fullName: userData.fullName,
    username: userData.userName,
    userId: userData._id,
    password: userData.password,
  };

  // Generate a JWT token (if needed)
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  // Send success response
  return res.status(200).send({
    status: 200,
    message: "User Logged in successfully",
    data: { token, payload }, // Uncomment if you want to return the token and payload
  });
};

const BPatient = require("../models/breastPatientModel");
const CPatient = require("../models/cervicalPatientModel");
const SPatient = require("../models/sickleCellPatientModel");

// GET: Retrieve all patient records
const getAllPatients = async (req, res) => {
  try {
    const allBreastCancerPatients = await BPatient.find();
    const allCervicalCancerPatients = await CPatient.find();
    const allSickleCellCancerPatients = await SPatient.find();

    // Combine all patients into a single array
    const totalData = [
      ...allBreastCancerPatients,
      ...allCervicalCancerPatients,
      ...allSickleCellCancerPatients,
    ];
    const totalCount = totalData.length;
    return res
      .status(200)
      .json({ totalCount: totalCount, totalData: totalData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient records", error });
  }
};

/// on local data process

const filterPatients = async(req,res)=>{
    try {
      const allBreastCancerPatients = await BPatient.find();
      const allCervicalCancerPatients = await CPatient.find();
      const allSickleCellCancerPatients = await SPatient.find();

      let totalData = [
        ...allBreastCancerPatients,
        ...allCervicalCancerPatients,
        ...allSickleCellCancerPatients,
      ];

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


  // update patient data

  const updatePatient = async (req, res) => {
    const { patientId } = req.params; // Patient ID from the request parameters
    const updatedData = req.body; // Updated patient data coming from the request body
  
    try {
      let patient;
      
      patient = await BPatient.findById(patientId);
      if (patient) {
        await BPatient.findByIdAndUpdate(patientId, updatedData, { new: true, runValidators: true });
        return res.status(200).json({
          message: 'Patient updated successfully',
        });
      }
  
      patient = await CPatient.findById(patientId);
      if (patient) {
        await CPatient.findByIdAndUpdate(patientId, updatedData, { new: true, runValidators: true });
        return res.status(200).json({
          message: 'Patient updated successfully'
        });
      }
  
      patient = await SPatient.findById(patientId);
      if (patient) {
        await SPatient.findByIdAndUpdate(patientId, updatedData, { new: true, runValidators: true });
        return res.status(200).json({
          message: 'Patient updated successfully',
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

  //massupdate
  


module.exports = { registerUser, loginUser, getAllPatients,filterPatients,updatePatient };
