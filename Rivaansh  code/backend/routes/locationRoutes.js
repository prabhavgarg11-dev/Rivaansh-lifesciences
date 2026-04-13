const express = require('express');
const router = express.Router();
const { saveLocation, getLocationHistory } = require('../controllers/locationController');

router.post('/save', saveLocation);
router.get('/history/:userId', getLocationHistory);

module.exports = router;
