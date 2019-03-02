require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

// REQUIRE CONNECT FLASH FOR FLASH MESSAGES 
// REQUIRE EXPRESS SESSION

const session = require('express-session');

// IMPORT PASSPORT DOCS FROM CONFIG FOLDER

const passportSetup = require('./config/passport/passport-setup');

mongoose
  .connect('mongodb://localhost/project-2', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// MIDDLEWARE SETUP

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// REGISTER PARTIALS 

hbs.registerPartials(__dirname + '/views/partials');

// EEXPRESSION VIEW ENGINE SETUP

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// DEFAULT VALUE FOR TITLE LOCAL 

app.locals.title = 'Express - Generated with IronGenerator';

// ACTIVATE FLASH IN THE ENTIRE APP
// ACTIVATE EXPRESS SESSION

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

// THIS COMES AFTER SESSION 

passportSetup(app);


//////// ROUTES //////////

const index = require('./routes/index');
app.use('/', index);

// REQUIRE AUTH ROUTES IN ENTIRE APPLICATION

app.use('/', require('./routes/auth-routes'));

app.use('/', require('./routes/user-routes'));

app.use('/', require('./routes/jam-routes'));

app.use('/', require('./routes/review-routes'));

module.exports = app;