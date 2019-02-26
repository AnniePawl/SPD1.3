//Stuff to start this
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
// const moment = require('helper-moment');
const port = process.env.PORT || 3000;

//Connect Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/SPD13', {useNewUrlParser: true});
// var conn = mongoose.createConnection('mongodb://localhost/SPD13', {useNewUrlParser: true})
// var GridFS = Grid(mongoose.connection.db, mongoose.mongo);

mongoose.Promise = global.Promise;
Grid.mongo = mongoose.mongo;
var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));

// connection.once('open', function () {
//   console.log('opened connection');
//   var gfs = Grid(connection.db);
//   module.exports = gfs
//  })

// var gfs = Grid(connection.db);

//Handlebars stuff
// app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs', helpers: {moment: moment}}));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'hbs');

//Middleware stuff
function defaultContentTypeMiddleware (req, res, next) {
  req.headers['content-type'] = req.headers['content-type'] || 'text/html';
  next();
}
app.use(defaultContentTypeMiddleware);
app.use(bodyParser.urlencoded({ extended: false}));
app.use(methodOverride('_method'));
app.use(bodyParser.json())

//Note to self don't need app.use if you write the code like this it can call it from this style
require('./routes/resources')(app);


//Port Listen
app.listen(port, function () {
  console.log('App listening on port 3000!')
});

// module.exports = gfs
