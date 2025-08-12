const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'calendar_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err);
        process.exit(1);
    }
    console.log('✅ MySQL Connected');
});

// Return all events with formatted date (YYYY-MM-DD)
app.get('/events', (req, res) => {
    db.query(
      'SELECT id, title, description, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM events',
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
      }
    );
});

// Return events for a specific date (formatted)
app.get('/events/:date', (req, res) => {
    const { date } = req.params;
    db.query(
      'SELECT id, title, description, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM events WHERE date = ?',
      [date],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
      }
    );
});

// Insert new event
app.post('/events', (req, res) => {
    const { date, title, description } = req.body;
    if (!date || !title) {
        return res.status(400).json({ error: 'Date and title are required' });
    }
    db.query(
        'INSERT INTO events (date, title, description) VALUES (?, ?, ?)',
        [date, title, description || ''],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Insert failed' });
            }
            res.json({ message: 'Event added successfully', eventId: result.insertId });
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
