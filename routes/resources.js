const Resource = require('../models/resource.js')

module.exports = app => {

    app.get('/', (req, res) => {
        Resource.find()
        .then((resources) => {
            res.json(resources)
        })
        .catch(err => {
            console.log(err)
        });
    })

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
}