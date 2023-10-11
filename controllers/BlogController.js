const Blog = require('../models/BlogModal');
const Subadmin = require('../models/SubadminModel');
const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validationmongodb');
const Category = require('../models/CategoryModal');
const Admin = require('../models/AdminModal');
const mongoose = require('mongoose');
const Minio = require('minio')
const path = require('path')

const minioClient = new Minio.Client({
    endPoint: 's3.easysavepro.com', // Replace with your Minio server's endpoint
    port: 443, // Replace with the port number your Minio server uses
    useSSL: true, // Set to true if your Minio server uses SSL
    accessKey: 'i0y1sNJWgJ1meU7Cy8BH', // Replace with your Minio server access key
    secretKey: 'a022z4bMwafzh98bOW8SK9h46LSuiQdntlSPgATq' // Replace with your Minio server secret key
});


const createBlog = asyncHandler(async (req, res) => {
    const { title, categoryType, author,description,numViews } = req.body;

    // Check if the category with the provided categoryId exists
    const existingCategory = await Category.findById(categoryType);
    if (!existingCategory) {
        return res.json({
            message: "Category does not exist. Please choose a valid category.",
            success: false
        });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
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
        const blogData = {
            title: title,
            categoryType: categoryType,
            description:description,
            numViews:numViews,
            author: author,
            image: imageName, // Store the image name in the database
        };

        const data = await Blog.create(blogData);
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
            length,status:"success"
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
                status:"success"
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
        // Check if the document exists in MongoDB
        const existingAds = await Blog.findById(id);

        if (!existingAds) {
            return res.status(404).json({
                message: "Ads not found!",
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
        await Blog.findByIdAndDelete(id);

        res.status(200).json({
            message: "Blog and Image successfully deleted!",
            status:"success"
        });
    } catch (error) {
        console.error('Error deleting image or document:', error);
        res.status(500).json({ error: 'Error deleting image or document' });
    }
});


const UpdateSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const { title, description, category, numViews, address } = req.body;

        // Check if the blog with the given ID exists
        const existingBlog = await Blog.findById(id);

        if (!existingBlog) {
            return res.status(404).json({
                message: "Blog was not found!",
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

            // // Check if the existing image exists in MinIO
            // const existingImageExists = await minioClient
            //     .getObject(bucketName, existingBlog.image)
            //     .then(() => true)
            //     .catch(() => false);

            if (existingBlog.image) {
                await minioClient.removeObject(bucketName, existingBlog.image);
            }

            // Upload the new image to MinIO and set the content type
            await minioClient.putObject(bucketName, newImageKey, imageBuffer, {
                'Content-Type': contentType,
            });

            // Update the image field in the blog data with the new image key
            existingBlog.image = newImageKey;
        }

        // Convert the author field to ObjectId using mongoose.Types.ObjectId
        // const authorId = mongoose.Types.ObjectId(author);

        // Update the blog data
        existingBlog.title = title || existingBlog.title;
        existingBlog.description = description || existingBlog.description;
        existingBlog.category = category || existingBlog.category;
        existingBlog.numViews = numViews || existingBlog.numViews;
        existingBlog.address = address || existingBlog.address;
        // existingBlog.author = authorId;
        // Save the updated blog data
        await existingBlog.save();

        res.status(200).json({
            message: "Blog Data and Image successfully updated!",
            data: existingBlog, // Return the updated blog data
            status: "success"
        });
    } catch (error) {
        // Handle any errors that occurred during the update process.
        console.error('Error updating blog:', error);
        res.status(500).json({
            message: 'Error updating blog.',
            status: "false"
        });
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