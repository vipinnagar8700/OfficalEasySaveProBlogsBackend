const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' // Reference the Admin model
    }, {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subadmin' // Reference the SubAdmin model
    }]
},
    { timestamps: true }

);

//Export the model
module.exports = mongoose.model('Category', CategorySchema);