const express = require('express');
const router  = express.Router();
const Jam = require('../models/jam-model');
const Review = require('../models/review-model');


// create a new review
// http://localhost:3000/jamsessions/5c7abd171fb38043ccd1d337/add-review

router.post('/jamsessions/:jamId/add-review', (req, res, next) => {
  // step 1: create a new review
  const newComment = {
    user: req.user._id,
    comment: req.body.comment,
    canBeChanged: false
  }

  Review.create(newComment)
  .then(theNewComment => {
    // step 2: find the jam that the new comment belongs to
    Jam.findById(req.params.jamId)
    .then(foundJam => {
      // when find the jam session, push the ID of the new comment into the 'reviews' array
      foundJam.reviews.push(theNewComment._id);
      // step 3: save the changes you just made in the found jam session
      foundJam.save()
      .then(() => {
        res.redirect(`/jams/${foundJam._id}`)
      })
      .catch(err => next(err));
    })
    .catch(err => next(err));
  })
  .catch(err => next(err));
})


// delete review
// since we have saved reviews inside reviews collection and as array of ids in the jams' reviews,
// we have to make sure when deleted, the review disappears from the reviews collection and from
// the jam's reviews array

router.post('/reviews/:id', (req, res, next) => {
  Review.findByIdAndDelete(req.params.id) // <--- deleting review from reviews collection
  .then(() => {
    Jam.findOne({'reviews': req.params.id}) // <--- find a jam that has the review we deleted from the collections
    .then(foundJam => {

      // loop through all the reviews and when find matching ids...
      for(let i=0; i< foundJam.reviews.length; i++ ){
        console.log(foundJam.reviews[i]._id.equals(req.params.id))
        if(foundJam.reviews[i]._id.equals(req.params.id)){
          // ... use method splice to delete that id from the array
          foundJam.reviews.splice(i, 1);
        }
      }
      // make sure you save the changes in the jam (you just deleted one review id from its array of reviews,
      // so that needs to be saved in the database)
      foundJam.save()
      .then(() => {
        res.redirect(`/jamsessions/${foundJam._id}`)
      })
      .catch(err => next(err))
    })
  })
})




module.exports = router;
