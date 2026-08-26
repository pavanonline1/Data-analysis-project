const { supabase } = require('../config/supabaseClient');
const { body } = require('express-validator');

const validateSignup = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').notEmpty().withMessage('Full name is required'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const signUp = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Create profile record in profiles table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            user_id: authData.user.id, 
            full_name: full_name,
            avatar_url: null 
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // We don't necessarily want to fail the whole signup if profile creation fails,
        // but it's better to be aware of it.
      }
    }

    res.status(201).json({ success: true, data: authData });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res) => {
  res.json({ success: true, data: req.user });
};

const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateSignup,
  validateLogin,
  signUp,
  signIn,
  getUser,
  logout
};

