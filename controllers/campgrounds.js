const Campground = require('../models/campground');
const {escapeRegex} =  require('../middleware')
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({
	accessToken: mapBoxToken
})


module.exports.index = async (req, res) => {
	let perPage = 12
	let pageQuery = parseInt(req.query.page);
	let pageNum = pageQuery ? pageQuery : 1;
	let noMatch = null
	if(req.query.search){
		try{
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		const campgrounds = await Campground.find({title: regex}).sort({_id: -1}).skip((perPage * pageNum) - perPage).limit(perPage);
		const count = await Campground.countDocuments({title: regex});
		if(campgrounds.length < 1) { noMatch = 'Sorry, campground does not exist, Please create a new campground '}
	    res.render('campgrounds/index', { campgrounds, noMatch, current: pageNum, search: req.query.search, pages: Math.ceil(count/ perPage)  })
		} catch (e) {
			req.flash('error', e.message)
			res.redirect('back')
		}
	} else {
		try{
		const campgrounds = await Campground.find({}).sort({_id: -1}).skip((perPage * pageNum) - perPage).limit(perPage);
		const count = await Campground.countDocuments({});
		if(campgrounds.length < 1) { noMatch = 'Hello friend, create a new Yelp'}
	    res.render('campgrounds/index', { campgrounds, noMatch, current: pageNum, search: false, pages: Math.ceil(count/ perPage)  })
		} catch (e) {
			req.flash('error', e.message)
			res.redirect('back')
		}
	}
    
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res) => {
	    const geoData = await geoCoder.forwardGeocode({
			query: req.body.campground.location,
			limit: 1
		})
	    .send()
		const { campground } = req.body;
	    campground.geometry =geoData.body.features[0].geometry;
		campground.images =  req.files.map( file => ({url: file.path, filename: file.filename}))
		campground.author = req.user._id;
		const campgrounds = await Campground.create(campground);
		req.flash('success', 'Successfully made a new campground!');
		res.redirect(`/campgrounds/${campgrounds._id}`)
}

module.exports.showCampground = async (req, res) => {
 try{
	const { id } = req.params;
    const campground = await Campground.findById(id).populate({
		path: 'reviews',
		populate: {
			path:'author'
		}
	}).populate('author');
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds'); 
	}
    res.render('campgrounds/show', { campground })
} catch(e){
		req.flash('error', 'Campground does not exist');
	    return res.redirect('/campgrounds')
	}
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
	const campground = await Campground.findById(id)
	if(!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds'); 
	}
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
	console.log(req.body)
    const { campground } = req.body
    const updatedCampground = await Campground.findByIdAndUpdate(id, campground, { new: true, runValidators: true });
	const imgs =  req.files.map( file => ({url: file.path, filename: file.filename}))
	await updatedCampground.images.push(...imgs)
	updatedCampground.save()
	if(req.body.deleteImages){
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename)
		}
		await updatedCampground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages}}}})
	}
	req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}

module.exports.deleteCampground = async (req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
}