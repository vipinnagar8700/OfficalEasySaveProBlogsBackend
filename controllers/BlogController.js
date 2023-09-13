const Blog = require('../models/BlogModal');
const Subadmin = require('../models/SubadminModel');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const Category = require('../models/CategoryModal');
const Admin = require('../models/AdminModal');
const mongoose = require('mongoose');

const createBlog = asyncHandler(async (req, res) => {
    const { title, categoryType, author } = req.body;

    // Check if the category with the provided categoryId exists
    const existingCategory = await Category.findById(categoryType);
    if (!existingCategory) {
        return res.json({
            message: "Category does not exist. Please choose a valid category.",
            success: false
        });
    }

    // Function to determine the author type (Admin or Subadmin)
    const getAuthorType = async (authorId) => {
        const admin = await Admin.findById(authorId);
        if (admin) {
            return 'Admin';
        }

        const subadmin = await Subadmin.findById(authorId);
        if (subadmin) {
            return 'Subadmin';
        }

        return null; // Author not found or not an Admin/Subadmin
    };

    // Check if the author is an Admin or Subadmin by their author
    const authorType = await getAuthorType(author);
    if (!authorType) {
        return res.json({
            message: "Author not found or not an Admin/Subadmin. Please provide a valid author.",
            success: false
        });
    }

    // Now you can proceed to create the blog
    const findBlog = await Blog.findOne({ title: title });
    if (!findBlog) {
        const data = await Blog.create(req.body);
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
});


// Function to check if the author is an Admin or Subadmin by their author
async function getAuthorType(author) {
    try {
        // $varIterate
        // cache
        // if(cache.geoIterate)
        // { if($varIterate>geoDataArray){$varIterate = -1} $varIterate ++  }
        // else $varIterate=0
        // 1. all four site
        // 2. store bove data in array
        // 3. geoData[$varIterate]
        // 4. request -> geoData[$varIterate]
        // 5. Pass our API
        const admin = await Admin.findById(author);
        const subadmin = await Subadmin.findById(author);

        if (admin) {
            return 'Admin';
        } else if (subadmin) {
            return 'Subadmin';
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error finding author:", error);
        return null;
    }
}




const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const data = await Blog.aggregate([
            {
                $lookup: {
                    from: 'admins', // Replace with the actual collection name for Admin
                    localField: 'author',
                    foreignField: '_id',
                    as: 'admin',
                },
            },
            {
                $lookup: {
                    from: 'subadmins', // Replace with the actual collection name for Subadmin
                    localField: 'author',
                    foreignField: '_id',
                    as: 'subadmin',
                },
            },
            {
                $addFields: {
                    author: {
                        $cond: [
                            { $gt: [{ $size: '$admin' }, 0] }, // Check if 'admin' array has elements
                            { $arrayElemAt: ['$admin', 0] }, // If true, select the Admin
                            { $arrayElemAt: ['$subadmin', 0] }, // If false, select the Subadmin
                        ],
                    },
                },
            },
            {
                $unset: ['admin', 'subadmin'], // Remove unnecessary fields
            },
            {
                $lookup: {
                    from: 'categories', // Replace with the actual collection name for Category
                    localField: 'categoryType',
                    foreignField: '_id',
                    as: 'categoryType',
                },
            },
        ]);

        const length = data.length;

        res.status(200).json({
            message: "All Existing Blogs!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
});


const getSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const blog = await Blog.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'admins', // Replace with the actual collection name for Admin
                    localField: 'author',
                    foreignField: '_id',
                    as: 'adminAuthors',
                },
            },
            {
                $lookup: {
                    from: 'subadmins', // Replace with the actual collection name for Subadmin
                    localField: 'author',
                    foreignField: '_id',
                    as: 'subadminAuthors',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    categoryType: 1,
                    numViews: 1,
                    image: 1,
                    author: {
                        $concatArrays: ['$adminAuthors', '$subadminAuthors'],
                    },
                },
            },
            {
                $unwind: '$author',
            },
            {
                $replaceRoot: { newRoot: '$$ROOT' },
            },
        ]);

        if (!blog || blog.length === 0) {
            res.status(404).json({
                message: "Blog was not found!",
            });
        } else {
            res.status(200).json({
                message: "Single Blog Data!",
                data: blog[0],
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});


const deleteSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Blog.findByIdAndDelete(id);
        if (!data) {
            // If data is null, that means the user was not found and not deleted.
            res.status(200).json({
                message: "Blog was not found !",
            });
        } else {
            // If data is not null, the user was found and deleted successfully.
            res.status(200).json({
                message: "Blog Data successfully Deleted!",
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the deletion process.
        throw new Error(error);
    }
});

const UpdateSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const { title, description, category, numViews, address, image, author } = req.body;

        // Convert the author array to ObjectId values
        const authorIds = new mongoose.Types.ObjectId(author);

        const data = await Blog.findByIdAndUpdate(
            id,
            {
                title,
                description,
                category,
                numViews,
                address,
                image,
                author: authorIds, // Use the array of ObjectId values
            },
            { new: true }
        );

        if (data === null) {
            res.status(404).json({
                message: "Blog was not found!",
            });
        } else {
            res.status(200).json({
                message: "Blog Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});


// const likeBlog = asyncHandler(async (req, res) => {
//     const { BlogId } = req.body;
//     console.log(BlogId)
//     validateMongoDbId(BlogId);
//     const blog = await Blog.findById(BlogId);
//     // now i am finding the user that is login

//     const loginSubadminId = req?.Subadmin?._id;
//     console.log(loginSubadminId)
//     // find liked Blogs
//     const isLiked = Blog?.isLiked;
//     console.log(isLiked)
//     // Disliked
//     const AlreadyDisliked = Blog?.dislikes?.find(
//         (SubadminId) => Subadmin?.toString() === loginSubadminId?.toString()
//     );
//     if (AlreadyDisliked) {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { dislikes: loginSubadminId },
//             isDisliked: false
//         }, {
//             new: true
//         });
//         res.json(blog)
//     }
//     if (isLiked) {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { likes: loginSubadminId },
//             isLiked: false
//         }, {
//             new: true
//         });
//         res.json(blog)
//     } else {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { likes: loginSubadminId },
//             isLiked: true
//         }, {
//             new: true
//         });
//         res.json(blog)
//     }
// })
// const DislikeBlog = asyncHandler(async (req, res) => {
//     const { BlogId } = req.body;
//     console.log(BlogId)
//     validateMongoDbId(BlogId);
//     const blog = await Blog.findById(BlogId);
//     // now i am finding the user that is login

//     const loginSubadminId = req?.Sudadmin?._id;
//     // find liked Blogs
//     const isDisliked = Blog?.isDisliked;
//     // Disliked
//     const Alreadyliked = Blog?.likes?.find(
//         (SubadminId) => Subadmin?.toString() === loginSubadminId?.toString()
//     );
//     if (Alreadyliked) {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { likes: loginSubadminId },
//             isLiked: false
//         }, {
//             new: true
//         });
//         res.json(blog)
//     }
//     if (isDisliked) {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { dislikes: loginSubadminId },
//             isDisliked: false
//         }, {
//             new: true
//         });
//         res.json(blog)
//     } else {
//         const blog = await Blog.findByIdAndUpdate(BlogId, {
//             $pull: { dislikes: loginSubadminId },
//             isDisliked: true
//         }, {
//             new: true
//         });
//         res.json(blog)
//     }
// })

// , likeBlog, DislikeBlog
module.exports = { createBlog, getAllBlogs, getSingleBlog, deleteSingleBlog, UpdateSingleBlog }