const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(5050, () => {
            console.log("Server Running at http://localhost:5050/");
        });
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }

};


app.get('/', (request, response) => {
    response.send("Hello World!");
});

/*
app.get('/books/', (request, response) => {
    response.send("Hello World!");
});
*/

// get all users (with limit and offset as query parameters)
app.get('/users/', async (request, response) => {
    const { offset, limit } = request.query;
    // path parameters are available in request.params object
    // HTTP Request body is available as request.body
    // Query parameters are available in request.query object
    const getUsersQuery = `
    SELECT
     *
    FROM
     user${limit?(' LIMIT '+ limit + (offset?(' OFFSET ' + offset):'')):''};`;
    
    // all() method is used to get the data of multiple rows
    const usersArray = await db.all(getUsersQuery);
    response.send(usersArray);
});


// get a specific user and here the userId is a path parameter
app.get('/users/:userId/', async (request, response) => {
    const { userId } = request.params;
    const getUserQuery = `
    SELECT
     *
    FROM
     user
    WHERE
     user_id = ${userId};`;
    
     // get() is used to get the data of a single row
    const user = await db.get(getUserQuery);
    response.send(user);
});

// update a specific user and here the userId is a path parameter
app.put('/users/:userId/', async (request, response) => {
    const { userId } = request.params;
    const userDetails = request.body;
    const { name, gender, age } = userDetails;

    const updateUserQuery = `
    UPDATE user
    SET
     name="${name}",
     gender="${gender}",
     age=${age}
    WHERE user_id=${userId};`

    // this run() method is used to create or update table data
    await db.run(updateUserQuery);
    // the primary key of newly added row is lastID
    response.send({ message: "Update Success" });
});

// delete a specific user and here the userId is a path parameter
app.delete('/users/:userId/', async (request, response) => {
    const { userId } = request.params;

    const updateUserQuery = `
    DELETE FROM user
    WHERE user_id=${userId};`

    // this run() method is used to create or update table data
    await db.run(updateUserQuery);
    // the primary key of newly added row is lastID
    response.send({ message: "User Deleted Successfully" });
});

// add a new user
app.post('/users/', async (request, response) => {
    const userDetails = request.body;
    const { name, gender, age } = userDetails;

    const addUserQuery = `
    INSERT INTO user(name, gender, age)
    VALUES ("${name}", "${gender}", ${age});`;

    // this run() method is used to create or update table data
    const dbResponse = await db.run(addUserQuery);
    // the primary key of newly added row is lastID
    const userId = dbResponse.lastID;
    response.send({ userId: userId, message: "Success" });
});

initializeDbAndServer();