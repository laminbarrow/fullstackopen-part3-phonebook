const mongoose = require('mongoose');

const url = process.env.MONGODB_URI

/* Connect to the database */
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

// Define the schema for the person
const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

// personSchema toJSON method to format the returned object
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject._id,
        delete returnedObject.__v   
    }
})

// default module exports
module.exports = mongoose.model('Person', personSchema)