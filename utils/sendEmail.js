const nodemailer = require("nodemailer");
require('dotenv').config();

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // since you're using gmail
			port:587,
			secure:true,
			logger:true,
			secureConnection:false,
            auth: {
                user:'emim9620@gmail.com',
                pass:'cruuryieuowqyjst' // this should be your App password
            },
			
        });

        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        };
          
        await transporter.sendMail(mailOptions);
        console.log("email sent successfully");
        console.log(text);
    } catch (error) {
        console.log("email not sent!");
        console.log(error);
        return error;
    }
};
