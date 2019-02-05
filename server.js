//Stuff to start this
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
// const moment = require('helper-moment');
const port = process.env.PORT || 3000;

//Connect Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://', {useNewUrlParser: true});

//Handlebars stuff
// app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs', helpers: {moment: moment}}));
// app.set('view engine', 'hbs');

//Middleware stuff
app.use(bodyParser.urlencoded({ extended: false}));
app.use(methodOverride('_method'));
app.use(bodyParser.json())

//Note to self don't need app.use if you write the code like this it can call it from this style
require('')(app);
require('')(app);

//Port Listen
app.listen(port, function () {
  console.log('App listening on port 3000!')
});

module.exports = app