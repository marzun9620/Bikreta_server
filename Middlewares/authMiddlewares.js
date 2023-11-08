const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
    const token = req.header('x-auth-token');

    if (token === undefined || !token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.KEYUSER);
        if (decoded.isUser === true) {
            req.user = decoded;
            next();
        } else {
            res.status(403).send('Access denied. User token is not valid.');
        }
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}


function authAdmin(req, res, next) {
    const token = req.header('x-auth-token');
  
    if (!token) {
      return res.status(401).send('Access denied. No token provided');
    }
  
    try {
      const decoded = jwt.verify(token, process.env.KEYADMIN);
  
      if (!decoded.isAdmin) {
        return res.status(403).send('Access denied. Not an admin.');
      }
  
      req.admin = decoded;
      next();
    } catch (ex) {
      res.status(400).send('Invalid token');
    }
  }
  

  


module.exports = {authenticate,authAdmin}; // Export the function
