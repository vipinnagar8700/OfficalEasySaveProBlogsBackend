const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { createBlog, getAllBlogs, getSingleBlog, deleteSingleBlog, UpdateSingleBlog, likeBlog, DislikeBlog } = require('../controllers/BlogController');
const { CreateCategory, UpdateSingleBlogCategory, deleteSingleBlogCategory, getSingleBlogCategory, getAllBlogsCategory } = require('../controllers/CategoryController');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();


// All routes


router.post('/Add-Blog',authenticateToken, createBlog);
router.get('/all-blogs',authenticateToken, getAllBlogs);
router.get('/get-SingleBlog/:id',authenticateToken, getSingleBlog);
router.delete('/delete-SingleBlog/:id',authenticateToken, deleteSingleBlog);
router.put('/Update-SingleBlog/:id',authenticateToken, UpdateSingleBlog);
router.post('/Add-Blog-Category',authenticateToken, CreateCategory);
router.get('/all-blogsCategory',authenticateToken, getAllBlogsCategory);
router.get('/get-SingleBlogCategory/:id',authenticateToken, getSingleBlogCategory);
router.delete('/delete-SingleBlogCategory/:id',authenticateToken, deleteSingleBlogCategory);
router.put('/Update-SingleBlogCategory/:id',authenticateToken, UpdateSingleBlogCategory);

// router.put('/likes',  likeBlog);
// router.put('/dislikes',  DislikeBlog);


module.exports = router;