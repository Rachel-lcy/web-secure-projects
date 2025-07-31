
import { Router } from 'express';
import User from '../models/User.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { isAuthenticated } from '../middleware/authorization.js';
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeBio,
  validateProfile,
} from '../utils/validation.js';
import csrf from 'csurf';

const router = Router();

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect('/auth/login');
}

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

const csrfProtection = csrf({
  cookie: {
    sameSite: 'strict',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
});

router.post('/profile', requireAuth, csrfProtection, async (req, res, next) => {
  try {
    const name = sanitizeName(req.body.name);
    const email = sanitizeEmail(req.body.email);
    const bioClean = sanitizeBio(req.body.bio);


    const errors = validateProfile({ name, email, bio: bioClean });
    if (Object.keys(errors).length > 0) {
      const u = await User.findById(req.user._id).lean();
      return res
        .status(400)
        .render('dashboard', {
          user: u,
          csrfToken: req.csrfToken(),
          profile: { name, email, bio: bioClean },
          flash: Object.values(errors).join(' '),
        });
    }


    const encBio = encrypt(bioClean); // -> { cipherTextB64, ivB64, tagB64 }

    await User.updateOne(
      { _id: req.user._id },
      { $set: { name, email, bio: encBio } },
    );


    return res.redirect('/dashboard?flash=Profile%20updated');
  } catch (err) {
    return next(err);
  }
});


export default router;
