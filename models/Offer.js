const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  selectedCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category model
    required: true,
  },
  offerDescription: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
