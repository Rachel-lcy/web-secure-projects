// routes/authRoutes.js
import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sanitizeEmail, sanitizeName } from '../utils/validation.js';

const router = Router();


router.get('/register', (req, res) => {
  res.render('register', { error: null });
});


router.post('/register', async (req, res) => {
  try {

    const name = sanitizeName(req.body.name);
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');


    if (!/^[A-Za-z\s]{3,50}$/.test(name)) {
      return res.status(400).render('register', { error: 'Name must be 3–50 alphabetic characters' });
    }
    if (!email) {
      return res.status(400).render('register', { error: 'Invalid email address' });
    }
    if (password.length < 8) {
      return res.status(400).render('register', { error: 'Password must be at least 8 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).render('register', { error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const u = new User({ email, name, password: hash });
    await u.save();


    return res.redirect('/auth/login');
  } catch (err) {

    console.error('Register error:', err?.code, err?.message, err);

    if (err && err.code === 11000) {
      return res.status(409).render('register', { error: 'Email already registered' });
    }
    return res.status(500).render('register', { error: 'Registration failed' });
  }
});


router.get('/login', (req, res) => {
  res.render('login', { error: null });
});


router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/auth/login',
    successRedirect: '/dashboard',
  })
);


router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/auth/login');
  });
});

export default router;
