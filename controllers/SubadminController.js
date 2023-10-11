const { generateToken } = require('../config/JwtToken');
const Subadmin = require('../models/SubadminModel');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModal')
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



const createUser = async (req, res) => {
    const { firstname, lastname, email, mobile, password, address, createdBy } = req.body;

    try {
        const admin = await Admin.findById(createdBy);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" ,status:"false"});
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided',status:"false" });
        }
        const imageBuffer = req.file.buffer;
        // Extract the image name from the uploaded file
        const imageName = req.file.originalname;
        console.log(imageName)
        // Specify the object key as the image name
        const objectKey = imageName;
        console.log(objectKey)
        let contentType = 'application/octet-stream'; // Default content type
        const fileExtension = path.extname(imageName).toLowerCase();
        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (fileExtension === '.png') {
            contentType = 'image/png';
        } else if (fileExtension === '.gif') {
            contentType = 'image/gif';
        } // Add more file types as needed
    
        // Upload the image to MinIO and set the content type
        await minioClient.putObject('ads-api-easysavepro', objectKey, imageBuffer, imageBuffer.length, {
            'Content-Type': contentType,
        });
        const subadmin = await Subadmin.create({
            firstname,
            lastname,
            email,
            mobile,
            password,
            address,
            image:imageName,
            createdBy: admin._id
        });

        res.status(201).json({ message: "Subadmin created successfully", subadmin,status:"success" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message ,status:"false"});
    }
};


const LoginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(email,password)
    const findUser = await Subadmin.findOne({ email }).populate('createdBy');
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
                image:findUser?.image,
               createdBy:findUser?.createdBy, 
                token: token,

            },
            status:"success"

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
        return res.status(204).json({ message: 'Logout successful' ,status:"success"});
    }

    await Subadmin.findOneAndUpdate(refreshToken, {
        refreshToken: ""
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });

    return res.status(204).json({ message: 'Logout successful',status:"success" });
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const data = await Subadmin.find().populate('createdBy');
        const length = data.length;
        res.status(200).json({
            message: "All Exists Subadmin!",
            data,
            length,
            status:"success"
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
                status:"false"
            });
        } else {
            res.status(200).json({
                message: "Single Subadmin Data!",
                data,
                status:"success"
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
        // Check if the document exists in MongoDB
        const existingAds = await Subadmin.findById(id);

        if (!existingAds) {
            return res.status(404).json({
                message: "Subadmin not found!",
                status:"false"
            });
        }

        // Get the image object name from the existingAds document
        const objectName = existingAds.image;

        // Check if the image exists in S3 bucket
        const s3ObjectExists = await minioClient.getObject('ads-api-easysavepro', objectName)
            .then(() => true)
            .catch(() => false);

        if (s3ObjectExists) {
            // Delete the image from S3 bucket
            await minioClient.removeObject('ads-api-easysavepro', objectName);
        } else {
            // If the image does not exist in S3, you might want to handle this case accordingly.
            return res.status(404).json({
                message: "Image not found in S3 bucket!",
                status:"false",
            });
        }

        // Delete the document from MongoDB
        await Subadmin.findByIdAndDelete(id);

        res.status(200).json({
            message: "Subadmin and Image successfully deleted!",
            status:"success"
        });
    } catch (error) {
        console.error('Error deleting image or document:', error);
        res.status(500).json({ error: 'Error deleting image or document' });
    }
});

const UpdateSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const { firstname, lastname, email, mobile, address } = req.body;

        // Check if the user with the given ID exists
        const existingUser = await Subadmin.findById(id);

        if (!existingUser) {
            return res.status(404).json({
                message: "Subadmin was not found!",
                status: "false"
            });
        }

        // Check if a new image file was uploaded
        if (req.file) {
            const imageBuffer = req.file.buffer;
            const bucketName = 'ads-api-easysavepro'; // Replace with your MinIO bucket name

            // Set the content type based on the uploaded file's type
            const contentType = req.file.mimetype;

            // Generate a new unique image key or filename
            const newImageKey = `image_${Date.now()}.jpg`; // Customize the key as needed

            // If there was an existing image in the S3 bucket, delete it
            if (existingUser.image) {
                await minioClient.removeObject(bucketName, existingUser.image);
            }

            // Upload the new image to S3 and set the content type
            await minioClient.putObject(bucketName, newImageKey, imageBuffer, {
                'Content-Type': contentType,
            });

            // Update the image field in the user data with the new image key
            existingUser.image = newImageKey;
        }

        // Update other user data
        existingUser.firstname = firstname || existingUser.firstname;
        existingUser.lastname = lastname || existingUser.lastname;
        existingUser.email = email || existingUser.email;
        existingUser.mobile = mobile || existingUser.mobile;
        existingUser.address = address || existingUser.address;

        // Save the updated user data
        await existingUser.save();

        res.status(200).json({
            message: "Subadmin Data and Image successfully updated!",
            data: existingUser,
            status:"success" // Return the updated user data
        });
    } catch (error) {
        // Handle any errors that occurred during the update process.
        console.error('Error updating subadmin:', error);
        res.status(500).json({
            message: 'Error updating subadmin.',
            status:"false"
        });
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