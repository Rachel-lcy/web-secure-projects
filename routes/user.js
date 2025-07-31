
import { Router } from 'express';
import User from '../models/User.js';
import { isAuthenticated } from '../middleware/authorization.js';
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeBio,
  validateProfile,
} from '../utils/validation.js';

const router = Router();


//GET /users/profile

router.get('/profile', isAuthenticated, async (req, res) => {
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ error: 'User not found' });

  return res.json({
    name: u.name || '',
    email: u.email || '',
    bio: u.getBioPlain(),
  });
});


//POST /users/profile

router.post('/profile', isAuthenticated, async (req, res) => {
  try {

    let { name, email, bio } = req.body;
    name = sanitizeName(name);
    email = sanitizeEmail(email);
    bio = sanitizeBio(bio);


    const errors = validateProfile({ name, email, bio });
    if (Object.keys(errors).length > 0) {
      return res.status(400).render('dashboard', {
        user: req.user,
        profile: { name, email, bio },
        flash: errors.name || errors.email || errors.bio,
        csrfToken: req.csrfToken?.() || '',
      });
    }


    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists) {
      return res.status(409).render('dashboard', {
        user: req.user,
        profile: { name, email, bio },
        flash: 'Email already in use',
        csrfToken: req.csrfToken?.() || '',
      });
    }


    const u = await User.findById(req.user.id);
    if (!u) {
      return res.status(404).render('dashboard', {
        user: req.user,
        profile: { name, email, bio },
        flash: 'User not found',
        csrfToken: req.csrfToken?.() || '',
      });
    }

    u.name = name;
    u.email = email;
    u.setBioPlain(bio);
    await u.save();


    return res.render('dashboard', {
      user: u,
      profile: { name, email, bio },
      flash: 'Profile saved securely.',
      csrfToken: req.csrfToken?.() || '',
    });
  } catch (e) {
    console.error(e);
    return res.status(500).render('dashboard', {
      user: req.user,
      profile: {},
      flash: 'Save failed',
      csrfToken: req.csrfToken?.() || '',
    });
  }
});

export default router;
