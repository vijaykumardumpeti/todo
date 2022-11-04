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
  let hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  let hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  let hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  let { id, todo, priority, status, search_q = "" } = request.query;
  let data = null; //instead of 0 value we use null in js
  let sqlQuery = "";

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      sqlQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE
                    priority = '${priority}'
                    AND
                    status = '${status}';`;
      break;

    case hasPriorityProperty(request.query):
      sqlQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE
                    priority = '${priority}';`;
      break;

    case hasStatusProperty(request.query):
      sqlQuery = `
               SELECT 
                *
                FROM 
                    todo
                WHERE
                    status = '${status}';`;
      break;

    default:
      sqlQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE
                    todo LIKE '%${search_q}%';`;
      break;
  }

  data = await db.all(sqlQuery);
  console.log(data);
  response.send(data);
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
  console.log(dbObject);
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
  let { id, todo, priority, status } = request.body;

  let sqlUpdateQuery = "";
  let column = "";
  let dbObject = null;
  if (request.body.status !== undefined) {
    sqlUpdateQuery = `
    UPDATE 
    todo
    SET 
    status = '${status}'
    WHERE 
    id = '${todoId}';`;

    column = "Status";
  }
  if (request.body.priority !== undefined) {
    sqlUpdateQuery = `
    UPDATE 
    todo
    SET 
    priority = '${priority}'
    WHERE 
    id = '${todoId}';`;

    column = "Priority";
  }
  if (request.body.todo !== undefined) {
    sqlUpdateQuery = `
    UPDATE 
    todo
    SET 
    todo = '${todo}'
    WHERE 
    id = '${todoId}';`;

    column = "Todo";
  }

  dbObject = await db.run(sqlUpdateQuery);
  response.send(`${column} Updated`);
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


