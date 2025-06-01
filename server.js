const express = require('express');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HTTPS_PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet());


const projects = [
  { id: 1, title: 'Portfolio Website', description: 'A showcase of my work' },
  { id: 2, title: 'E-commerce Platform', description: 'An online store project' },
];

app.use('/static', express.static('public', {
  setHeaders: (res, path) => {
    if(path.endsWith('.css')) {
      res.set('Cache-Control','max-age=86400')// Cache for 24 hours
    }
    if (path.endsWith('.jpg') || path.endsWith('.png')) {
      res.set('Cache-Control', 'max-age=2592000'); // Cache images for 30 days
    }
  }
}))


app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send('<h1>Welcome to My Developer Portfolio</h1>');
});


app.get('/projects', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
  res.json(projects);
});

app.get('/projects/:id', (req,res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if(project){
     res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
    res.json(project);
  }else{
    res.status(404).send('Project not found.');
  }
})

app.get('/about', (req, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  res.send('<h1>About Me</h1><p>I am a developer who values security and performance.</p>');
});

app.get('/contact', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send('<h1>Contact Me</h1><p>Fill in the contact form to get in touch!</p>');
});

const options = {
  cert: fs.readFileSync(path.join(__dirname, 'openssl', 'certificate.pem')),
  key: fs.readFileSync(path.join(__dirname, 'openssl', 'private-key.pem')),
};

https.createServer(options, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS server started at https://localhost:${HTTPS_PORT}`);
});