const express = require('express');
const path = require('path');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');

const { User } = require('../db/models/userModel');

const app = express();
const PORT = 3000;

app.use(morgan('dev'));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
  key: 'user_sid',
  secret: 'somerandomestuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

app.use((req, res, next) => {
  console.log('what is cookies ', req.cookies);
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/dashboard');
  } else {
    next();
  }
};

app.route('/', sessionChecker, (req, res) => {
  res.redirect('/login');
});

app.route('/signup')
  .get(sessionChecker, (req,res) => {
    res.sendFile(path.join((__dirname + '/../static/signup.html')));
  })
  .post((req, res) => {
    console.log('what is sessions ', req.sessions);
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(user => {
      req.session.user = user.dataValues;
      res.redirtect('/dashboard');
    })
    .catch(err => {
      res.redirect('/signup');
    });
  });

app.route('/login')
  .get(sessionChecker, (req, res) => {
    res.sendFile(path.join((__dirname + '/../static/login.html')));
  })
  .post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.findOne({where: {username: username}})
      .then(user => {
        if (!user) {
          res.redirect('/login');
        } else if (!user.validPassword(password)) {
          res.redirect('/login')
        } else {
          req.session.user = user.dataValues;
          res.redirect('/dashboard');
        }
      });
  });

app.get('/dashboard', (req, res) => {
  console.log('what is sessions ', req.sessions);
  if (req.sessions.user && req.cookies.user_sid) {
    res.sendFile(path.join((__dirname + '/../static/dashboard.html')));
  } else {
    redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect('/');
  } else {
    redirect('/login');
  }
});

app.get('/favicon.ico', (req, res, next) => res.status(204));

app.use((req, res, next) => {
  res.status(400).send('Sorry can\'t find that');
});

app.listen(PORT, err => {
  if (err) {
    console.log('error connecting to server ', err);
  }
  console.log('connected to server on PORT ', PORT);
});
