const User = require('../models/UserModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const { generateToken } = require('../config/JwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
require('dotenv/config')



const CreateUser = (asyncHandler(async (req, res) => {
    const { name, email, mobile, password } = req.body;
    // Function to determine the author type (Admin or Subadmin)
    try {
        const data = await User.create({
            name, email, mobile, password
        });
        res.status(200).json({
            status: "Success",
            message: "User Successfully Created!",
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

    // Check if the author is an Admin or Subadmin by their author
    // Now you can proceed to create the blog

}))


const LoginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(email,password)
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const token = generateToken(findUser._id);
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await User.findOneAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            message: "User Successfully Login!",
            data: {
                _id: findUser?._id,
                name: findUser?.name,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: token,
            }

        });

    } else {
        throw new Error("Invalid Credientials!")
    }

})


const getAllUser = asyncHandler(async (req, res) => {
    try {
        const data = await User.find();

        const length = data.length;
        res.status(200).json({
            message: "All Exists  User!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await User.findById(id)

        if (!data) {
            res.status(404).json({
                message: "User was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single User Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})


const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await User.findByIdAndDelete(id);
        if (!data) {
            // If data is null, that means the user was not found and not deleted.
            res.status(200).json({
                message: "User was not found !",
            });
        } else {
            // If data is not null, the user was found and deleted successfully.
            res.status(200).json({
                message: "User Data successfully Deleted!",
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the deletion process.
        throw new Error(error);
    }
});

const UpdateSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await User.findByIdAndUpdate(
            id,
            {
                name: req?.body?.name,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(404).json({
                message: "User was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "User Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});

// const getAllSiteUrl = asyncHandler(async (req, res) => {
//     const { siteUrl } = req.params; // Access the siteUrl parameter correctly from req.params
//     try {
//         const data = await Geo.find(siteUrl);
//         console.log(data)
//         // Extract siteUrls from the data and store them in an array
//         const siteUrlArray = data.map((item) => item.siteUrl);
//         console.log(siteUrlArray)
//         console.log(siteUrlArray[0])
//         console.log(siteUrlArray[1])
//         console.log(siteUrlArray[2])
//         console.log(siteUrlArray[3])
//         console.log(siteUrlArray[4])
//         const length = siteUrlArray.length;
//         res.status(200).json({
//             message: "All Site Url Data",
//             data: siteUrlArray, // Send the array of siteUrls instead of the full data
//             length
//         });
//     } catch (error) {
//         // Handle any errors here
//         console.error(error);
//         res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// });






module.exports = { CreateUser, getAllUser, getSingleUser, deleteUser, UpdateSingleUser, LoginUserCtrl }