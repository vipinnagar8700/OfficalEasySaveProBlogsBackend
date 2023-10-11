const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { CreateAds, getAllAds, getSingleAds, UpdateAds, deleteAds, Upload } = require('../controllers/AdsController');
// const { authenticateToken } = require('../config/JwtToken');
const router = express.Router();

const multer = require('multer');

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// All routes


router.post('/Create-Ads', upload.single('image'), CreateAds);
router.get('/all-Ads', getAllAds);
router.get('/get-SingleAds/:id', getSingleAds);
router.delete('/delete-Ads/:id', deleteAds);
router.put('/Update-Ads/:id', upload.single('filee'), UpdateAds);




module.exports = router;