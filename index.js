const express = require("express");
const cors = require("cors");
const promisePool = require("./components/myDb");  // Import the promisePool from dbConnection

const app = express();
const port = 4000;

const allowedOrigins = [
  "http://localhost:5500", // or the URL of your local server
  "http://localhost:3000", // for React if you are running it locally
  "https://privils.github.io", // if using GitHub Pages for frontend
  "http://127.0.0.1:5500", // update this for your production URL
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not Allowed by CORS"));
      }
    },
    credentials: true,
  })
); 

app.use(express.json());

// ✅ Ensure users and tasks tables exist in MariaDB
const createTables = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log("Tables created or already exist.");
  } catch (error) {
    console.error("Error creating tables:", error.message || error);
  }
};
createTables();

// ✅ Create user if not exists
app.post("/api/users", async (req, res) => {
  const { id } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await promisePool.query("SELECT * FROM users WHERE id = ?", [id]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const [result] = await promisePool.query(
      "INSERT INTO users(id) VALUES(?)", 
      [id]
    );

    console.log(`User created with ID: ${result.insertId}`);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ✅ Check if a user exists
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await promisePool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (result.length > 0) {
      res.status(200).json(result); // User exists
    } else {
      res.status(404).json({ message: "User not found" }); // User does not exist
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ error: "Failed to check user existence" });
  }
});

// ✅ Fetch tasks for a user
app.get("/api/tasks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const [result] = await promisePool.query("SELECT * FROM tasks WHERE user_id = ?", [userId]);
    res.json(result);
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
    const [userCheck] = await promisePool.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (userCheck.length === 0) {
      // If the user does not exist, create the user
      console.log("User not found, creating user...");
      await promisePool.query("INSERT INTO users(id) VALUES (?)", [userId]);
    }

    // Proceed with adding the task
    await promisePool.query("INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)", [title, description, userId]);
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
    const [result] = await promisePool.query("DELETE FROM tasks WHERE id = ? LIMIT 1", [id]);
    if (result.affectedRows === 0) {
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
