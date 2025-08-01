
import 'dotenv/config';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { sanitizeEmail } from '../utils/validation.js';


//LocalStrategy: email + password

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const em = sanitizeEmail(email);
        const user = await User.findOne({ email: em });
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        const ok = await bcrypt.compare(String(password || ''), user.password);
        if (!ok) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);


//GoogleStrategy：

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0] && profile.emails[0].value
              ? profile.emails[0].value.toLowerCase()
              : null;

          if (!email) {
            return done(null, false, { message: 'Google account has no email' });
          }

          let user = await User.findOne({ email });
          if (!user) {
            const randomPwd = crypto.randomBytes(16).toString('hex');
            const hash = await bcrypt.hash(randomPwd, 12);
            user = new User({
              email,
              name: profile.displayName || 'Google User',
              password: hash,
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

export default passport;
