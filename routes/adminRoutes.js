const {Router}=require('express');
const router =Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const {authAdmin} = require('../Middlewares/authMiddlewares');


router.post('/signup', async (req, res) => {
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
    res.send({
        username: admin.username,
        email: admin.email
    });
});


router.post('/login', async (req, res) => {
    console.log(11);
    let admin = await Admin.findOne({ email: req.body.email });
    console.log(admin.password);
    if (!admin) return res.status(400).send('Invalid email or password.');
  
    if (req.body.password !=admin.password) return res.status(400).send('Invalid email or password.');

    const token = admin.generateAuthToken();
    res.status(200).header('x-auth-token', token).send({
        username: admin.username,
        email: admin.email
    });
});
module.exports=router;