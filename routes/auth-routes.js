const express = require('express');
const router = express.Router();

const passport = require('passport');
const User = require('../models/user-model');

const bcrypt = require('bcryptjs');
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

// action="/register"

router.post('/register', (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFullName = req.body.fullName;

  if(userEmail == '' || userPassword == '' || userFullName == ''){
    req.flash('error', 'Please fill all the fields.')
    res.render('auth/signup');
    return;
  }

  User.findOne({ email: userEmail })
  .then(foundUser => {
    if(foundUser !==null){
      req.flash('error', 'Sorry, there is already user with the same email!');
      /////  HERE WE WILL REDIRECT TO ---->  '/login' //////
      res.redirect('/login');
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPassword = bcrypt.hashSync(userPassword, salt);

      User.create({
        email: userEmail,
        password: hashPassword,
        fullName: userFullName
      })
      .then(user => {
        // IF IT'S OK, LOG IN USER AUTOMATICALLY 
          req.login(user, (err) => {
            if(err){
              req.flash('error', 'Auto login does not work so please log in manually ✌🏻');
              res.redirect('/login');
              return;
            }
            res.redirect('/private');
          })
      })
      .catch( err => next(err)); // CLOSES User.create()
  })
  .catch( err => next(err)); // CLOSES User.findOne();
})

//////////////// LOGIN /////////////////////

router.get('/login', (req, res, next) => {
  // console.log("----------------", process.env.googleClientID)
  res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/private', // <== SUCCESSFULLY LOGGED IN
  failureRedirect: '/login', // <== IF THE LOG IN FAILS GO BACK TO '/login' TO TRY AGAIN
  failureFlash: true,
  passReqToCallback: true
}));

//////////////// LOGOUT /////////////////////

router.post('/logout', (req, res, next) => {
  req.logout(); // <== .logout() METHOD COMES FROM PASSPORT AND TAKES CARE OF DESTROYING THE SESSION FOR US
  res.redirect('/login');
})

//////////////// GOOGLE LOGIN /////////////////////

router.get("/google-login", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "/private",
  successMessage: 'Google login successful!',
  failureRedirect: "/login",
  failureMessage: 'Google login failed. Please try to login manually.'
}));



module.exports = router;
