const Resource = require('../models/resource.js')
const mongoose = require('mongoose');
var Grid = require('gridfs-stream')
var fs = require('fs');
mongoose.Promise = global.Promise;
Grid.mongo = mongoose.mongo;
var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));

var gfs

connection.once('open', function () {
    console.log('opened connection');
    gfs = Grid(connection.db);
})

module.exports = app => {

    // app.get('/', (req, res) => {
    //     console.log('entered /');
    //     console.log(gfs);
    //     Resource.find()
    //     .then((resources) => {
    //         res.json(resources)
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     });
    // })
    app.get('/', (req, res) => {
        // console.log('entered /');
        // console.log(gfs);
        Resource.find().distinct('category')
        .then((categories) => {
            // res.json(categories)
            res.render('category-index.handlebars', {categories: categories})
        })
        .catch(err => {
            console.log(err)
        });
    })

    app.get('/search', (req, res) => {
        console.log('entered search');
        searchTerm = req.query.searchTerm
        console.log(searchTerm);
        Resource.find({ $text : {$search: searchTerm} })
        .then((searchResult) => {
            res.json(searchResult);
        })
        .catch((err) => {
            console.log(err);
        })
    })

    app.get('/resources/upload', (req, res) => {
        var filename = req.query.filename;
        var writestream = gfs.createWriteStream({
            filename: filename
        });
        writestream.on('close', (file) => {
            res.send('Stored File: ' + file.filename);
        });
        fs.createReadStream(__dirname + "/../uploads/" + filename).pipe(writestream);
    })

    app.get('/resources/download', (req, res) => {
        // Check file exist on MongoDB

        var filename = req.query.filename;

        gfs.exist({ filename: filename }, (err, file) => {
            if (err || !file) {
                res.status(404).send('File Not Found');
                return
            }

            var readstream = gfs.createReadStream({ filename: filename });
            readstream.pipe(res);
        });
    });

    app.get('/resources/download', (req, res) => {
        // Check file exist on MongoDB

        var filename = req.query.filename;

        gfs.exist({ filename: filename }, (err, file) => {
            if (err || !file) {
                res.status(404).send('File Not Found');
                return
            }

            var readstream = gfs.createReadStream({ filename: filename });
            readstream.pipe(res);
        });
    });

    // NEW
    app.get ('/resources/new', (req, res) => {
        res.json('-new', {});
    })

    // CREATE
    app.post('/resources', (req, res) => {
        console.log("req.body:", req.body)
        Resource.create(req.body)
        .then((resource) => {
            console.log("new Resource :", )
            res.redirect(`/resources/${resource._id}`)
        })
        .catch((err) => {
            console.log(err.message)
        })
    })

    // SHOW
    app.get('/resources/:id', (req, res) => {
        Resource.findById(req.params.id)
        .then((resource) => {
            res.json(resource)
        })
        .catch((err) => {
            console.log(err.message)
        })
    })

    // EDIT
    app.get('/resources/:id/edit', (req, res) => {
        Resource.findById(req.params.id, function(err, ) {
            res.json('resources-edit')
        })
    })

    // UPDATE
    app.put('/resources/:id', (req, res) => {
        Resource.findByIdAndUpdate(req.params.id, req.body)
        .then((resource) => {
            res.redirect(`/resources/${resource._id}`)
        })
        .catch(err => {
            console.log(err.message)
        })
    })

    // DELETE
    app.delete('/resources/:id', function(req, res) {
        console.log('deleted')
        Resource.findByIdAndRemove(req.params.id).then((resource) => {
            res.redirect('/resources')
        }).catch((err => {
            console.log(err.message)
        }))
    })


    app.get('/:category', (req, res) => {
        Resource.find({category: req.params.category})
        .then((docs) => {
            res.json(docs)
        })
        .catch((err) => {
            console.log(err);
        })
    })
}
