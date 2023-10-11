const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { createBlog, getAllBlogs, getSingleBlog, deleteSingleBlog, UpdateSingleBlog, likeBlog, DislikeBlog } = require('../controllers/BlogController');
const { CreateCategory, UpdateSingleBlogCategory, deleteSingleBlogCategory, getSingleBlogCategory, getAllBlogsCategory } = require('../controllers/CategoryController');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();
const multer = require('multer');

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes


router.post('/Add-Blog',upload.single('filee'),authenticateToken, createBlog);
router.get('/all-blogs',authenticateToken, getAllBlogs);
router.get('/get-SingleBlog/:id',authenticateToken, getSingleBlog);
router.delete('/delete-SingleBlog/:id',authenticateToken, deleteSingleBlog);
router.put('/Update-SingleBlog/:id',upload.single('filee'),authenticateToken, UpdateSingleBlog);
router.post('/Add-Blog-Category',authenticateToken, CreateCategory);
router.get('/all-blogsCategory',authenticateToken, getAllBlogsCategory);
router.get('/get-SingleBlogCategory/:id',authenticateToken, getSingleBlogCategory);
router.delete('/delete-SingleBlogCategory/:id',authenticateToken, deleteSingleBlogCategory);
router.put('/Update-SingleBlogCategory/:id',authenticateToken, UpdateSingleBlogCategory);

// router.put('/likes',  likeBlog);
// router.put('/dislikes',  DislikeBlog);


module.exports = router;