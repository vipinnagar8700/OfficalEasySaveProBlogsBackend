const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require("crypto")
// Declare the Schema of the Mongo model
var SubadminSchema = new mongoose.Schema({
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
        default: "Subadmin",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },

    address: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        default:null,
    },
    refreshToken: {
        type: String,
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Reference the Admin model
        required: false // Ensure this field is required
    }
},
    {
        timestamps: true,
        strict: false, // Set strict mode to false
    }

);
// SubadminSchema.set('strict', false);
SubadminSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt)
})
SubadminSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
SubadminSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    this.passwordResetExpires = Date.now() + 30 * 60 * 1000 //10 minutes
    return resettoken;
};

//Export the model
module.exports = mongoose.model('Subadmin', SubadminSchema);