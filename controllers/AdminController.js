const { generateToken } = require('../config/JwtToken');
const Admin = require('../models/AdminModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendMail = require('./EmailController');
require('dotenv/config')


const Minio = require('minio')
const path = require('path')

const minioClient = new Minio.Client({
    endPoint: 's3.easysavepro.com', // Replace with your Minio server's endpoint
    port: 443, // Replace with the port number your Minio server uses
    useSSL: true, // Set to true if your Minio server uses SSL
    accessKey: 'i0y1sNJWgJ1meU7Cy8BH', // Replace with your Minio server access key
    secretKey: 'a022z4bMwafzh98bOW8SK9h46LSuiQdntlSPgATq' // Replace with your Minio server secret key
});

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
                image: findUser?.image,
                token: token,
            },
            status: "success"

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

const LogoutAdmin = async (req, res) => {
    try {
        // const refreshToken = req.cookies.refreshToken;
        // if (!refreshToken) {
        //     return res.status(400).json({ message: "No refresh token in cookies" });
        // }

        // Clear the refreshToken in the database (if necessary)
        // You should have a corresponding field for refreshToken in your schema
        // Example with Mongoose:
        // await Admin.findOneAndUpdate({ refreshToken }, { refreshToken: "" });

        // Clear the refreshToken cookie
        // res.clearCookie('refreshToken', {
        //     httpOnly: true,
        //     secure: true,
        // });

         res.status(200).json({ message: 'Logout successful', status: 'success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};





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
    validateMongoDbId(id);

    try {
        const { firstname, lastname, email, mobile, address } = req.body;

        // Check if the admin with the given ID exists
        const existingAdmin = await Admin.findById(id);

        if (!existingAdmin) {
            return res.status(404).json({
                message: "Admin was not found!",
                status: "false"
            });
        }

        // Check if a new image file was uploaded
        if (req.file) {
            const imageBuffer = req.file.buffer;
            const bucketName = 'ads-api-easysavepro'; // Replace with your bucket name

            // Set the content type based on the uploaded file's type
            const contentType = req.file.mimetype;

            // Generate a new unique image key or filename
            const newImageKey = `image_${Date.now()}.jpg`; // Customize the key as needed

            // Check if the existing image exists in MinIO
            const existingImageExists = await minioClient
                .getObject(bucketName, existingAdmin.image)
                .then(() => true)
                .catch(() => false);

            if (existingImageExists) {
                // If the existing image exists in MinIO, delete it
                await minioClient.removeObject(bucketName, existingAdmin.image);
            }

            // Upload the new image to MinIO and set the content type
            await minioClient.putObject(bucketName, newImageKey, imageBuffer, {
                'Content-Type': contentType,
            });

            // Update the image field in the admin data with the new image key
            existingAdmin.image = newImageKey;
        }

        // Update other admin data
        existingAdmin.firstname = firstname || existingAdmin.firstname;
        existingAdmin.lastname = lastname || existingAdmin.lastname;
        existingAdmin.email = email || existingAdmin.email;
        existingAdmin.mobile = mobile || existingAdmin.mobile;
        existingAdmin.address = address || existingAdmin.address;

        // Save the updated admin data
        await existingAdmin.save();

        res.status(200).json({
            message: "Admin Data and Image successfully updated!",
            data: existingAdmin, // Return the updated admin data
            status: "success"
        });
    } catch (error) {
        // Handle any errors that occurred during the update process.
        console.error('Error updating admin:', error);
        res.status(500).json({
            message: 'Error updating admin.',
            status: "false"
        });
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