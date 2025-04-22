require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const Person = require('./models/person')

// middleware uses
app.use(express.static("dist"));
app.use(express.json())

//Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token('post-body', function (req, res) { 
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/info', (req, res) => {
    const date = new Date()
    const person = Person.find({}).then(res => {
        res
    });
    //person should return the number of documents in the collection
    res.send(`
        <p>Phonebook has info for ${person.length} people</p>
        <p>${date}</p>
    `)
})

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    }).catch(error => next(error))
})

/*
* Get a person by id
*/
app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    Person.findById(id).then(person => {
        //error handling when not found
        if(!person){
            return res.status(404)
                        .json({ error: 'person not found' })
                        .end()
        }
        //return the person object
        res.json(person)
    }).catch(error => next(error))
})

/*
* Delete a person by id
*/
app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndDelete(id).then((result) => {
      res.status(204).end();
    }).catch(error => next(error));
})

/* 
* Create a new person
*/
app.post('/api/persons', (req, res, next) => {
    const body = req.body

    // data validation
    if(!body.name || !body.number){
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }

    // the frontend will try to update the phone number of the existing entry by making an 
    // HTTP PUT request to the entry's unique URL. The backend support this request type as well
    // by checking if the name already exists in the database. If it does, it will update the number
    // if the name already exists, we will update the number

    // // check if the name already exists
    const findExistingPerson = Person.find({
        name: body.name
    }).then(res => res);

    // check if the name already exists
    if(findExistingPerson){
        // if it does, we will update the number
        Person.findOneAndUpdate(
            { name: body.name },
            { number: body.number },
            { new: true }
        ).then(updatedPerson => {
            res.json(updatedPerson)
        }).catch(error => next(error))
        
        // return the early as there is no need to create a new person
        return
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    }).catch(error => next(error))

});

/* Update a person */
app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(id, person, { new: true }) // { new: true } returns the updated document
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))          
})

/* error handling middleware functions */
// unknown endpoint
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}
// error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if(error.name === 'CastError'){
        return res.status(400).send({ error: 'malformatted id' })
    } else if(error.name === 'ValidationError'){
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

//mount error handling middleware
app.use(unknownEndpoint);
app.use(errorHandler)

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})