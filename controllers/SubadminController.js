const { generateToken } = require('../config/JwtToken');
const Subadmin = require('../models/SubadminModel');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModal')
const sendMail = require('./EmailController');
require('dotenv/config')




const createUser = async (req, res) => {
    const { firstname, lastname, email, mobile, password, address, createdBy } = req.body;

    try {
        const admin = await Admin.findById(createdBy);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const subadmin = await Subadmin.create({
            firstname,
            lastname,
            email,
            mobile,
            password,
            address,
            createdBy: admin._id
        });

        res.status(201).json({ message: "Subadmin created successfully", subadmin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const LoginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(email,password)
    const findUser = await Subadmin.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const token = generateToken(findUser._id);
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await Subadmin.findOneAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            message: "Subadmin Successfully Login!",
            data: {
                _id: findUser?._id,
                firstname: findUser?.firstname,
                lastname: findUser?.lastname,
                email: findUser?.email,
                mobile: findUser?.mobile,
                address: findUser?.address,
                token: token,
            }

        });

    } else {
        throw new Error("Invalid Credientials!")
    }

})






const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    console.log(cookie)
    if (!cookie?.refreshToken) throw new Error("No refresh token on the cookies!");

    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await Subadmin.findOne({ refreshToken });
    if (!user) throw new Error("No refresh token found in DB or not Matched with anyone!")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        console.log(decoded)
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    })

})

const LogoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token on the cookies!");

    const refreshToken = cookie.refreshToken;
    const user = await Subadmin.findOne({ refreshToken });
    if (user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.status(204).json({ message: 'Logout successful' });
    }

    await Subadmin.findOneAndUpdate(refreshToken, {
        refreshToken: ""
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });

    return res.status(204).json({ message: 'Logout successful' });
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const data = await Subadmin.find().populate('createdBy');
        const length = data.length;
        res.status(200).json({
            message: "All Exists Subadmin!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
})

const getSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Subadmin.findById(id).populate('createdBy');
        if (!data) {
            res.status(404).json({
                message: "Subadmin was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single Subadmin Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})
const deleteSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Subadmin.findByIdAndDelete(id);
        if (!data) {
            // If data is null, that means the user was not found and not deleted.
            res.status(200).json({
                message: "Subadmin was not found !",
            });
        } else {
            // If data is not null, the user was found and deleted successfully.
            res.status(200).json({
                message: "Subadmin Data successfully Deleted!",
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
        const data = await Subadmin.findByIdAndUpdate(
            id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
                address: req?.body?.address,
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(200).json({
                message: "Subadmin was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Subadmin Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});

const BlockedUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Subadmin.findByIdAndUpdate(
            id,
            {
                isBlocked: true
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(200).json({
                message: "Subadmin was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Subadmin successfully Blocked!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});
const unBlockedUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Subadmin.findByIdAndUpdate(
            id,
            {
                isBlocked: false
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(200).json({
                message: "Subadmin was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Subadmin  successfully UnBlocked!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});

const GetAllBlockedUser = asyncHandler(async (req, res) => {
    try {
        const data = await Subadmin.find({
            isBlocked: true
        });
        const length = data.length;
        res.status(200).json({
            message: "All Exists  Blocked Subadmin!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
})

const GetAllunBlockedUser = asyncHandler(async (req, res) => {
    try {
        const data = await Subadmin.find({
            isBlocked: false
        });
        const length = data.length;
        res.status(200).json({
            message: "All Exists  unBlocked Subadmin!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
})

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await Subadmin.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword)

    } else {
        res.json(user)
    }

})

const forgotpasswordtoken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await Subadmin.findOne({ email }); // Use findOne with a query object
    if (!user) throw new Error("User not found with this email!");

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hii, please follow the link to reset your password. This link is valid for 10 minutes from now. <a href="http://localhost:3000/api/user/reset-password/${token}">Click me</a>`;
        const data = {
            to: email,
            text: "hey User",
            subject: "forgot Password link",
            html: resetURL,
        };
        sendMail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    createUser,
    LoginUserCtrl,
    getAllUsers,
    getSingleUser,
    deleteSingleUser,
    UpdateSingleUser,
    BlockedUser,
    unBlockedUser,
    GetAllBlockedUser,
    GetAllunBlockedUser, handleRefreshToken, LogoutUser,
    updatePassword, forgotpasswordtoken,
}