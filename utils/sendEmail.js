const nodemailer = require("nodemailer");
require('dotenv').config();

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: process.env.OAUTH_ACCESS_TOKEN
            }
        });
        

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: subject,
            text: text
        };
          
        await transporter.sendMail(mailOptions);
        console.log("email sent successfully");
       
    } catch (error) {
        console.log("email not sent!");
   
        return error;
    }
};
