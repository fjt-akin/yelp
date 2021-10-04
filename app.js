if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config({path:'../.env'})
}


const express = require('express');
const app = express();

const path = require('path'),
      mongoose = require('mongoose'),
      methodOverride = require('method-override'),
	  ExpressError = require('./utils/ExpressError'),
	  session = require('express-session'),
	  flash = require('connect-flash'),
      ejsMate = require('ejs-mate'),
	  passport = require('passport'),
	  LocalStrategy = require('passport-local'),
	  User =require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const {scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} = require('./utils/contentSecurityPolicy.js');

const MongoStore = require("connect-mongo");


//REQUIRE ROUTES
    
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

//mongoose connection
const dbUrl = process.env.DB_URL || 'mongodb:localhost:27017/yelly';


mongoose.connect(dbUrl, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true, 
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisbetterbeasecret';

// memory store
const store = MongoStore.create({
	
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
	crypto: {
		secret
	}
	
});

store.on("error", function(e){
	console.log('SESSION STORE ERROR', e);
})


const sessionConfig = {
	store,
	name: 'mate',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcqo1hcik/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://source.unsplash.com",
				"https://images.unsplash.com",
				"https://unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})


app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)



app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next)=>{
	   next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) =>{
	const {statusCode = 500} = err;
	if(!err.message) err.message = 'Oh no, something went wrong!'
	res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})