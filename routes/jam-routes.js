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

                                                    
router.post('/create-jam', fileUploader.single('imageUrl'), (req, res, next) => {
  const { name, description } = req.body;
  Jam.create({
    name,
    description,
    imageUrl: req.file.secure_url,
    owner: req.user._id
  })
  .then( newJam => {
    res.redirect('/jamsessions');
  } )
  .catch( err => next(err) )
})

router.get('/jamsessions', isLoggedIn, (req, res, next) => {
  Jam.find()
  .then(jamsFromDB => {
    jamsFromDB.forEach(oneJam => {
        if(oneJam.owner.equals(req.user._id)){
          oneJam.isOwner = true;
        }
    })
    res.render('jam-pages/jam-list', { jamsFromDB })
  })
})

// post => save updates in the specific jam session
router.post('/jamsession/:jamId/update', fileUploader.single('imageUrl'),(req, res, next) => {

  const { name, description } = req.body;
  const updatedJam = {
    name,                                                       
    description,                                                
    owner: req.user._id	                                        
  }                                                                                         
  if(req.file){                                                
    updatedJam.imageUrl = req.file.secure_url;                 
  }                                                             
                                                                
  Jam.findByIdAndUpdate(req.params.jamId, updatedJam)
  .then( theUpdatedJam => {
    res.redirect(`/jamsessions/${updatedJam._id}`);
  } )
  .catch( err => next(err) )
})

// delete a specific jam session
router.post('/jamsessions/:id/delete', (req, res, next) => {
  Jam.findByIdAndDelete(req.params.id)
  .then(() => {
    res.redirect('/jamsessions');
  })
  .catch(err => next(err));
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
