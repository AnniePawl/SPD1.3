const Resource = require('../models/resource.js')
const mongoose = require('mongoose');
var Grid = require('gridfs-stream')
var fs = require('fs');
var contentType = require('content-type')
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
        var obj = contentType.parse(req)
        Resource.find().distinct('category')
        .then((categories) => {
            // res.json(categories)
            if (obj.type == "text/html"){
                res.render('category-index.handlebars', {categories: categories})
            } else {
                res.json(categories)
            }
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

    // app.get('/resources/download', (req, res) => {
    //     // Check file exist on MongoDB
    //
    //     var filename = req.query.filename;
    //
    //     gfs.exist({ filename: filename }, (err, file) => {
    //         if (err || !file) {
    //             res.status(404).send('File Not Found');
    //             return
    //         }
    //
    //         var readstream = gfs.createReadStream({ filename: filename });
    //         readstream.pipe(res);
    //     });
    // });

    // NEW
    app.get ('/resources/new', (req, res) => {
        // res.json('-new', {});
        res.render('acorn-new.handlebars');
    })

    // CREATE
    app.post('/resources', (req, res) => {
        console.log("req.body:", req.body)
        var obj = contentType.parse(req)
        console.log(obj);
        Resource.create(req.body)
        .then((resource) => {
            console.log("new Resource :", )
            if (obj.type == "application/x-www-form-urlencoded"){
                res.redirect(`/resources/${resource._id}`)
            } else {
                res.json(resource)
            }
        })
        .catch((err) => {
            console.log(err.message)
        })
    })

    // SHOW
    app.get('/resources/:id', (req, res) => {
        var obj = contentType.parse(req)
        Resource.findById(req.params.id)
        .then((resource) => {
            if (obj.type == "text/html"){
                res.render('acorn-show.handlebars', {acorn: resource})
            } else {
                res.json(resource)
            }
        })
        .catch((err) => {
            console.log(err.message)
        })
    })

    // EDIT
    app.get('/resources/:id/edit', (req, res) => {
        Resource.findById(req.params.id, function(err, ) {
            // res.json('resources-edit')
            res.render('acorn-edit.handlebars', {rId: req.params.id})
        })
    })

    // UPDATE
    app.put('/resources/:id', (req, res) => {
        var obj = contentType.parse(req)
        Resource.findByIdAndUpdate(req.params.id, req.body)
        .then((resource) => {
            if (obj.type == "application/x-www-form-urlencoded"){
                res.redirect(`/resources/${resource._id}`)
            } else {
                res.json(resource)
            }
        })
        .catch(err => {
            console.log(err.message)
        })
    })

    // DELETE
    app.delete('/resources/:id', function(req, res) {
        console.log('deleted')
        var obj = contentType.parse(req)
        console.log(obj);
        Resource.findByIdAndRemove(req.params.id).then((resource) => {
            if (obj.type == "application/x-www-form-urlencoded"){
                res.redirect('/')
            } else {
                res.json(resource)
            }
        }).catch((err => {
            console.log(err.message)
        }))
    })


    app.get('/:category', (req, res) => {
        var obj = contentType.parse(req)
        Resource.find({category: req.params.category})
        .then((docs) => {
            // res.json(docs)
            if (obj.type == "text/html"){
                res.render('acorn-index.handlebars', {acorns: docs})
            }
            else {
                res.json(docs)
            }
        })
        .catch((err) => {
            console.log(err);
        })
    })
}
