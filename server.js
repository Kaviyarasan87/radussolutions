const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Set up body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (CSS, images)
app.use(express.static('public'));

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',  // Use your MySQL password
  database: 'userTextDB'  // Database you created earlier
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Sanitize output to prevent XSS (cross-site scripting)
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// Route to display homepage with submitted texts and search functionality
app.get('/', (req, res) => {
  const searchQuery = req.query.q ? `%${req.query.q}%` : '%';
  const query = 'SELECT * FROM texts WHERE content LIKE ? ORDER BY created_at DESC';
  db.query(query, [searchQuery], (err, results) => {
    if (err) throw err;
    res.render('index', { texts: results, search: req.query.q || '' });
  });
});

// Route to handle form submission (new entry)
app.post('/submit', (req, res) => {
  const { text } = req.body;
  const query = 'INSERT INTO texts (content) VALUES (?)';
  db.query(query, [text], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Route to handle text editing
app.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const query = 'UPDATE texts SET content = ? WHERE id = ?';
  db.query(query, [text, id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Route to handle text deletion
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM texts WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
