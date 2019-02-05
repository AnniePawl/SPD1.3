const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ResouceSchema = new Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    
})