const mongoose = require("mongoose");

const breastpatientSchema = new mongoose.Schema({
  // personalName: { type: String, required: true },
  // abhaNumber: { type: String, required: true, unique: true },
  // aadhaarNumber: { type: String, required: true, unique: true },
  personalName: { type: String, required: true },
  centerCode: { type: String , default: "Center Code"},
  bloodStatus: { type: String , default: "Pending"},
  resultStatus: { type: String , default: "Pending"},
  HPLC: { type: String , default: "Pending"},
  cardStatus: { type: String , default: "Pending"},
  aadhaarNumber: { type: String, required: true, unique: true }, // Assuming Aadhaar number is unique
  number: { type: Number, required: true },
  birthYear: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  mobileNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
  fathersName: { type: String, required: true },
  motherName: { type: String }, // New field added
  maritalStatus: { type: String, required: true },
  category: { type: String, required: true },
  caste: { type: String, required: true },
  subCaste: { type: String },
  address: {
    address: { type: String, required: true },
    house: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
  },
  centerName: { type: String, required: true },
  isUnderMedication: { type: Boolean, required: true },
  isUnderBloodTransfusion: { type: Boolean, required: true },
  familyHistory: { type: Boolean, required: true },
  isDeleted: { type: String, default: false },
},
{ timestamps: true },
);

const Patient = mongoose.model("breastpatient", breastpatientSchema);
module.exports = Patient;
