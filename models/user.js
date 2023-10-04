const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
require('dotenv').config();

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    }
});

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	location: { type: String, required: true },
    shopName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	verified: { type: Boolean, default: false },
	profilePhoto: imageSchema,
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};



const validate = (data) => {
	const complexityOptions = {
        min: 5,
        max: 255,
    };
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		location: Joi.string().required().label("Location"),
        shopName: Joi.string().required().label("Shop Name"),
		email: Joi.string().email().required().label("email"),
		password: passwordComplexity(complexityOptions).required().label("Password")
	});
	return schema.validate(data);
};
const User = mongoose.model("user", userSchema);
module.exports = { User, validate };
