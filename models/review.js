const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const reviewSchema = new Schema ({
	body: String,
	rating: {
		type: Number,
		required: "please provide a rating(1-5 stars)",
		min:1,
		max: 5,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value"
           }
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	campground: {
		type: Schema.Types.ObjectId,
		ref: 'Campground'
	}
},{
	
	timestamps: true	

})

module.exports = mongoose.model('Review', reviewSchema);