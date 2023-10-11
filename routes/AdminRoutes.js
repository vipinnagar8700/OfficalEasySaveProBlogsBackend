const express = require('express')
const { AdminLogin } = require('../controllers/SubadminController');
const { createAdmin, getSingleAdmin, UpdateSingleAdmin, LoginAdminCtrl, LogoutAdmin, updatePassword, forgotpasswordtoken } = require('../controllers/AdminController');
const { authenticateToken } = require('../config/JwtToken');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();

const multer = require('multer');
// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes


// router.post('/adminCreate', createAdmin);
router.get('/get-SingleAdmin/:id', authenticateToken, getSingleAdmin);
router.put('/Update-SingleAdmin/:id',upload.single('filee'), authenticateToken, UpdateSingleAdmin);
router.post('/adminLogin', LoginAdminCtrl);
router.get('/admin-logout', authenticateToken, LogoutAdmin);
router.put('/Update-password', updatePassword);
router.post('/reset-password', forgotpasswordtoken);

module.exports = router;