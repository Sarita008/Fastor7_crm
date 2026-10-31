const express = require('express');
const router = express.Router();
const { getRestaurants } = require('../controllers/fastorController');

// GET /api/fastor/restaurants
router.get('/restaurants', getRestaurants);

module.exports = router;

