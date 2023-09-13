const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var GeoSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        index: true,
    },
    siteUrl: {
        type: String,
        required: true,
    },
    apiKey: {
        type: String,
        required: true,
    },
    apiUrl: {
        type: String,
        required: true,
    },

}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Geo', GeoSchema);