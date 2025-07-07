import express from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {configDotenv} from 'dotenv';
import rateLimit from 'express-rate-limit';

configDotenv();

const userRouter = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {message:'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})


userRouter.post('/register', async(req,res)=> {
  const {username,password, role, department} = req.body;
  const hashPassword = await argon2.hash(password);
  const randomNum = Math.floor(Math.random()*1000);
  const userId = Date.now().toString().slice(7)+ randomNum;

  try {
    const newUser = new User({
      username,
      userId,
      password: hashPassword,
      role,
      department,
    });
    await newUser.save();

    res.status(201).json({
      message: 'User Created',
      user: {
        username: newUser.username,
        userId: newUser.userId,
        role: newUser.role,
        department: newUser.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
    console.log(err);
  }
})

userRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPassWordValid = await argon2.verify(user.password, password);
    if (!isPassWordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const jwtToken = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        department: user.department,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {userId: user.userId},
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message: 'Login successfully',
      authToken: jwtToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default userRouter;