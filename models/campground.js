const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const imageSchema = new Schema({
	url: String,
	filename: String
})

imageSchema.virtual('thumbnail').get(function(){
	return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true}};

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
	 geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
    price: Number,
	createdAt: {type:Date, default:Date.now},
    description: String,
    location: String,
	rating: {
		type: Number, 
		default:0
	},
	author: {
		type: Schema.Types.ObjectID,
		ref:'User'
	},
	reviews: [
		{
			type:Schema.Types.ObjectID, 
			ref: 'Review'
		}
	]
}, opts);

campgroundSchema.post('findOneAndDelete', async function(doc){
	
	if(doc){
		await Review.deleteMany({
			_id: { $in: doc.reviews }
		})
	}
})



campgroundSchema.virtual('properties.popUpMarkup').get(function(){
	return `
		<strong><a href="/campgrounds/${this._id}">${this.title}</a><Strong>
	    <p>${this.description.substring(0, 20)}...</p>`
})


module.exports = mongoose.model('Campground', campgroundSchema);
