import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import {config} from "dotenv";

config()

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"auth/google/callback"
},(accessToken, refreshToken, profile, done)=> {
  const user = {
    id: profile.id,
    username: profile.displayName,
    role: 'user'
  }
  User[user.id] = user;
  return done(null, profile)
}))

passport.serializeUser((user,done) => done(null, user.id))
passport.deserializeUser((id,done) => (null, User[id]))

export default passport