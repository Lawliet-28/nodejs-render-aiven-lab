const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection (replace later with Aiven credentials)
const db = mysql.createConnection({
    host: 'mysql-e245887-linuelleogan7-a3f8.j.aivencloud.com',
    user: 'avnadmin',
    password: '',
    database: 'defaultdb',
    port: 17255
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }
    console.log('Database Connected Successfully');
});

app.get('/', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            res.send('Database connection failed');
        } else {
            res.send('Database Connected Successfully');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});