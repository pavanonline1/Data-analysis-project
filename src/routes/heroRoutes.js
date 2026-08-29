const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');

router.get('/', heroController.getAllHeroSlides);

module.exports = router;
