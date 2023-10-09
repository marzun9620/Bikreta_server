const multer=require('multer');
const Product = require('../models/Product');
const Category = require('../models/Catagory');

const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'dvt7ktdue', 
  api_key: '343128951383287', 
  api_secret: '86-oV6lIZFuMi6PtLM_oi2bKn50' 
});

const upload = multer({ storage: multer.memoryStorage() }).single('productPhoto');


//add categories
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

//see all categories

const allCatagories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
      } catch (error) {
        res.status(500).send('Server Error');
      }
};

//add products

const addProducts = (req, res) => {
   
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send(err.message);
           
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
            console.log(2)
        }
        
        const imageStream = req.file.buffer;
        
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
                return res.status(500).send('Upload to Cloudinary failed');
            }
        const newProduct = new Product({
            productName: req.body.productName,
            description: req.body.description,
            unitPrice: req.body.unitPrice,
            category:req.body.category,
            cartonSize: req.body.cartonSize,
            cartonStock: req.body.cartonStock,
            minStockThreshold: req.body.minStockThreshold,
            productPhoto: {
                url: result.secure_url,
                publicId: result.public_id,
                version: result.version
            }
        });

        try {
            await newProduct.save();
            res.status(201).json({ message: "Category added successfully!", newProduct });
        } catch (saveErr) {
            console.error('Database error:', saveErr.message);
            res.status(507).send("Server error: Failed to save product to the database");
        }
        }).end(imageStream);
    });
};

module.exports={
    addCategory,
    allCatagories,
    addProducts
};