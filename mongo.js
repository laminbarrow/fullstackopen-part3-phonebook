const process = require('node:process');
const mongoose = require('mongoose');

/* Setting constants for the password, name and number */
const passwordArg = process.argv[2] ?? '';
const nameArg = process.argv[3] ?? '';
const numberArg = process.argv[4] ?? '';

const mongoURL = `mongodb+srv://fullstackopen:${passwordArg}@atlascluster.beu3t.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=AtlasCluster`;

/* Defining the schema and model for the Phonebook */
const phoneBookSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Person = mongoose.model('Person', phoneBookSchema);

/* Only process the password, name and number if they are provided as arguments */
if (process.argv.length === 3) {
    /* display contacts in the phonebook */
    mongoose.connect(mongoURL);

    /* Fetch all the contacts in the phonebook and display the results */
    Person.find({}).then(result => {
        console.log('phonebook:');
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });

} else if (process.argv.length === 5) {

    /* Connect to the database and save the new contact */
    mongoose.connect(mongoURL);
    const person = new Person({
        name: nameArg,
        number: numberArg
    });

    /* Save the contact person to the database and display result */
    person.save()
        .then(result => {
            /* Display the results */
            console.log(`added ${result.name} number ${result.number} to phonebook`);

            /* Close the connection to the database */
            mongoose.connection.close();
        }).catch(error => {
            mongoose.connection.close();
            console.log(error.message);
        });

} else {
    console.log('Please provide the password as an argument: node mongo.js <password> <name> <number> or node mongo.js <password>');
    process.exit(1);
}
