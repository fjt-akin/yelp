const mongoose = require('mongoose'),
    cities = require('./cities'),
    { places, descriptors } = require('./seedHelpers')
Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelly', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});



const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
			//Borutos Author ID
			author: '6132a788c4d0a832f58dd806',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.Facere consectetur, nulla nobis quo, veritatis recusandae alias praesentium consequuntur autem iste ipsa nemo ipsam pariatur architecto voluptate labore distinctio laboriosam, similique est veniam.Numquam illum perferendis pariatur ipsam sed animi est voluptatem totam.Autem inventore quaerat amet voluptas ratione non vel",
            price,
			geometry : {
				type: 'Point',
				coordinates: [
								cities[random1000].longitude,
								cities[random1000].latitude
							 ]
			},
			images: [
					  {

						url: 'https://res.cloudinary.com/dcqo1hcik/image/upload/v1632054539/YelpCamp/msrwl7vc00wf8qxdp0sl.jpg',
						filename: 'YelpCamp/msrwl7vc00wf8qxdp0sl'
					  },
					  {

						url: 'https://res.cloudinary.com/dcqo1hcik/image/upload/v1632308230/YelpCamp/oemzjujnsyqeucqsoy74.jpg',
						filename: 'YelpCamp/oemzjujnsyqeucqsoy74'
					  }
                    ]
    })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})