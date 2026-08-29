const express = require('express');
const router = express.Router();
const { getAllFaqs } = require('../controllers/faqController');

router.get('/', getAllFaqs);

module.exports = router;
