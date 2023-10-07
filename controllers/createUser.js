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
            
           
            
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                shopName: req.body.shopName,
                location: req.body.location,
                email: req.body.email,
                password: req.body.password,
                profilePhoto: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    version: result.version
                }
            });

            try {
                await newUser.save();

                const token = await new Token({
                    userId: newUser._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();

                const url = `http://localhost:3000/api/users/${newUser.id}/verify/${token.token}`;
                await sendEmail(newUser.email, "Verify Email", url);

                res.status(201).send({ message: "An Email sent to your account please verify" });
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
