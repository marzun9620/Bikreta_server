const multer=require('multer');
const Product = require('../models/Product');



const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'dvt7ktdue', 
  api_key: '343128951383287', 
  api_secret: '86-oV6lIZFuMi6PtLM_oi2bKn50' 
});

const upload = multer({ storage: multer.memoryStorage() }).single('productImage');


exports.getAllProducts1=async (req, res) => {
    try {
        const products = await Product.find();
        res.send(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
 

exports.getAllProducts = async (req, res) => {
   
};
exports.productDetails = async (req, res) => {
    try {
        console.log(req.params.id);
        const productId = req.params.id;

        const product = await Product.findById(productId);
      
        
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        res.json(product);
        
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
};





exports.createProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        
        const imageStream = req.file.buffer;
        
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
                return res.status(500).send('Upload to Cloudinary failed');
            }
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            countInStock: req.body.countInStock,
            category:req.body.category,
            description: req.body.description,
            productImage: {
                url: result.secure_url,
                publicId: result.public_id,
                version: result.version
            }
        });

        try {
            await newProduct.save();
            res.status(201).json(newProduct);
        } catch (saveErr) {
            console.error('Database error:', saveErr.message);
            res.status(500).send("Server error: Failed to save product to the database");
        }
        }).end(imageStream);
    });
};
