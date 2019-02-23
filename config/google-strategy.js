const passport =require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../../models/user-model');

passport.use(new GoogleStrategy({
  clientID: process.env.googleClientID,
  clientSecret: process.env.googleClientSecret,
  callbackURL: '/google/callback',
  proxy: true 
}, (accessToken, refreshToken, userInfo, cb) => {
  const { displayName, emails } = userInfo;

  User.findOne({ $or: [
    { email: emails[0].value },
    { googleID: userInfo.id } 
  ] })
  .then( user => {
    if(user){
      cb(null, user); // LOG THE USER IN IF THE USER EXISTS
      return;
    } 

    // IF USER ISN'T FOUND IN DB, CREATE ONE
    
    User.create({
      email: emails[0].value,
      fullName: displayName,
      googleID: userInfo.id
    })
    .then( newUser => {
      cb(null, newUser);
    } )
    .catch( err => next(err) );
  } )
  .catch( err => next(err) );
}))


