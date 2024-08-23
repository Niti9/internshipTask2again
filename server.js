// const express = require('express');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2');
// const cors = require('cors');
// require('dotenv').config();


// const app = express();
// app.use(bodyParser.json());
// app.use(cors()); 
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     // password: 'Password', // Replace with your MySQL password
//     database: 'school_management'
// });

// db.connect(err => {
//     if (err)
//         {
//             console.log("There is error in mysql database or you are not connected",err.message);
//             console.error(err);
//             return;
//         }
//     console.log('Connected to MySQL database');
// });



// app.get('/', (req, res) => {
//        console.log("Hello Everyone");
//     res.json({ message: 'Welcome to the School Management API!' });
// });


// // Add School API
// app.post('/addSchool', (req, res) => {
//     const { name, address, latitude, longitude } = req.body;
//     if (!name || !address || !latitude || !longitude) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }
//     if (isNaN(latitude) || isNaN(longitude)) {
//         return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
//     }

//     const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
//     db.query(query, [name, address, latitude, longitude], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         res.status(201).json({ id: results.insertId, name, address, latitude, longitude });
//     });
// });

// // List Schools API
// app.get('/listSchools', (req, res) => {
//     const { latitude, longitude } = req.query;
//     if (!latitude || !longitude) {
//         return res.status(400).json({ message: 'Latitude and Longitude are required' });
//     }
//     if (isNaN(latitude) || isNaN(longitude)) {
//         return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
//     }

//     const userLat = parseFloat(latitude);
//     const userLong = parseFloat(longitude);

//     const query = `
//         SELECT id, name, address, latitude, longitude,
//         ( 3959 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
//         FROM schools
//         HAVING distance < 50
//         ORDER BY distance
//         LIMIT 0 , 20;
//     `;

//     db.query(query, [userLat, userLong, userLat], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         res.json(results);
//     });
// });


// // List All Schools API
// app.get('/getAllSchools', (req, res) => {
//     const query = 'SELECT id, name, address, latitude, longitude FROM schools';

//     db.query(query, (err, results) => {
//          if (err){
//             console.error("Database query error:", err.message);
//             console.error(err);
//             return res.status(500).json({ message: 'Database error' });
//         } 
//         res.json(results);
//     });
// });



// app.delete('/deleteSchool/:id', (req, res) => {
//     const { id } = req.params;

//     if (isNaN(id)) {
//         return res.status(400).json({ message: 'Invalid school ID' });
//     }

//     const query = 'DELETE FROM schools WHERE id = ?';
//     db.query(query, [id], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ message: 'School not found' });
//         }
//         res.status(200).json({ message: 'School deleted successfully' });
//     });
// });




// app.put('/updateSchool/:id', (req, res) => {
//     const { id } = req.params;
//     const { name, address, latitude, longitude } = req.body;

//     if (!name || !address || !latitude || !longitude) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }
//     if (isNaN(latitude) || isNaN(longitude)) {
//         return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
//     }

//     const query = 'UPDATE schools SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?';
//     db.query(query, [name, address, latitude, longitude, id], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ message: 'School not found' });
//         }
//         res.status(200).json({ message: 'School updated successfully' });
//     });
// });



// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




























const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
    connectionLimit: 10, // Adjust as needed
    // host: '127.0.0.1',
    // user: 'root',
    // password:'',
    // database: 'school_management'


    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Promisify for Node.js async/await.
const promisePool = pool.promise();

pool.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connection successful');
    }
});

// Home page route
app.get('/', (req, res) => {
    console.log("Hello from the homepage!");
    res.json({ message: 'Welcome to the School Management API!' });
});

// Add School API
app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    try {
        const [results] = await promisePool.query(query, [name, address, latitude, longitude]);
        res.status(201).json({ id: results.insertId, name, address, latitude, longitude });
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// List Schools API
app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
    }

    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    const query = `
        SELECT id, name, address, latitude, longitude,
        ( 3959 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
        FROM schools
        HAVING distance < 50
        ORDER BY distance
        LIMIT 0 , 20;
    `;

    try {
        const [results] = await promisePool.query(query, [userLat, userLong, userLat]);
        res.json(results);
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// List All Schools API
app.get('/getAllSchools', async (req, res) => {
    const query = 'SELECT id, name, address, latitude, longitude FROM schools';

    try {
        const [results] = await promisePool.query(query);
        res.json(results);
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// Delete School API
app.delete('/deleteSchool/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    const query = 'DELETE FROM schools WHERE id = ?';
    try {
        const [results] = await promisePool.query(query, [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json({ message: 'School deleted successfully' });
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update School API
app.put('/updateSchool/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
    }

    const query = 'UPDATE schools SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?';
    try {
        const [results] = await promisePool.query(query, [name, address, latitude, longitude, id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json({ message: 'School updated successfully' });
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

