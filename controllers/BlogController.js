const Blog = require('../models/BlogModal')
const Subadmin = require('../models/SubadminModel')
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const Category = require('../models/CategoryModal')



const createBlog = asyncHandler(async (req, res) => {
    const title = req.body.title;
    const findBlog = await Blog.findOne({ title: title });
    if (!findBlog) {
        const data = await Blog.create(req.body);
        res.json({
            status: "Success",
            message: "Blog Successfully Created!",
            data
        })
    } else {
        res.json({
            message: "title Already exists Please try different title name to add Blog!",
            success: false
        })
    }

})


const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const data = await Blog.find();
        const length = data.length;
        res.status(200).json({
            message: "All Exists Blogs!",
            data,
            length
        });
    } catch (error) {
        throw new Error(error);
    }
})
const getSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const data = await Blog.findById(id).populate("likes").populate("dislikes");
        const GetBlogUpdateData = await Blog.findByIdAndUpdate(id, {
            $inc: { numViews: 1 },
        }, { new: true });
        if (!data) {
            res.status(200).json({
                message: "Blog was not found !",
            });
        } else {
            res.status(200).json({
                message: "Single Blog Data!",
                data,
            });
        }

    } catch (error) {
        throw new Error(error);
    }
})
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
    validateMongoDbId(id)
    try {
        const data = await Blog.findByIdAndUpdate(
            id,
            {
                title: req?.body?.title,
                description: req?.body?.description,
                category: req?.body?.category,
                numViews: req?.body?.numViews,
                address: req?.body?.address,
                image: req?.body?.image,
                author: req?.body?.author,
            },
            { new: true }
        );

        if (data === null) {
            // If data is null, that means the user was not found in the database.
            res.status(200).json({
                message: "Blog was not found!",
            });
        } else {
            // If data is not null, the user was found and updated successfully.
            res.status(200).json({
                message: "Blog Data successfully Updated!",
                data,
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the update process.
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