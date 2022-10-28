let express = require("express");
let app = express();
module.exports = app;

app.use(express.json());
let sqlite = require("sqlite");
let sqlite3 = require("sqlite3");

let { open } = sqlite;
let path = require("path");
let dbpath = path.join(__dirname, "todoApplication.db");

let db = null;
let intializeDBAndServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server Started at http://localhost:3000/");
  });
};
intializeDBAndServer();

//API-(1) GET
//scenario-1

app.get("/todos/", async (request, response) => {
  let { status } = request.query;
  let sqlQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                status = '${status}';    
        `;
  let array = await db.all(sqlQuery);
  response.send(array);
});

//API-(1) GET
//scenario-2

app.get("/todos/", async (request, response) => {
  let { priority } = request.query;
  let sqlQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                priority = ${priority};    
        `;
  let array = await db.all(sqlQuery);
  response.send(array);
});

//API-(1) GET
//scenario-3

app.get("/todos/", async (request, response) => {
  let { priority, status } = request.query;
  let sqlQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                priority = ${priority}
                AND 
                status = ${status};   
        `;
  let array = await db.all(sqlQuery);
  response.send(array);
});

//API-(1) GET
//scenario-4

app.get("/todos/", async (request, response) => {
  let { search_q } = request.query;
  let sqlQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%';   
        `;
  let array = await db.all(sqlQuery);
  response.send(array);
});

//API-(2) GET
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let getTodoQuery = `
  SELECT 
  * 
  FROM 
  todo 
  WHERE 
  id = ${todoId};`;
  let dbObject = await db.get(getTodoQuery);

  response.send(dbObject);
});

//API-(3) POST

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status } = request.body;
  let getTodoQuery = `
    INSERT INTO 
    todo (id,todo,priority,status)
    VALUES
    (
        '${id}',
        '${todo}',
        '${priority}',
        '${status}'
    );
 
`;
  await db.get(getTodoQuery);
  response.send("Todo Successfully Added");
});

//API-(4)PUT scenario-1
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { status } = request.body;
  let getTodoQuery = `
   UPDATE 
    todo
   SET 
    status = '${status}'
   WHERE 
    id = ${todoId}; 
`;
  await db.run(getTodoQuery);
  response.send("Status Updated");
});

//API-(4)PUT scenario-2
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { priority } = request.body;
  let getTodoQuery = `
   UPDATE 
    todo
   SET 
    priority = '${priority}'
   WHERE 
    id = ${todoId}; 
`;
  await db.run(getTodoQuery);
  response.send("Priority Updated");
});

//API-(4)PUT scenario-3
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { todo } = request.body;
  let getTodoQuery = `
   UPDATE 
    todo
   SET 
    todo = '${todo}'
   WHERE 
    id = ${todoId}; 
`;
  let id = await db.run(getTodoQuery);
  let lastId = id.lastID;

  response.send("Todo Updated");
});

//API-(5)DELETE
app.delete("/todos/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let deleteTodoQuery = `
    DELETE
    FROM 
    todo
    WHERE 
    id = ${todoId};`;
    await db.run(deleteTodoQuery);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});
