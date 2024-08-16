const app = require('express')();
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})