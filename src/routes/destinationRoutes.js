const express = require('express');
const router = express.Router();
const { getAllDestinations } = require('../controllers/destinationController');

router.get('/', getAllDestinations);

module.exports = router;
