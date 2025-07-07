import express from 'express';
import helmet from 'helmet';
import http from 'http';
// import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js';
import fileRoutes from './routes/file.js';

// Enable env vars
dotenv.config();
const app = express();
const HTTP_PORT = process.env.SERVER_PORT || 3000;

// HTTPS credentials
// const __dirname = path.resolve();
// const options = {
//   key: fs.readFileSync(path.join(__dirname, 'openssl', 'private-key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'openssl', 'certificate.pem')),
// };

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));


  app.use(passport.initialize());
  app.use(passport.session());



// Set static file cache headers
app.use('/static', express.static('public', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) res.set('Cache-Control', 'max-age=86400');
    if (filePath.endsWith('.jpg') || filePath.endsWith('.png')) {
      res.set('Cache-Control', 'max-age=2592000');
    }
  }
}));

// Sample data
const projects = [
  { id: 1, title: 'Portfolio Website', description: 'A showcase of my work' },
  { id: 2, title: 'E-commerce Platform', description: 'An online store project' },
];

// === CSRF Token route (unprotected) ===
const csrfProtection = csrf({ cookie: true });

app.get('/csrf-token', csrfProtection,(req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    secure: true,
    sameSite: 'strict',
    httpOnly: false
  });
  res.status(200).json({ csrfToken: token });
});

// === Public Routes ===
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send('<h1>Welcome to My Developer Portfolio</h1>');
});

app.get('/projects', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
  res.json(projects);
});

app.get('/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (project) {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
    res.json(project);
  } else {
    res.status(404).send('Project not found.');
  }
});

app.get('/about', (req, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  res.send('<h1>About Me</h1><p>I am a developer who values security and performance.</p>');
});

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Welcome ${req.user.username}</h1><p>You are logged in as ${req.user.role}</p>`);
});

app.get('/contact', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send('<h1>Contact Me</h1><p>Fill in the contact form to get in touch!</p>');
});


function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).send('Forbidden: Admins only');
}

  app.get('/admin', isAdmin, (req, res) => {
    res.send('<h1>Admin Dashboard</h1>');
  });
// === Backend Routes ===
// Apply csrfProtection selectively
app.use('/auth', authRoutes);
app.use('/users', csrfProtection, userRoutes);
app.use('/files', csrfProtection, fileRoutes);

// // HTTPS server start
// http.createServer(options, app).listen(SERVER_PORT, () => {
//   console.log(`HTTP server started at http://localhost:${SERVER_PORT}`);
// });

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server started at http://localhost:${HTTP_PORT}`);
});