const Resource = require('../models/resource.js')
const mongoose = require('mongoose');
const Auth = require('../models/auth.js')
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

    app.get('/resources', (req, res) => {
        // console.log('entered /');
        // console.log(gfs);
        var obj = contentType.parse(req)
        console.log(req.user._id);
        // Resource.find({ user: req.user._id}).distinct('category')
        Auth.findById(req.user._id).select('categories')
        .then((categories) => {
            console.log(categories.categories);
            // res.json(categories)
            if (obj.type == "text/html"){
                res.render('category-index.handlebars', {categories: categories.categories})
            } else {
                res.json(categories.categories)
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
        Resource.find({ $text : {$search: searchTerm}, user: req.user._id})
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
        res.render('acorn-new.handlebars', {cat: req.params.category});
    })
    // NEW
    app.get ('/categories/new', (req, res) => {
        // res.json('-new', {});
        res.render('category-new.handlebars');
    })

    // CREATE

    app.post('/categories', (req, res) => {
        req.body.user = req.user._id;
        console.log("req.body:", req.body)
        var obj = contentType.parse(req)
        console.log(obj);
        Auth.update({_id: req.body.user}, {$addToSet: {categories: req.body.category}})
        .then((user) => {
            if (obj.type == "application/x-www-form-urlencoded"){
                res.redirect(`/resources`)
            } else {
                res.json(user.categories)
            }
        })
        .catch((err) => {
            console.log(err);
        })
    })

    app.post('/resources', (req, res) => {
        req.body.user = req.user._id;
        console.log("req.body:", req.body)
        var obj = contentType.parse(req)
        console.log(obj);
        Auth.update({_id: req.body.user}, {$addToSet: {categories: req.body.category}})
        .then((user) => {
            return Resource.create(req.body)
        })
        .then((resource) => {
            console.log("new Resource :", resource)
            if (obj.type == "application/x-www-form-urlencoded"){
                res.redirect(`/resources/${resource._id}`)
            } else {
                res.json(resource)
            }
        })
        .catch((err) => {
            console.log(err.message)
        })
        // Resource.create(req.body)
        // .then((resource) => {
        //     console.log("new Resource :", )
        //     return Auth.update({_id: req.body.user}, {$addToSet: {categories: req.body.category}})
        //     // if (obj.type == "application/x-www-form-urlencoded"){
        //     //     res.redirect(`/resources/${resource._id}`)
        //     // } else {
        //     //     res.json(resource)
        //     // }
        // })
        // .then((user) => {
        //     if (obj.type == "application/x-www-form-urlencoded"){
        //         res.redirect(`/resources/${resource._id}`)
        //     } else {
        //         res.json(resource)
        //     }
        // })
        // .catch((err) => {
        //     console.log(err.message)
        // })
    })

    // SHOW #TODO: Modify so that user has to match
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

    // UPDATE #TODO: Modify so that user has to match
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

    // DELETE #TODO: Modify so that user has to match
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
        Resource.find({category: req.params.category, user: req.user._id})
        .then((docs) => {
            // res.json(docs)
            if (obj.type == "text/html"){
                res.render('acorn-index.handlebars', {acorns: docs, cat: req.params.category})
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
