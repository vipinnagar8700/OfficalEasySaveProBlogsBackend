const asyncHandler = require('express-async-handler');
const Subadmin = require('../models/SubadminModel')
const { validateMongoDbId } = require('../utils/validationmongodb');

const isAdmin = (req, res, next) => {
    // Assuming you store the user's role in the request object after authentication
    const userRole = req.user.role; // You should set req.user during authentication

    if (userRole === 'Admin') {
        // User is an admin, allow access to the route
        next();
    } else {
        // User is not an admin, return an error
        res.status(403).json({ message: "Access denied. You are not an admin." });
    }
};



module.exports = { isAdmin }