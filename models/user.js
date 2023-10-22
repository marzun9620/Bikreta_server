const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const crypto = require("crypto"); // To generate OTP
require('dotenv').config();

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    shopName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    districts: { type: String, required: true },
    thana: { type: String, required: true },
    houseNo: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    profilePhoto: {
        url: String,
        publicId: String,
        version: String
    },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

// New method to set OTP
userSchema.methods.setOTP = function() {
    const otp = crypto.randomBytes(3).toString("hex"); // generates a 6-character hexadecimal string
    this.otp = otp;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP expires after 10 minutes
    this.otpExpires = expiry;
    return otp;
};

// New method to validate OTP
userSchema.methods.validateOTP = function(enteredOtp) {
    const currentDate = new Date();
    if (this.otp === enteredOtp && this.otpExpires > currentDate) {
        this.verified = true;
        this.otp = undefined; // clear the OTP
        this.otpExpires = undefined; // clear the expiration
        return true;
    } else {
        return false;
    }
};

const validate = (data) => {
    const complexityOptions = {
        min: 5,
        max: 255,
    };
    const schema = Joi.object({
        fullName: Joi.string().required().label("First Name"),
        location: Joi.string().required().label("Location"),
        shopName: Joi.string().required().label("Shop Name"),
        email: Joi.string().email().required().label("email"),
        password: passwordComplexity(complexityOptions).required().label("Password")
    });
    return schema.validate(data);
};

const User = mongoose.model("user", userSchema);
module.exports = { User, validate };
