const { supabase } = require('../config/supabaseClient');
const { body } = require('express-validator');

const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);

    if (error) throw error;
    
    res.status(201).json({ success: true, data: 'Message received. We will get back to you soon!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateContact,
  submitContact
};
