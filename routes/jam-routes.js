const express = require('express');
const router  = express.Router();

const Jam = require('../models/jam-model');
const User = require('../models/user-model');

const fileUploader = require('../config/upload-setup/cloudinary');


// GET route to display the form to create a room
router.get('/jams/add', isLoggedIn, (req, res, next) => {
  res.render('jam-pages/addJam');
});



// POST ROUTE TO CREATE THE JAM SESSION 

                                                    
router.post('/create-jam', fileUploader.single('imageUrl'),(req, res, next) => {
  const { name, description } = req.body;
  Jam.create({
    name,
    description,
    imageUrl: req.file.secure_url,
    owner: req.user._id
  })
  .then( newJam => {
    res.redirect('/jams');
  } )
  .catch( err => next(err) )
})

router.get('/jams', isLoggedIn, (req, res, next) => {
  Jam.find()
  .then(jamsFromDB => {
    jamsFromDB.forEach(oneJam => {
      // each room has the 'owner' property which is user's id
      // if owner (the id of the user who created a room) is the same as the currently logged in user
      // then create additional property in the oneRoom object (maybe isOwner is not the best one but ... 🤯)
      // and that will help you to allow that currently logged in user can edit and delete only the rooms they created
 
        if(oneJam.owner.equals(req.user._id)){
          oneJam.isOwner = true;
        }
    
    })
    res.render('jam-pages/jam-list', { jamsFromDB })
  })
})

// FUNCTION USED TO MAKE SURE THE ROUTE AND FUNCTIONALITY IS AVAILABLE ONLY TO USERS IN SESSION 

function isLoggedIn(req, res, next){
  if(req.user){
    next();
  } else  {
    res.redirect('/login');
  }

}

module.exports = router;
