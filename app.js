const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// load env
require("dotenv").config();

// database connection (Aiven safe)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// connect DB
db.connect(err => {
  if (err) {
    console.log("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL (Aiven)");
  }
});


// MAIN PAGE
app.get("/", (req, res) => {

  db.query("SELECT * FROM students", (err, results) => {

    if (err) {
      console.log("Query error:", err);
      return res.send("<h1>Database connection/query failed</h1>");
    }

    if (!results || !Array.isArray(results)) {
      return res.send("<h1>No data found</h1>");
    }

    let html = `
<html>
<head>
<title>Student System</title>

<style>
body {
  font-family: Arial;
  margin: 0;
  background: #f0f2f5;
}
.header {
  background: #1877f2;
  color: white;
  padding: 15px;
  font-size: 22px;
  font-weight: bold;
}
.container {
  width: 70%;
  margin: auto;
  margin-top: 30px;
}
.card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
}
input {
  padding: 10px;
  width: 95%;
  margin-top: 8px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}
button {
  background: #1877f2;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #166fe5;
}
.student {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}
.actions a {
  text-decoration: none;
  margin-right: 10px;
  font-weight: bold;
}
.edit { color: #1877f2; }
.delete { color: red; }
</style>

</head>

<body>

<div class="header">Student CRUD Dashboard</div>

<div class="container">

<div class="card">
<h2>Add Student</h2>

<form method="POST" action="/add">
Name:
<input name="stud_name" required>

Address:
<input name="stud_address" required>

Age:
<input name="age" required>

<button>Add Student</button>
</form>
</div>

<div class="card">
<h2>Student List</h2>
`;

    results.forEach(student => {
      html += `
<div class="student">
<b>${student.stud_name}</b><br>
Address: ${student.stud_address}<br>
Age: ${student.age}

<div class="actions">
<a class="edit" href="/edit/${student.stud_id}">Edit</a>
<a class="delete" href="/delete/${student.stud_id}">Delete</a>
</div>
</div>
`;
    });

    html += `
</div>
</div>
</body>
</html>
`;

    res.send(html);
  });

});


// ADD
app.post("/add", (req, res) => {

  const { stud_name, stud_address, age } = req.body;

  db.query(
    "INSERT INTO students (stud_name, stud_address, age) VALUES (?, ?, ?)",
    [stud_name, stud_address, age],
    (err) => {
      if (err) console.log("Insert error:", err);
      res.redirect("/");
    }
  );

});


// EDIT PAGE
app.get("/edit/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "SELECT * FROM students WHERE stud_id = ?",
    [id],
    (err, results) => {

      if (err || !results || results.length === 0) {
        return res.send("Student not found");
      }

      const student = results[0];

      res.send(`
<html>
<body>

<h2>Edit Student</h2>

<form method="POST" action="/update/${id}">
Name:
<input name="stud_name" value="${student.stud_name}">

Address:
<input name="stud_address" value="${student.stud_address}">

Age:
<input name="age" value="${student.age}">

<button>Update</button>
</form>

</body>
</html>
`);
    }
  );

});


// UPDATE
app.post("/update/:id", (req, res) => {

  const id = req.params.id;
  const { stud_name, stud_address, age } = req.body;

  db.query(
    "UPDATE students SET stud_name=?, stud_address=?, age=? WHERE stud_id=?",
    [stud_name, stud_address, age, id],
    (err) => {
      if (err) console.log("Update error:", err);
      res.redirect("/");
    }
  );

});


// DELETE
app.get("/delete/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM students WHERE stud_id=?",
    [id],
    (err) => {
      if (err) console.log("Delete error:", err);
      res.redirect("/");
    }
  );

});


// START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
}); 