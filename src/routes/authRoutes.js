const express = require('express');
const router = express.Router();
const { 
  validateSignup, 
  validateLogin, 
  signUp, 
  signIn, 
  getUser,
  logout
} = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', validateSignup, validate, signUp);
router.post('/login', validateLogin, validate, signIn);
router.get('/user', authMiddleware, getUser);
router.post('/logout', logout);

module.exports = router;

