const express = require('express');
const router = express.Router();
const { validateContact, submitContact } = require('../controllers/contactController');
const validate = require('../middleware/validationMiddleware');

router.post('/', validateContact, validate, submitContact);

module.exports = router;
