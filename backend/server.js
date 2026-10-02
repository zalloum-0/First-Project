// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
// Run:    node server.js   (restart it every time you change this file)
//
// Endpoints you need to build:
//   GET    /api/expenses        return all expenses
//   GET    /api/expenses/:id    return one expense (404 if not found)
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.



require("dotenv").config();

const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");


const pool = new Pool({
     host: process.env.DB_HOST,
     port : process.env.DB_PORT,
      user : process.env.DB_USER,
      password  : process.env.DB_PASSWORD,
       database : process.env.DB_NAME
    
});
const app = express();
app.use(cors());
app.use(express.json());


 /////////////////////////////////////get
app.get("/api/expenses", async (req, res) => {

    try {
        const result = await pool.query(`
            SELECT
                 id,
                title ,
                amount:: float8 AS amount ,
                category,
                to_char(date, 'DD-MM-YYYY') AS date
            FROM expenses
        `);

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = 3000;



///////////////////////////////////get id 

app.get("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid expense ID"
        });
    }

    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'DD-MM-YYYY') AS date
            FROM expenses
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});


////////////////////////////////////postt


app.post("/api/expenses", async (req, res) => {

    const { title, amount, category, date } = req.body;

    
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Invalid title"
        });
    }


    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            message: "Invalid amount"
        });
    }

    
    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

   
    if (typeof date !== "string") {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
        return res.status(400).json({
            message: "Date must be YYYY-MM-DD"
        });
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
    ) {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    
    try {
        const result = await pool.query(`
            INSERT INTO expenses (title, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'DD-MM-YYYY') AS date
        `, [title.trim(), amount, category, date]);

        return res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});



/////////////////////////////////////حعف

app.put("/api/expenses/:id", async (req, res) => {

    
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid expense ID"
        });
    }

    const { title, amount, category, date } = req.body || {};

    
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Invalid title"
        });
    }


    if (typeof amount !== "number" || !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            message: "Invalid amount"
        });
    }

    
    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    
    if (typeof date !== "string") {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
        return res.status(400).json({
            message: "Date must be YYYY-MM-DD"
        });
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
    ) {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    
    try {
        const result = await pool.query(`
            UPDATE expenses
            SET
                title = $1,
                amount = $2,
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'DD-MM-YYYY') AS date
        `, [title.trim(), amount, category, date, id]);

        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        
        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});




//////////////////////////////////// Delete

app.delete("/api/expenses/:id", async (req, res) => {

    const id = Number(req.params.id);

    
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid expense ID"
        });
    }

    try {
        const result = await pool.query(`
            DELETE FROM expenses
            WHERE id = $1
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        return res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});