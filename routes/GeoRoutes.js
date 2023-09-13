const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { CreateGeo, getSingleGeo, UpdateSingleGeo, deleteGeo, getAllGeo, getAllSiteUrl } = require('../controllers/GeoController');
const router = express.Router();


// All routes


router.post('/add-geo', authenticateToken, CreateGeo);
router.get('/get-geo/:id', authenticateToken, getSingleGeo);
router.put('/Update-geo/:id', authenticateToken, UpdateSingleGeo);
router.get('/all-geo', authenticateToken, getAllGeo);
router.delete('/delete-geo/:id', authenticateToken, deleteGeo);
router.get('/get-all-geo', getAllSiteUrl);




module.exports = router;