const express = require('express');
const app = express();

const morgan = require('morgan')

// middleware uses
app.use(express.json());
app.use(morgan('tiny'))

const PORT = 3001;

let notes = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.get('/info', (req, res) => {
    const date = new Date();
    res.send(`
        <p>Phonebook has info for ${notes.length} people</p>
        <p>${date}</p>
    `);
})

app.get('/api/persons', (req, res) => {
    res.json(notes);
})

/*
* Get a person by id
*/
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const note = notes.find(note => note.id === id);
    if (note) {
        res.json(note);
    } else {
        res.status(404).end();
    }
})

/*
* Delete a person by id
*/
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    notes = notes.filter(note => note.id !== id);
    res.status(204).end();
})

/* 
* Create a new person
*/
app.post('/api/persons', (req, res) => {
    const body = req.body;

    // data validation
    if(!body.name || !body.number){
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }

    const findExistingPerson = notes.find(item => item.name === body.name);
    // check if the name already exists
    if(findExistingPerson){
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    // new note 
    // Generate a new id for the phonebook entry with the Math.random function. 
    // Use a big enough range for your random values so that the likelihood of 
    // creating duplicate ids is small.
    note = {
        id: String(Math.floor(Math.random() * 10000)),
        name: body.name,
        number: body.number
    }

    //concat the new note to the notes array
    notes = notes.concat(note);
    res.json(body);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})