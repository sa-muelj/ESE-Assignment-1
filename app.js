const express = require('express');
const path = require('path');
const blogRoutes = require('./routes/blog');
const authRouter = require('./routes/auth');
const session = require('express-session');
const flash = require('express-flash');


const app = express();
const port = process.env.PORT || 3000;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
// Parse URL-encoded bodies (as sent by HTML forms)
// This middleware is needed to handle form submissions in our blog application
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// This middleware allows us to serve our CSS file and any other static assets
app.use(express.static(path.join(__dirname, "public")));

// Sessions

app.use(session({
  secret: 'your-secret-keywoo',  // Secret key to sign the session ID cookie
  resave: false,              // Don't save session if unmodified
  saveUninitialized: false,    // Don't save session if new and unmodified
  cookie: {
      secure: false,          // Set to true if using HTTPS
      sameSite: 'strict',     // Mitigate CSRF attacks
      maxAge: 90000           // Session expiration time (15 minutes)
  }
}));

app.use(flash());

// Middleware to check if the user is authenticated
app.use((req, res, next) => {
  // Exclude /user/login and /user/register from session check - stops redirect loop
  if (req.path === '/user/login' || req.path === '/user/register') {
    return next(); // Skip session check for login route
  }

  if (!req.session || !req.session.username) {
    return res.redirect('/user/login'); // Redirect to login if no session or username is not set
  }

  next(); // Proceed to the next if the user is authenticated
});

// Routes

app.use('/', blogRoutes);
app.use('/user', authRouter);


// start server

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
;

module.exports = app;
