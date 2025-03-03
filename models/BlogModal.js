const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    categoryType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    numViews: {
        type: Number,
        default: 0,
    },

    image: {
        type: "String",
        required: "true",
    },
    author: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' // Reference the Admin model
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
    },

);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);