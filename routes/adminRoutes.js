const {Router}=require('express');
const router =Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const {authAdmin} = require('../Middlewares/authMiddlewares');


router.post('/signup', async (req, res) => {
   // console.log(req.body);
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) return res.status(400).send('Admin already registered.');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log(req.body.password);

    admin = new Admin({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    await admin.save();
    res.status(201).send({
        username: admin.username,
        email: admin.email
    });
});


router.post('/login', async (req, res) => {
    console.log(11);
    let admin = await Admin.findOne({ email: req.body.email });
   // console.log(admin.password);
    if (!admin) return res.status(401).send('Invalid email or password.');
  

// Assuming admin.password contains the hashed password stored in the database
const isPasswordValid = await bcrypt.compare(req.body.password, admin.password);

if (!isPasswordValid) return res.status(400).send('Invalid email or password.');


    const token = admin.generateAuthToken();
    res.status(200).send({
        token: token, // Include the token in the response body
        username: admin.username,
        email: admin.email
    });
    
    
});
module.exports=router;