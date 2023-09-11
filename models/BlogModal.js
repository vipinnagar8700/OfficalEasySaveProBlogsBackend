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
    category: {
        type: String,
        required: true,
    },
    numViews: {
        type: Number,
        default: 0,
    },

    image: {
        type: "String",
        default: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fst2.depositphotos.com%2F1006899%2F8421%2Fi%2F950%2Fdepositphotos_84219350-stock-photo-word-blog-suspended-by-ropes.jpg&tbnid=4iaT_L1MK2jm_M&vet=12ahUKEwir__vHqZ2BAxWiz6ACHY3MDFoQMygUegUIARCfAQ..i&imgrefurl=https%3A%2F%2Fdepositphotos.com%2F84219350%2Fstock-photo-word-blog-suspended-by-ropes.html&docid=0pog_-17aKt2tM&w=1024&h=640&q=blog%20images&ved=2ahUKEwir__vHqZ2BAxWiz6ACHY3MDFoQMygUegUIARCfAQ"
    },
    author: {
        type: "String",
        default: "Subadmin"
    },

},
    // {
    //     toJSON: {
    //         virtuals: true,
    //     },
    //     toObject: {
    //         virtuals: true,
    //         timestamps: true,
    //     }
    // },

);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);