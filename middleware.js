const  { campgroundSchema, reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next) => {
	if(!req.isAuthenticated()) {
		//to store the location user was, before being mandated to login, so they can be redirected back to it
		req.session.returnTo = req.originalUrl
		req.flash('error', 'you must be signed in first');
		return res.redirect('/login');
	}
	next();
}

module.exports.validateCampground = (req,res,next) =>{
	
		const {error} = campgroundSchema.validate(req.body)
		
		 if( error) {
			 const msg = error.details.map(el => el.message).join(',')
			 throw new ExpressError(msg, 400)
		 } else {
			 next()
		 }
}

module.exports.validateReview = (req,res,next) =>{
	
		const {error} = reviewSchema.validate(req.body)
		
		 if( error) {
			 const msg = error.details.map(el => el.message).join(',')
			 throw new ExpressError(msg, 400)
		 } else {
			 next()
		 }
}

module.exports.isAuthor = async(req, res, next) => {
	const {id} = req.params;
	const campground = await Campground.findById(id);
	if(!campground.author.equals(req.user._id)){
		req.flash('error', `sorry ${req.user.username}, you do not have permission to do that!`)
	    return res.redirect(`/campgrounds/${id}`);
	}
	next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
	const {id, reviewId} = req.params;
	const review = await Review.findById(reviewId);
	if(!review.author.equals(req.user._id)){
		req.flash('error', `sorry ${req.user.username}, you do not have permission to do that!`)
	    return res.redirect(`/campgrounds/${id}`);
	}
	next();
}

module.exports.escapeRegex = (string) =>{
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// module.exports.calculateAverage = revs => {
// 	if(revs.length === 0){
// 		return 0;
// 	}
// 	let sum = 0;
// 	revs.forEach(function(element){
// 		sum += element.rating
// 	});
// 	return sum/revs.length;
// }