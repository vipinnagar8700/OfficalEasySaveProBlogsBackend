const Category = require('../models/CategoryModal');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');

const CreateCategory = (asyncHandler(async (req, res) => {
    try {
        const data = await Category.create(req.body)
        res.status(200).json({
            status: true,
            message: "Blog Category Successfully Added!",
            data,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}))

const getAllBlogsCategory = asyncHandler(async (req, res) => {
    try {
        const data = await Category.find();
        const length = data.length;
        res.status(200).json({
            message: "All Exists Blogs Category!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
})
const getSingleBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Category.findById(id);
        
        if (!data) {
            res.status(200).json({
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

module.exports = {CreateCategory,getAllBlogsCategory,deleteSingleBlogCategory,UpdateSingleBlogCategory,getSingleBlogCategory}