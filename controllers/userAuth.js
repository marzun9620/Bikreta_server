const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require('bcrypt');
const sendEmail = require("../utils/sendEmail");
const Joi = require("joi");

const auth = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send({ message: 'Invalid email or password.' });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send({ message: 'Invalid email or password.' });

        // If the user is verified, generate a token and return it
        if (user.verified) {
            const token = user.generateAuthToken();
            return res.status(200).send({
                userName: user.fullName,
                userId: user._id.toString(),
                message: "Logged in successfully.",
                token: token
            });
        }

        // If an OTP is provided, validate it
        if (req.body.otp) {
            const isValidOtp = user.validateOTP(req.body.otp);
            if (isValidOtp) {
                user.verified = true;
                await user.save();
                const token = user.generateAuthToken();
                return res.status(201).send({
                    message: "User verified and logged in successfully.",
                    token: token
                });
            } else {
                return res.status(202).send({ message: "Invalid OTP." });
            }
        }

        // If OTP is not provided, check if there's a valid OTP already
        // Get the current local date and time
                const currentDate = new Date();

                // Get timezone offset in minutes
                const timezoneOffsetMinutes = currentDate.getTimezoneOffset();

                // Convert timezone offset to milliseconds
                const timezoneOffsetMilliseconds = timezoneOffsetMinutes * 60 * 1000;

                // Subtract the timezone offset from current date to get the local date and time
                const localDate = new Date(currentDate.getTime() - timezoneOffsetMilliseconds);
        if (user.otpExpires > localDate) {
            return res.status(203).send({ message: "A verification code has already been sent to your email. Please verify your account using the sent OTP." });
        }

        // If no valid OTP exists, generate a new OTP and send it to the user's email
        const otp = user.setOTP();
        await user.save();
        await sendEmail(user.email, "Verify Your Email", `Your verification code is: ${otp}. This code will expire in 10 minutes.`);
        return res.status(204).send({ message: "A new verification code has been sent to your email. Please verify your account using the OTP." });

    } catch (err) {
        console.error("Error in user authentication:", err.message);
        res.status(400).send({ message: "Internal Server Error" });
    }
}

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

const userPic = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profilePhoto || !user.profilePhoto.url) {
            return res.status(404).send('Image not found');
        }
        res.redirect(user.profilePhoto.url);
    } catch (error) {
        console.error("Error fetching user photo:", error);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    auth,
    userPic
};
