import express from 'express';
import helmet from 'helmet';
import http from 'http';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js';
import fileRoutes from './routes/file.js';
import { isAuthenticated } from './middleware/authorization.js';

// Enable env vars
dotenv.config();
const app = express();
const HTTP_PORT = process.env.SERVER_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}
// HTTPS credentials
// const __dirname = path.resolve();
// const options = {
//   key: fs.readFileSync(path.join(__dirname, 'openssl', 'private-key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'openssl', 'certificate.pem')),
// };

//Path & Views
const  __filename = fileURLToPath(import.meta.url);
const  __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Cookies & Session
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

import './auth/passport.js';
app.use(passport.initialize());
app.use(passport.session());

app.use(
  rateLimit({
    windowMs:60*1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
  })
)


// Set static file cache headers
app.use(
  '/static',
  express.static(path.join(__dirname, 'public'), {
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      } else if (/\.(jpg|jpeg|png|gif|svg)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
      }
    },
  })
);


// === CSRF Token route (unprotected) ===
const csrfProtection = csrf({
  cookie: {
    sameSite: 'strict',
    httpOnly: true,
    secure: NODE_ENV === 'production',
} });

app.get('/csrf-token', csrfProtection,(req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    secure: true,
    sameSite: 'strict',
    httpOnly: false,
  });
  res.status(200).json({ csrfToken: token });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  return next(err);
});


// === Public Routes ===

const projects = [
  { id: 1, title: 'Portfolio Website', description: 'A showcase of my work' },
  { id: 2, title: 'E-commerce Platform', description: 'An online store project' },
];

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

app.get('/dashboard',isAuthenticated, (req, res) => {
  res.render('dashboard',
    {
      user: req.user,
      profile: null,
      flash: null,
      csrfToken: req.csrfToken()
    });
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

app.use((req, res) => res.status(404).send('Not found'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});


app.listen(HTTP_PORT, () => {
  console.log(`HTTP server started at http://localhost:${HTTP_PORT}`);
});

export default app;