const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { createBlog, getAllBlogs, getSingleBlog, deleteSingleBlog, UpdateSingleBlog, likeBlog, DislikeBlog } = require('../controllers/BlogController');
const { CreateCategory, UpdateSingleBlogCategory, deleteSingleBlogCategory, getSingleBlogCategory, getAllBlogsCategory } = require('../controllers/CategoryController');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();


// All routes


router.post('/Add-Blog', createBlog);
router.get('/all-blogs', getAllBlogs);
router.get('/get-SingleBlog/:id', getSingleBlog);
router.delete('/delete-SingleBlog/:id', deleteSingleBlog);
router.put('/Update-SingleBlog/:id', UpdateSingleBlog);
router.post('/Add-Blog-Category', CreateCategory);
router.get('/all-blogsCategory', getAllBlogsCategory);
router.get('/get-SingleBlogCategory/:id', getSingleBlogCategory);
router.delete('/delete-SingleBlogCategory/:id', deleteSingleBlogCategory);
router.put('/Update-SingleBlogCategory/:id', UpdateSingleBlogCategory);

// router.put('/likes',  likeBlog);
// router.put('/dislikes',  DislikeBlog);


module.exports = router;