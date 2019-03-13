const express = require('express');
const router  = express.Router();

const Jam = require('../models/jam-model');
const User = require('../models/user-model');

const fileUploader = require('../config/upload-setup/cloudinary');


// GET route to display the form to create a jam session

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

// GET REQUEST DETAILS PAGE FOR THE JAM SESSIONS

router.get('/jams/:details', (req, res, next) =>{
  Jam.findById(req.params.details).populate('reviews')
  .populate({path: 'reviews', populate: {path: 'user'}})
  .populate('owner')
  .then(jamsFromDB => {
    // console.log('the user is : ', jamsFromDB.reviews.user)
    // console.log('this is the owner: ', jamsFromDB.owner)
    res.render('jam-pages/jam-details', {jam: jamsFromDB})
  })
})

//localhost:3000/jams/5c7744c5109b992cb3998a6e/update?

router.get('/jams/:jamId/update', (req, res, next) => {
  Jam.findById(req.params.jamId)
    .then(foundJam =>{
      res.render('jam-pages/jam-update', {jam: foundJam})
    })
    .catch( error => console.log('Error while getting the jam: ', error))
})

// post => save updates in the specific jam session

router.post('/jamsessions/:jamId/update', fileUploader.single('imageUrl'),(req, res, next) => {

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
    //localhost:3000/jams/5c7744c5109b992cb3998a6e
    console.log('this is the jam id: ', theUpdatedJam._id)
    res.redirect(`/jams/${theUpdatedJam._id}`);
  } )
  .catch( err => next(err) )
})

// DELETE A SPECIFIC JAM SESSION 

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
