const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { CreateUser, getSingleUser,LoginUserCtrl, UpdateSingleUser, getAllUser, deleteUser } = require('../controllers/UserController');
const router = express.Router();


// All routes


router.post('/add-User', authenticateToken, CreateUser);
router.post('/UserLogin', authenticateToken, LoginUserCtrl);
router.get('/get-User/:id', authenticateToken, getSingleUser);
router.put('/Update-User/:id', authenticateToken, UpdateSingleUser);
router.get('/all-User', authenticateToken, getAllUser);
router.delete('/delete-User/:id', authenticateToken, deleteUser);
// router.get('/get-all-User', authenticateToken, getAllSiteUrl);

module.exports = router;