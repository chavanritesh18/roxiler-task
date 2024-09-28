const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

const app = express();
const PORT = 3000;
const mongoURL = process.env.MONGODB_URL;

app.use(cors());
app.use(express.json());

// Connecting to MongoDB
mongoose.connect('mongodb+srv://chavanritesh322:lT4X1DbZIMDiJLCQ@cluster0.a1dhf.mongodb.net/yourDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Database connected successfully");
})
.catch((err) => {
    console.log('Database connection error:', err);
});

// Importing Controllers
const { initializeDatabase } = require('./controllers/createDatabase');
const { listTransactions } = require('./controllers/transactionList');
const { statistics, barChart, pieChart  , combinedResponse} = require('./controllers/statisticsList');
// const {combinedResponse }= require('./controllers/combinedResponse');


// API Routes
app.get('/api/initialize', initializeDatabase);
app.get('/api/listofall', listTransactions);
app.get('/api/statistics', statistics);
app.get('/api/barchart', barChart);
app.get('/api/pieChart', pieChart);
app.get('/api/alldata', combinedResponse); // New route for combined response

// Test route to check server status
app.get('/', (req, res) => {
    res.send('The server is created');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
});
