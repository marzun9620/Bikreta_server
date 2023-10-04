const multer=require('multer');
const Product = require('../models/Product');




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
    try {
        const product = await Product.findById(req.params.productId);
        if (!product || !product.productImage) {
            throw new Error('No product image found');
        }
        res.set('Content-Type', product.productImage.image.contentType);
        res.send(product.productImage.image.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send('Not Found');
    }
};
exports.productDetails = async (req, res) => {
    try {
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Setting the directory for storing uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Using Date.now() for unique filenames
    }
});

const upload = multer({ storage: storage }).single('image');

exports.createProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error:', err);
            if (err instanceof multer.MulterError) {
                return res.status(500).send("Multer error: " + err.message);
            } else {
                return res.status(500).send("Upload Error: " + err.message);
            }
        }

        const fs = require('fs');
        const imageBuffer = fs.readFileSync(req.file.path);

        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            countInStock: req.body.countInStock,
            category:req.body.category,
            description: req.body.description,
            productImage: {
                name: req.file.filename,
                image: {
                    data: imageBuffer,
                    contentType: req.file.mimetype
                }
            }
        });

        try {
            await newProduct.save();
            res.status(201).json(newProduct);
        } catch (saveErr) {
            console.error('Database error:', saveErr.message);
            res.status(500).send("Server error: Failed to save product to the database");
        }
    });
};
