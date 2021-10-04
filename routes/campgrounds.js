const  express = require('express'),
       router = express.Router(),
       catchAsync = require('../utils/catchAsync'),
	   ExpressError = require('../utils/ExpressError'),
	   Campground = require('../models/campground'),
	  { campgroundSchema} = require('../schemas'),
	  campgrounds = require('../controllers/campgrounds'),
	  {storage} = require('../cloudinary'),
	  multer  = require('multer'),
      upload = multer({ storage});
     
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

router.route('/')
     .get(catchAsync(campgrounds.index))
     .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
     

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
     .get(catchAsync(campgrounds.showCampground))
     .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
     .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));






router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));





module.exports = router;
