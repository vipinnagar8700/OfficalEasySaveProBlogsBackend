const { generateToken } = require('../config/JwtToken');
const Admin = require('../models/AdminModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendMail = require('./EmailController');
require('dotenv/config')




const createAdmin = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await Admin.findOne({ email: email });
    if (!findUser) {
        const data = await Admin.create(req.body);
        res.status(200).json({
            message: " Admin Successfully Register!",
            data,
        });

    } else {
        res.json({
            message: "Admin Already Exists!",
            success: false
        })
        // throw new Error('User Already Exists!')
    }
})


const LoginAdminCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(email,password)
    const findUser = await Admin.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const token = generateToken(findUser._id);
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await Admin.findOneAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            message: "Admin Successfully Login!",
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



// const AdminLogin = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     // console.log(email, password)
//     const findUser = await Admin.findOne({ email });

//     // Check if the user with the provided email exists and the password matches
//     if (findUser && await findUser.isPasswordMatched(password)) {
//         // Check if the user's role is 'admin'
//         if (findUser.role === 'admin') {
//             const token = generateToken(findUser._id);
//             const refreshToken = generateRefreshToken(findUser._id);

//             // Update the refreshToken for the user
//             const updateUser = await Admin.findOneAndUpdate(
//                 { _id: findUser._id },
//                 { refreshToken: refreshToken },
//                 { new: true }
//             );

//             // Set the refreshToken as an HttpOnly cookie
//             res.cookie("refreshToken", refreshToken, {
//                 httpOnly: true,
//                 maxAge: 24 * 60 * 60 * 1000
//             });

//             res.status(200).json({
//                 message: "Admin Successfully Login!",
//                 data: {
//                     _id: findUser?._id,
//                     firstname: findUser?.firstname,
//                     lastname: findUser?.lastname,
//                     email: findUser?.email,
//                     mobile: findUser?.mobile,
//                     address: findUser?.address,
//                     token: token,
//                 }
//             });
//         } else {
//             // If the user's role is not 'admin', return an error
//             throw new Error("User is not an admin.");
//         }
//     } else {
//         throw new Error("Invalid Credentials!");
//     }
// });


const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    console.log(cookie)
    if (!cookie?.refreshToken) throw new Error("No refresh token on the cookies!");

    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await Admin.findOne({ refreshToken });
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

const LogoutAdmin = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token on the cookies!");

    const refreshToken = cookie.refreshToken;
    const user = await Admin.findOne({ refreshToken });
    if (user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.status(204).json({ message: 'Logout successful' });
    }

    await Admin.findOneAndUpdate(refreshToken, {
        refreshToken: ""
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });

    return res.status(204).json({ message: 'Logout successful' });
});



const getSingleAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Admin.findById(id);
        if (!data) {
            res.status(200).json({
                message: "Admin was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single Admin Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})


const UpdateSingleAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Admin.findByIdAndUpdate(
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
                message: "Admin was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Admin Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});




const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await Admin.findById(_id);
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
    const user = await Admin.findOne({ email }); // Use findOne with a query object
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
    createAdmin,
    LoginAdminCtrl,
    getSingleAdmin,
    UpdateSingleAdmin,
    LogoutAdmin,
    updatePassword, forgotpasswordtoken,
}