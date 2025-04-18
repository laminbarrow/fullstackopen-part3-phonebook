require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const Person = require('./models/person')

// middleware uses
app.use(express.json())
app.use(express.static('dist'))

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

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

/*
* Get a person by id
*/
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id

    Person.findById(id).then(person => {
        res.json(person)
    })
})

/*
* Delete a person by id
*/
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    Person.findOneAndDelete(id).then((result) => {
      res.status(204).end();
    });
})

/* 
* Create a new person
*/
app.post('/api/persons', (req, res) => {
    const body = req.body

    // data validation
    if(!body.name || !body.number){
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }

    // const findExistingPerson = Person.find({
    //     name: body.name
    // }).then(res => res);

    // // check if the name already exists
    // if(findExistingPerson){
    //     return res.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})