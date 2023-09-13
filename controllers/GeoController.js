const Geo = require('../models/GeoModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const NodeCache = require("node-cache");
const siteUrlCache = new NodeCache({ stdTTL: 60 * 60 });
const User = require('../models/UserModal')

const CreateGeo = (asyncHandler(async (req, res) => {
    const { siteName, siteUrl, apiKey, apiUrl } = req.body;
    // Function to determine the author type (Admin or Subadmin)
    try {
        const data = await Geo.create({
            siteName, siteUrl, apiKey, apiUrl
        });
        res.status(200).json({
            status: "Success",
            message: "Geo Successfully Created!",
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

    // Check if the author is an Admin or Subadmin by their author
    // Now you can proceed to create the blog

}))

const getAllGeo = asyncHandler(async (req, res) => {
    try {
        const data = await Geo.find();

        const length = data.length;
        res.status(200).json({
            message: "All Exists  Geo!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getSingleGeo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Geo.findById(id)

        if (!data) {
            res.status(404).json({
                message: "Geo was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single Geo Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})


const deleteGeo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Geo.findByIdAndDelete(id);
        if (!data) {
            // If data is null, that means the user was not found and not deleted.
            res.status(200).json({
                message: "Geo was not found !",
            });
        } else {
            // If data is not null, the user was found and deleted successfully.
            res.status(200).json({
                message: "Geo Data successfully Deleted!",
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the deletion process.
        throw new Error(error);
    }
});

const UpdateSingleGeo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Geo.findByIdAndUpdate(
            id,
            {
                siteName: req?.body?.siteName,
                siteUrl: req?.body?.siteUrl,
                apiKey: req?.body?.apiKey,
                apiUrl: req?.body?.apiUrl,
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(404).json({
                message: "Geo was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Geo Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});

const getAllSiteUrl = asyncHandler(async (req, res) => {
    const { siteUrl } = req.params; // Access the siteUrl parameter correctly from req.params
    try {
        const data = await Geo.find(siteUrl);
        console.log(data);

        // Initialize an array to store siteUrlArrays for each user
        // Initialize an array to store objects with custom keys
        const customResponseArray = [];

        for (let i = 0; i < data.length; i++) {
            // Extract the siteUrl property from each object
            const siteUrl = data[i].siteUrl;

            // Create an object with custom keys
            const customObject = {
                [i]: siteUrl,
            };

            // Push the custom object into the customResponseArray
            customResponseArray.push(customObject);
        }

        res.status(200).json({
            message: "All Site Url"
            , customResponseArray
        });
    } catch (error) {
        // Handle any errors here
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }

});



module.exports = { CreateGeo, getAllGeo, getSingleGeo, deleteGeo, UpdateSingleGeo, getAllSiteUrl }