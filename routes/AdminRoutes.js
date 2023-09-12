const express = require('express')
const { AdminLogin } = require('../controllers/SubadminController');
const { createAdmin, getSingleAdmin, UpdateSingleAdmin, LoginAdminCtrl, LogoutAdmin, updatePassword, forgotpasswordtoken } = require('../controllers/AdminController');
const { authenticateToken } = require('../config/JwtToken');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();


// All routes


// router.post('/adminCreate', createAdmin);
router.get('/get-SingleAdmin/:id', authenticateToken, getSingleAdmin);
router.put('/Update-SingleAdmin/:id', authenticateToken, UpdateSingleAdmin);
router.post('/adminLogin', LoginAdminCtrl);
router.get('/admin-logout', authenticateToken, LogoutAdmin);
router.put('/Update-password', updatePassword);
router.post('/reset-password', forgotpasswordtoken);

module.exports = router;