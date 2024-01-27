// src/models/FormSubmission.js
const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  zone: { type: String, required: true },
  sdName: { type: String, required: true },
  substation: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true },
  surveyorsName: { type: String, required: true },
  startingTime: { type: String, required: true },
  endingTime: { type: String, required: true },
  numOfIndividualData: { type: Number, required: true },
  dailyCompletion: { type: Number, required: true },
  // Add other fields here based on your form

  // Timestamps to track when the document was created and updated
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = FormSubmission;
