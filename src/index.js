require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const port = 8080;
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const todoFilePath = process.env.BASE_JSON_PATH;
const {body,validationResult } = require('express-validator');
const req = require('express/lib/request');

//Read todos from todos.json into variable
let todos = require(__dirname + todoFilePath);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

// To Get index page
app.get("/", (_, res) => {
  res.status(200)
    // Status code chaged to 200 based on the Get description on criteria
  res.sendFile("./public/index.html", { root: __dirname });
  
  // res.status(501).end();
});
// commenting out line 21-24 and line 28-32)

// To Get all Todos
app.get('/todos', (_, res) => {
  res.status(200)
  res.header("Content-Type","application/json");
  res.sendFile(todoFilePath, { root: __dirname });
  
  //res.status(501).end();
});

// To GET request with path '/todos/overdue'
app.get('/todos/overdue', (req, res) => {
    const today = new Date();
    const overdue = todos.filter(function(todo) {
      const dueDate = new Date(todo.due);
      return dueDate < today;
    });
    
    return res.json(overdue);
  });

//GET request with path '/todos/completed'
app.get('/todos/completed', (req, res) => {
    const completed = todos.filter(todo => todo.completed);
    return res.json(completed);
  });
  

// POST request with path '/todos'i.e to Create a new Todo
app.post('/todos',
body('name').notEmpty(),
body('due').isDate(),
(req, res) => {
	const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
	const todo = {
		id: uuidv4(),
		name: req.body.name,
		created: new Date(),
		due: req.body.due,
		completed: false
	};
	todos.push(todo);
	fs.writeFile(__dirname + todoFilePath, JSON.stringify(todos), (error) => {
	if (error) {
		  return res.status(500).json({
			'message': error.message
		});
	  }
	  
	  return res.status(201).json({
		  "message": "ok!"		
	  });
  });
});

// Get single todo
app.get('/todos/:id', (req, res) => {
    todo = todos.find(todo => todo.id==req.params.id);
    if(todo) {
        return res.json(todo);
    }
    return res.status(404).json({
        "message": "Todo not found",
        "id": req.params.id
    });
});

//PATCH request with path '/todos/:id
app.patch("/todos/:id", (req, res) => {
	todo = todos.find(todo => todo.id==req.params.id);
	
	 if(todo) {
		 todos.forEach(todo => {
			if (todo.id==req.params.id) {
				todo.due = req.body.due;
				todo.name = req.body.name;
			}
		});
	}
	
	fs.writeFile(__dirname + todoFilePath, JSON.stringify(todos), (error) => {
	if (error) {
		  return res.status(500).json({
			'message': error.message
		});
	  }
	  
	  return res.status(201).json({
		  "message": "ok!"		
	  });
  });
});


//POST request with path '/todos/:id/complete
app.post('/todos/:id/complete', (req, res) => {
    todos.forEach(todo => {
        if (todo.id==req.params.id) {
            todo.completed = true;
        }
    });
    
    fs.writeFile(__dirname + todoFilePath, JSON.stringify(todos), (error) => {
      if (error) {
            return res.status(500).json({
              'message': error.message
          });
        }
        
        return res.status(201).json({
            "message": "ok!"		
        });
    });
  });
  
//POST request with path '/todos/:id/undo
app.post('/todos/:id/undo', (req, res) => {
    todos.forEach(todo => {
        if (todo.id==req.params.id) {
            todo.completed = false;
        }
    });
    
    fs.writeFile(__dirname + todoFilePath, JSON.stringify(todos), (error) => {
      if (error) {
            return res.status(500).json({
              'message': error.message
          });
        }
        
        return res.status(200).json({
            "message": "ok!"		
        });
    });
  });

// DELETE request with path '/todos/:id
app.delete('/todos/:id', (req, res) => {
	todos.forEach(function(todo, index) {
		if(todo.id==req.params.id) {
			todos.splice(index, 1);
		}
	});
	fs.writeFile(__dirname + todoFilePath, JSON.stringify(todos), (error) => {
	if (error) {
		  return res.status(500).json({
			'message': error.message
		});
	  }
	  
	  return res.status(200).json({
		  "message": "ok!"		
	  });
  });
});

app.listen(port, function () {
    console.log(`Node server is running... http://localhost:${port}`);
});

module.exports = app;