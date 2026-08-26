const express = require('express');
const router = express.Router();
const { getAllTestimonials } = require('../controllers/testimonialController');

router.get('/', getAllTestimonials);

module.exports = router;
