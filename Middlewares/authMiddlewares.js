const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
    const token = req.header('x-auth-token');

    if (token === undefined || !token) {
        return res.status(401).send('Access denied. No token provided.');
      }
      

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}


function authAdmin(req, res, next) {
    const token = req.header('x-auth-token');
    console.log(token);
    if (!token || token == undefined) return res.status(401).send('Access denied. No token provided');

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        req.admin = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
}

  


module.exports = {authenticate,authAdmin}; // Export the function
