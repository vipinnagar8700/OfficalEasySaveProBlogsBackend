const express = require('express')
const { createUser, LoginUserCtrl, getAllUsers, getSingleUser, deleteSingleUser, UpdateSingleUser, BlockedUser, unBlockedUser, GetAllBlockedUser, GetAllunBlockedUser, handleRefreshToken, LogoutUser, updatePassword, forgotpasswordtoken } = require('../controllers/SubadminController');
const { authenticateToken } = require('../config/JwtToken');
const { isAdmin } = require('../middlewares/AuthMiddleware');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();

const multer = require('multer');
// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/register', upload.single('filee'), createUser);
router.post('/login', LoginUserCtrl);
router.get('/RefreshToken', handleRefreshToken);
router.get('/all-users',authenticateToken,  getAllUsers);
router.get('/get-SingleUsers/:id', authenticateToken, getSingleUser);
router.delete('/delete-SingleUsers/:id', authenticateToken, deleteSingleUser);
router.put('/Update-SingleUsers/:id', upload.single('filee'),authenticateToken, UpdateSingleUser);

router.put('/Blocked-SingleUsers/:id', authenticateToken, BlockedUser);
router.put('/Unblocked-SingleUsers/:id', authenticateToken, unBlockedUser);
router.get('/all-blocked-users', authenticateToken, GetAllBlockedUser);
router.get('/all-unblocked-users', authenticateToken, GetAllunBlockedUser);
router.get('/user-logout',authenticateToken, LogoutUser);
router.put('/Update-password', updatePassword);
router.post('/reset-password', forgotpasswordtoken);



module.exports = router;