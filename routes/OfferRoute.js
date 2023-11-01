const express = require('express');
const Category = require('../models/Catagory');
const Offer = require('../models/Offer');
const Discount=require('../models/Discount');
const router = express.Router();





// Create a new offer
router.post("/hello", async (req, res) => {
   
  try {
    const { selectedCategory, offerDescription, startDate, endDate } = req.body;

    // Search for the category by name
    const category = await Category.findOne({ name: selectedCategory });

    if (!category) {
      return res.status(400).json({ error: "Selected category not found" });
    }

    // Create a new offer with the retrieved category _id
    const offer = new Offer({
      selectedCategory: category._id,
      offerDescription,
      startDate,
      endDate,
    });

    // Save the offer to the database
    await offer.save();

    res.status(201).json(offer);
  } catch (error) {
    console.error("Error creating the offer:", error);
    res.status(500).json({ error: "An error occurred while creating the offer" });
  }
});

router.post("/discounts/hello", async (req, res) => {
  console.log(111);
  console.log(req.body);
  try {
    const { selectedCategory, discountPercentage, startDate, endDate } = req.body;

    // Search for the category by name
    const category = await Category.findOne({ name: selectedCategory });

    if (!category) {
      return res.status(400).json({ error: "Selected category not found" });
    }

    // Create a new discount with the retrieved category _id
    const discount = new Discount({
      selectedCategory: category._id,
      discountPercentage,
      startDate,
      endDate,
    });

    // Save the discount to the database
    await discount.save();

    res.status(201).json(discount);
  } catch (error) {
    console.error("Error creating the discount:", error);
    res.status(500).json({ error: "An error occurred while creating the discount" });
  }
});

module.exports = router;
