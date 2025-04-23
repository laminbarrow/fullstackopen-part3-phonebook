require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const Person = require('./models/person')

// middleware uses
app.use(express.static('dist'))
app.use(express.json())

//Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token('post-body', function (req) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post-body'
  )
)

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/info', (req, res, next) => {
  const date = new Date()
  Person.find({})
    .then((person) => {
      //person should return the number of documents in the collection
      res.send(`
        <p>Phonebook has info for ${person.length} people</p>
        <p>${date}</p>
    `)
    })
    .catch((error) => next(error))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons)
    })
    .catch((error) => next(error))
})

/*
 * Get a person by id
 */
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      //error handling when not found
      if (!person) {
        return res.status(404).json({ error: 'person not found' }).end()
      }
      //return the person object
      res.json(person)
    })
    .catch((error) => next(error))
})

/*
 * Delete a person by id
 */
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

/*
 * Create a new person
 */
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  // Data validation
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing',
    })
  }

  // Check if the name already exists
  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        // Update the number if the name already exists
        Person.findOneAndUpdate(
          { name: body.name },
          { number: body.number },
          { new: true, runValidators: true }
        )
          .then((updatedPerson) => {
            res.json(updatedPerson)
          })
          .catch((error) => next(error))
      } else {
        // Create a new person if the name does not exist
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        person
          .save()
          .then((savedPerson) => {
            res.json(savedPerson)
          })
          .catch((error) => next(error))
      }
    })
    .catch((error) => next(error))
})

/* Update a person */
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(id, person, {
    new: true, // returns the updated document
    runValidators: true,
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        return res.status(404).json({ error: 'person not found' })
      }
      res.json(updatedPerson)
    })
    .catch((error) => next(error))
})

/* error handling middleware functions */
// unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
// error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

//mount error handling middleware
app.use(unknownEndpoint)
app.use(errorHandler)

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
