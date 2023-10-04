const router = require("express").Router();

require('dotenv').config();
const { User, validate } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const fs = require('fs');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'userPictures/'); // Setting the directory for storing uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Using Date.now() for unique filenames
    }
});

const upload = multer({ storage: storage }).single('profilePhoto');


const user = async (req, res) => {
   // console.log(req.body);
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error:', err);
            if (err instanceof multer.MulterError) {
                return res.status(500).send("Multer error: " + err.message);
            } else {
                return res.status(500).send("Upload Error: " + err.message);
            }
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            shopName:req.body.shopName,
            location:req.body.location,
            email: req.body.email,
            password: hashedPassword,
            profilePhoto: {
                name: req.file.filename,
                image: {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype
                }
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
            console.error('Database error:', saveErr.message);
            res.status(500).send("Server error: Failed to save user to the database");
        }
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