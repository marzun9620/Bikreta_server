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

        // Uploading image to Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
                return res.status(500).send('Upload to Cloudinary failed');
            }

            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Create the user
            const newUser = new User({
                fullName: req.body.fullName,
                shopName: req.body.shopName,
                email: req.body.email,
                password: hashedPassword, // save the hashed password
                districts: req.body.districts,
                thana: req.body.thana,
                houseNo: req.body.houseNo,
                profilePhoto: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    version: result.version
                },
                otp: otp,
                otpExpires: Date.now() + 10*60*1000 // 10 minutes from now
            });

            try {
                await newUser.save();

                // Sending the OTP to the user's email
                await sendEmail(newUser.email, "Verify Your Email", `Your verification code is: ${otp}. This code will expire in 10 minutes.`);

                res.status(201).send({ message: "A verification code has been sent to your email. Please enter it on the platform to verify your account." });

            } catch (saveErr) {
                console.error("Error while saving the user:", saveErr.message);
                res.status(500).send("Server error: Failed to save user to the database");
            }
        }).end(imageStream);
    });
};


const emailVar = async (req, res) => {
    try {
        const { otp } = req.body; // Assuming the OTP is sent in the request body

        const user = await User.findOne({ _id: req.params.id, otp: otp, otpExpires: { $gt: Date.now() } });

        if (!user) return res.status(400).send({ message: "Invalid or expired OTP" });

        user.verified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        console.error('Error in OTP verification:', error.message);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


module.exports = {
  user,
  emailVar
};
