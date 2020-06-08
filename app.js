// Required Modules
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const rp = require('request-promise');
const SpotifyStrategy = require('passport-spotify').Strategy;

// Required Keys
const appKey = process.env.SPOTIFY_CLIENT_ID;
const appSecret = process.env.SPOTIFY_CLIENT_SECRET;

//Global Variables
var aToken = '';
var rToken = '';
var expireTime = '';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.

passport.use(
  new SpotifyStrategy(
    {
      clientID: appKey,
      clientSecret: appSecret,
      callbackURL: 'http://localhost:3000/auth/spotify/callback',
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // Set Globals
      aToken = accessToken;
      rToken = refreshToken;
      expireTime = expires_in;

      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(
  session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

/* 
  Authentication and login routes
*/

app.get('/login', function (req, res) {
  res.redirect('/');
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-top-read'],
    showDialog: true,
  }),
  function (req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  }
);

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function (req, res) {
    console.log(req.user);
    res.redirect('/');
  }
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

/*
  Home Route
*/
app.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    const data =
      '<h1>Logged In</h1><a href="/auth/spotify">Login</a><br><a href="/logout">Logout</a><br><a href="/account">Account</a><br><a href="/top/artists">Artist</a><br><a href="/top/tracks">Tracks</a><br><a href="/account/playlists">Playlists</a>';
    res.send(data);
  } else {
    res.render('landing');
  }
});

app.get('/account', ensureAuthenticated, function (req, res) {
  const baseUrl = 'https://api.spotify.com/v1/me';
  var options = {
    method: 'GET',
    uri: baseUrl,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aToken}`,
    },
    json: true,
  };

  rp(options).then(function (response) {
    res.send(response);
  });
});

app.get('/account/:query', ensureAuthenticated, function (req, res) {
  const baseUrl = 'https://api.spotify.com/v1/me';
  const query = req.params.query;
  const queryURL = baseUrl + `/${query}`;
  var options = {
    method: 'GET',
    uri: queryURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aToken}`,
    },
    json: true,
  };

  rp(options).then(function (response) {
    res.send(response);
  });
});

app.get('/top/:query', ensureAuthenticated, (req, res) => {
  const query = req.params.query;
  const baseUrl = 'https://api.spotify.com/v1/me/top';
  const queryURL = baseUrl + `/${query}`;
  var options = {
    method: 'GET',
    uri: queryURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aToken}`,
    },
    json: true,
  };

  rp(options).then(function (response) {
    res.send(response.items);
  });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.listen(3000, () => {
  console.log('Server started/restarted');
});
