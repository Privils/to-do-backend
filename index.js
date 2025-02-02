const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const pool = require("./components/myDb");

app.use(express.json());


//function for posting user tasks into database
app.post("/tasks", async (request, response) => {
  const { title, description } = request.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    response.sendStatus(201).json(result.rows[0]);
  } catch (error) {
    response.sendStatus(500).json({ error: "error completing tasks" });
  }
});


//function for deleting tasks from database
app.delete("/tasks/:id", async (request, response) => {
  const { title, description } = request.body;
  try {
    const result = await pool.query(
      "DELET FROM task WHERE id = $1 RETURNNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Task not found" });
    }
    response.json({ message: "Task successfully deleted" });
  } catch (error) {
    response.sendStatus(500).json({ error: "Failed to delete task" });
  }
});


//functiong to fetch data from database
app.get("/", async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    response.json(result.rows);
  } catch (error) {
    response.sendStatus(500).json({ error: " failed to fetch task" });
  }
});

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});





















//destructuring
// app.get("/",(request, response)=>{
// const nuames = ["privilegde", "monalisa", "lucia"];
// const [first, second, third] = nuames;
// console.log(first, second, third)
// })
