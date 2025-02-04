const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = require("./components/myDb");
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// ✅ Ensure users table exists
const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Tables created or already exist.");
    } catch (error) {
        console.error("Error creating tables:", error);
    }
};
createTables();

// ✅ Create user if not exists
app.post('/api/users', async (req, res) => {
  const { id } = req.body;

  try {
      const result = await pool.query(
          'INSERT INTO users(id) VALUES($1) RETURNING *', 
          [id]
      );
      
      console.log(`User created with ID: ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
  }
});

// ✅ Check if a user exists
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows); // User exists
        } else {
            res.status(404).json({ message: "User not found" }); // User does not exist
        }
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ error: 'Failed to check user existence' });
    }
});

// ✅ Fetch tasks for a user
app.get("/api/tasks", async (req, res) => {
    const { userId } = req.query; 
    if (!userId) return res.status(400).json({ error: "Invalid user ID" });

    try {
        const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});





// ✅ Add a new task
app.post("/api/tasks", async (req, res) => {
  const { title, description, userId } = req.body;
  if (!title || !description || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      // Check if the user exists
      const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      
      if (userCheck.rows.length === 0) {
          // If the user does not exist, create the user
          console.log("User not found, creating user...");
          await pool.query("INSERT INTO users(id) VALUES ($1)", [userId]);
      }

      // Proceed with adding the task
      await pool.query("INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3)", [title, description, userId]);
      res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
      console.error("Error adding task:", error);
      res.status(500).json({ error: "Failed to add task", details: error.message });
  }
});

 

// ✅ Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ message: "Task successfully deleted" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
