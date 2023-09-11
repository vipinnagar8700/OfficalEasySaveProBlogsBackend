const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const { ObjectId, Timestamp } = require('mongodb');
const crypto = require("crypto")
// Declare the Schema of the Mongo model
var AdminSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin",
    },
   

    address: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Admin'
    }
},
    { timestamps: true }

);

AdminSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt)
})
AdminSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
AdminSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    this.passwordResetExpires = Date.now() + 30 * 60 * 1000 //10 minutes
    return resettoken;
};

//Export the model
module.exports = mongoose.model('Admin', AdminSchema);