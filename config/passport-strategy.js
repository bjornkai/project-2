const passport =require('passport');
const User = require('../../models/user-model');
const flash = require('connect-flash');

/////// REQUIRE ALL THE STRATEGIES ////////////
require('./local-strategy');
require('./google-strategy');

passport.serializeUser((user, cb) => {
  cb(null, user._id); // ==> SAVE USER ID INTO SESSION
});

// deserializeUser => RETRIEVES THE USER'S DATA FROM THE DB

passport.deserializeUser((userId, cb) => {
    User.findById(userId)
    .then(user => {
      cb(null, user);
    })
    .catch( err => cb(err));
})

function passportBasicSetup(app){

  // PASSPORT SUPER POWER:
  app.use(passport.initialize()); // <== 'FIRES' THE PASSPORT PACKAGE
  app.use(passport.session()); // <== CONNECTS PASSPORT TO SESSION

  // ACTIVATES FLASH MESSAGES
  app.use(flash());
  app.use((req, res, next) => {
    res.locals.messages = req.flash();
    if(req.user){
      res.locals.currentUser = req.user;
    }
    next();
  })
}

module.exports = passportBasicSetup;