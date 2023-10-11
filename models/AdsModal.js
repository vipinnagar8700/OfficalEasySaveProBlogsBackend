const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var adsSchema = new mongoose.Schema({
    AdsName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    AdsLocation: {
        type: String,
        required: true,
    },
    AdsImage: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        required: true,
        default: "active",
    },
    AdsUrl: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' // Reference the SubAdmin model
    }, {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subadmin' // Reference the SubAdmin model
    }],
},
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
            timestamps: true,
        }
    }, { timestamps: true });

//Export the model
module.exports = mongoose.model('Ads', adsSchema);