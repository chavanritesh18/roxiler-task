// controllers/Database.js

const axios = require('axios');
const Transaction = require('../models/db.js'); // Ensure the correct path to your model

// Function to initialize the database
const initializeDatabase = async (req, res) => {
    try {
        // Fetch data from the external source
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        // Optional: Clear existing data to avoid duplicates
        // await Transaction.deleteMany({}); // Uncomment if you want to clear the collection first

        // Insert the data into the database
        await Transaction.insertMany(transactions);

        // Send a success response
        res.status(200).send('Database initialized successfully');
    } catch (error) {
        // Handle errors
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database');
    }
};

module.exports = {
    initializeDatabase,
};
