const Campground = require('../models/campground');
const Review = require('../models/review');
// const {calculateAverage} = require('../middleware');


module.exports.createReview = async(req,res)=>{
	const {id} = req.params;
	const campground = await Campground.findById(id);
	const {review} = req.body;
	console.log(`this is : ${req.body.review.rating}`)
	review.campground = campground
	review.author = req.user._id;
	const newReview = await Review.create(review)
	campground.reviews.push(newReview);
	campground.rating = calculateAverage(campground.reviews);
	await campground.save()
	console.log(`this is : ${campground.rating}`)
	req.flash('success', 'created new review');
	res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteReview = async(req, res)=>{
	const {id, reviewId} = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
	const review = await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully deleted review!');
	res.redirect(`/campgrounds/${campground._id}`)
}


function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    let sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}