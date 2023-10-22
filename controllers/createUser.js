const router = require("express").Router();
require('dotenv').config();

const { User, validate } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const multer = require('multer');

const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'dvt7ktdue', 
  api_key: '343128951383287', 
  api_secret: '86-oV6lIZFuMi6PtLM_oi2bKn50' 
});

const upload = multer({ storage: multer.memoryStorage() }).single('profilePhoto');

const user = async (req, res) => {
    console.log(req.body);
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
            
           
            console.log(2223);
            const newUser = new User({
                fullName: req.body.fullName,
                shopName: req.body.shopName,
                email: req.body.email,
                password: req.body.password,
                districts: req.body.districts,
                thana: req.body.thana,
                houseNo: req.body.houseNo,
                profilePhoto: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    version: result.version
                }
            });

            try {
                await newUser.save();

            } catch (saveErr) {
                res.status(500).send("Server error: Failed to save user to the database");
            }
        }).end(imageStream);
    });
};

const emailVar = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send({ message: "Invalid link" });

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send({ message: "Invalid link" });

        await User.updateOne({ _id: user._id }, { verified: true });
        await token.remove();

        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        console.error('Error in email verification:', error.message);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
  user,
  emailVar
};
