const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');



const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Pre-save hook to hash password
adminSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
adminSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: true }, process.env.KEYADMIN, { expiresIn: '1h' });
    return token;
  }
  

module.exports = mongoose.model('Admin', adminSchema);
