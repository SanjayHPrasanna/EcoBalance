const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

// Azure SQL Database Configuration
const dbConfig = {
    user: 'ecoadmin',
    password: 'admin#123',
    server: 'poc-igc2024-ecobalancer-sql.database.windows.net',
    database: 'poc-igc2024-ecobalancer-sql',
    options: {
        encrypt: true, // Use this if connecting to Azure
        enableArithAbort: true,
    },
};

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to Azure SQL Database');
    }

    // API Endpoint for Signup
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;

        try {
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query('INSERT INTO Users (Username, Password) VALUES (@username, @password)');

            res.status(200).send({ message: 'User signed up successfully' });
        } catch (err) {
            console.error('Error inserting data:', err);
            res.status(500).send({ message: 'Error during signup' });
        }
    });

    // API Endpoint for Login
    app.post('/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query('SELECT * FROM Users WHERE Username = @username AND Password = @password');

            if (result.recordset.length > 0) {
                res.status(200).send({ message: 'Login successful' });
            } else {
                res.status(401).send({ message: 'Invalid credentials' });
            }
        } catch (err) {
            console.error('Error querying data:', err);
            res.status(500).send({ message: 'Error during login' });
        }
    });
}).catch(err => {
    console.error('Database connection failed:', err);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
