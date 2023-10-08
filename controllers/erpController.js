const Category = require('../models/Catagory');

const addCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const category = new Category({
            name,
            description
        });

        await category.save();

        res.status(201).json({ message: "Category added successfully!", category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category already exists!" });
        }
        res.status(500).json({ message: "Server error" });
    }
};
module.exports=addCategory;