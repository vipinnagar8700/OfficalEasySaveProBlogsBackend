const Ads = require('../models/AdsModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const Admin = require('../models/AdminModal');
const Subadmin = require('../models/SubadminModel')
const mongoose = require('mongoose');
const Minio = require('minio');
const multer = require('multer');
const express = require('express')
const app = express();
// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const path = require('path');
const bucketName = process.env.BUCKET_NAME
console.log(bucketName, "1111111111111111111111111")
const bucketRegion = process.env.BUCKET_REGION
const accessKeyes = process.env.accessKeyId
const secretAccessKeyid = process.env.secretAccessKey
console.log(accessKeyes, "1111111111111111111111111")
console.log(secretAccessKeyid, "1111111111111111111111111")



const minioClient = new Minio.Client({
    endPoint: 's3.easysavepro.com', // Replace with your Minio server's endpoint
    port: 443, // Replace with the port number your Minio server uses
    useSSL: true, // Set to true if your Minio server uses SSL
    accessKey: 'i0y1sNJWgJ1meU7Cy8BH', // Replace with your Minio server access key
    secretKey: 'a022z4bMwafzh98bOW8SK9h46LSuiQdntlSPgATq' // Replace with your Minio server secret key
});






const CreateAds = asyncHandler(async (req, res) => {
    const { AdsName, AdsLocation, AdsUrl, createdBy } = req.body;
    const getAuthorType = async (createdBy) => {
        const admin = await Admin.findById(createdBy);
        if (admin) {
            return 'Admin';
        }
    
        const subadmin = await Subadmin.findById(createdBy);
        if (subadmin) {
            return 'Subadmin';
        }
    
        return null; // Author not found or not an Admin/Subadmin
    };
    const authorType = await getAuthorType(createdBy);
    
    if (!authorType) {
        return res.status(400).json({
            message: "Author not found or not an Admin/Subadmin. Please provide a valid author.",
            success: false
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: 'No image file provided',
            success: false
        });
    }

    const imageBuffer = req.file.buffer;
    const imageName = req.file.originalname;
    // const objectKey = imageName;
    // let contentType = 'application/octet-stream';

    // const fileExtension = path.extname(imageName).toLowerCase();
    // if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
    //     contentType = 'image/jpeg';
    // } else if (fileExtension === '.png') {
    //     contentType = 'image/png';
    // } else if (fileExtension === '.gif') {
    //     contentType = 'image/gif';
    // }

    try {
        // await minioClient.putObject('ads-api-easysavepro', objectKey, imageBuffer, imageBuffer.length, {
        //     'Content-Type': contentType,
        // });

        const adData = {
            AdsName,
            AdsLocation,
            AdsUrl,
            AdsImage: imageName,
            createdBy, // Use the author ID from the request
        };

        const createdAd = await Ads.create(adData);

        let message = '';
        if (authorType === 'Admin') {
            message = 'Admin successfully created an ad.';
        } else if (authorType === 'Subadmin') {
            message = 'Subadmin successfully created an ad.';
        }

        res.status(201).json({
            status: "success",
            message,
            data: createdAd,
        });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({
            message: 'Error creating ad.',
            success: false
        });
    }
});




const getAllAds = asyncHandler(async (req, res) => {
    try {
        const data = await Ads.find()
            .populate('createdBy.Admin')
            .populate('createdBy.Subadmin');

        const length = data.length;
        res.status(200).json({
            message: "All Existing Ads!",
            data,
            length,
            status: "success"
        });
    } catch (error) {
        throw new Error(error);
    }
});








const getSingleAds = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const data = await Ads.findById(id).populate('createdBy.Admin', 'createdBy.Subadmin');

        if (!data) {
            res.status(404).json({
                message: "Ads was not found!",
                status: 'false'
            });
        } else {
            res.status(200).json({
                message: "Single Ads Data!",
                data,
                status: "success"
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});




const deleteAds = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        // Check if the document exists in MongoDB
        const existingAds = await Ads.findById(id);

        if (!existingAds) {
            return res.status(404).json({
                message: "Ads not found!",
                status:"false"
            });
        }

        // Get the image object name from the existingAds document
        const objectName = existingAds.AdsImage;

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
        await Ads.findByIdAndDelete(id);

        res.status(200).json({
            message: "Ads and Image successfully deleted!",
            status:"success"
        });
    } catch (error) {
        console.error('Error deleting image or document:', error);
        res.status(500).json({ error: 'Error deleting image or document' });
    }
});



const UpdateAds = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        // Check if the ad with the given ID exists
        const existingAd = await Ads.findById(id);

        if (!existingAd) {
            return res.status(404).json({
                message: "Ads was not found!",
                status: "false"
            });
        }

        // Assuming you have configured multer and AWS SDK properly
        // ...

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
                .getObject(bucketName, existingAd.AdsImage)
                .then(() => true)
                .catch(() => false);

            if (existingImageExists) {
                // If the existing image exists in MinIO, delete it
                await minioClient.removeObject(bucketName, existingAd.AdsImage);
            }

            // Upload the new image to MinIO and set the content type
            await minioClient.putObject(bucketName, newImageKey, imageBuffer, {
                'Content-Type': contentType, // Set the content type based on the uploaded file's type
            });

            // Update the AdsImage field in the MongoDB document with the new image key
            existingAd.AdsImage = newImageKey;
        }

        // Update other ad data here if needed, including the image name in the database
        existingAd.AdsName = req.body.AdsName || existingAd.AdsName;
        existingAd.AdsLocation = req.body.AdsLocation || existingAd.AdsLocation;
        existingAd.AdsUrl = req.body.AdsUrl || existingAd.AdsUrl;

        // Save the updated ad data
        await existingAd.save();

        res.status(200).json({
            message: "Ads Data and Image successfully updated!",
            data: existingAd, // Return the updated ad data
            status: "success"
        });
    } catch (error) {
        // Handle any errors that occurred during the update process.
        console.error('Error updating ad:', error);
        res.status(500).json({
            message: 'Error updating ad.',
            status: "false"
        });
    }
});




module.exports = { CreateAds, getAllAds, deleteAds, UpdateAds, getSingleAds }