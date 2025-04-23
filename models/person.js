const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

/* Connect to the database */
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// Define the schema for the person
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  number: {
    minlength: 8,
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Valid format is XX-XXXXXXXX or XXX-XXXXXXXX`,
    },
    required: [true, 'Phone number required'],
  },
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