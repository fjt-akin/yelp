const express = require('express');
const router = express.Router({mergeParams: true});


const   { reviewSchema } = require('../schemas.js'),
	    catchAsync = require('../utils/catchAsync'),
	    ExpressError = require('../utils/ExpressError'),
	    Review = require('../models/review'),
        Campground = require('../models/campground'),
	    reviews = require('../controllers/reviews');


const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');


router.post('/', isLoggedIn, validateReview , catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;