const Category = require('../models/CategoryModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const Admin = require('../models/AdminModal');
const Subadmin = require('../models/SubadminModel')
const mongoose = require('mongoose');

const CreateCategory = (asyncHandler(async (req, res) => {
    const { title, createdBy } = req.body;
    // Function to determine the author type (Admin or Subadmin)
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

    // Check if the author is an Admin or Subadmin by their author
    const authorType = await getAuthorType(createdBy);
    if (!authorType) {
        return res.json({
            message: "Author not found or not an Admin/Subadmin. Please provide a valid author.",
            success: false
        });
    }

    // Now you can proceed to create the blog
    const findBlog = await Category.findOne({ title: title });
    if (!findBlog) {
        const data = await Category.create(req.body);
        res.json({
            status: "Success",
            message: "Blog Successfully Created!",
            data
        });
    } else {
        res.json({
            message: "Title already exists. Please try a different title name to add the blog.",
            success: false
        });
    }
}))

const getAllBlogsCategory = asyncHandler(async (req, res) => {
    try {
        const data = await Category.aggregate([
            {
                $lookup: {
                    from: 'admins',
                    localField: 'CreatedBy',
                    foreignField: '_id',
                    as: 'admin', // Specify the 'as' field
                },
            },
            {
                $lookup: {
                    from: 'subadmins',
                    localField: 'CreatedBy',
                    foreignField: '_id',
                    as: 'subadmin',
                },
            },
            {
                $addFields: {
                    CreatedBy: {
                        $cond: [
                            { $gt: [{ $size: '$admin' }, 0] },
                            { $arrayElemAt: ['$admin', 0] },
                            { $arrayElemAt: ['$subadmin', 0] },
                        ],
                    },
                },
            },
            {
                $unset: ['admin', 'subadmin'],
            },
        ]);

        const length = data.length;
        res.status(200).json({
            message: "All Exists Blogs Category!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getSingleBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Category.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'admins', // Replace with the actual collection name for Admin
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'CreatedByAdmin',
                },
            },
            {
                $lookup: {
                    from: 'subadmins', // Replace with the actual collection name for Subadmin
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'CreatedBySubadmin',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    createdBy: {
                        $concatArrays: ['$CreatedByAdmin', '$CreatedBySubadmin'],
                    },
                },
            },
            {
                $unwind: '$createdBy',
            },
            {
                $replaceRoot: { newRoot: '$$ROOT' },
            },
        ]);


        if (!data || data.length === 0) {
            res.status(404).json({
                message: "Blog Category was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single Blog Category Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})


const deleteSingleBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Category.findByIdAndDelete(id);
        if (!data) {
            // If data is null, that means the user was not found and not deleted.
            res.status(200).json({
                message: "Blog Category was not found !",
            });
        } else {
            // If data is not null, the user was found and deleted successfully.
            res.status(200).json({
                message: "Blog Category Data successfully Deleted!",
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the deletion process.
        throw new Error(error);
    }
});

const UpdateSingleBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Category.findByIdAndUpdate(
            id,
            {
                title: req?.body?.title,

            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(200).json({
                message: "Blog Category was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Blog Category Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
        throw new Error(error);
    }
});

module.exports = { CreateCategory, getAllBlogsCategory, deleteSingleBlogCategory, UpdateSingleBlogCategory, getSingleBlogCategory }