const express = require('express');
const router = express.Router();
const { getAllTours, getTourById } = require('../controllers/tourController');

router.get('/', getAllTours);
router.get('/:id', getTourById);

module.exports = router;
