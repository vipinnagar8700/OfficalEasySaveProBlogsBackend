const express = require('express')
const { createUser, LoginUserCtrl, getAllUsers, getSingleUser, deleteSingleUser, UpdateSingleUser, BlockedUser, unBlockedUser, GetAllBlockedUser, GetAllunBlockedUser, handleRefreshToken, LogoutUser, updatePassword, forgotpasswordtoken } = require('../controllers/SubadminController');
const { authenticateToken } = require('../config/JwtToken');
const { isAdmin } = require('../middlewares/AuthMiddleware');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();


// All routes


router.post('/register', createUser);
router.post('/login', LoginUserCtrl);
router.get('/RefreshToken', handleRefreshToken);
router.get('/all-users',  getAllUsers);
router.get('/get-SingleUsers/:id', authenticateToken, getSingleUser);
router.delete('/delete-SingleUsers/:id', authenticateToken, deleteSingleUser);
router.put('/Update-SingleUsers/:id', authenticateToken, UpdateSingleUser);

router.put('/Blocked-SingleUsers/:id', authenticateToken, BlockedUser);
router.put('/Unblocked-SingleUsers/:id', authenticateToken, unBlockedUser);
router.get('/all-blocked-users', authenticateToken, GetAllBlockedUser);
router.get('/all-unblocked-users', authenticateToken, GetAllunBlockedUser);
router.get('/user-logout', LogoutUser);
router.put('/Update-password', authenticateToken, updatePassword);
router.post('/reset-password', forgotpasswordtoken);



module.exports = router;