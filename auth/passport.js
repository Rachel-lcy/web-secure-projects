import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import {config} from "dotenv";

config()
console.log(process.env.GOOGLE_CLIENT_ID)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"http://localhost:3000/auth/google/callback"
},(accessToken, refreshToken, profile, done)=> {
  const user = {
    id: profile.id,
    username: profile.displayName,
    role: 'user'
    // role: 'user'
  }
  // User[user.id] = user;
  return done(null, user)
}))

passport.serializeUser((user,done) => done(null, user))
passport.deserializeUser((user,done) => done(null, user))

export default passport