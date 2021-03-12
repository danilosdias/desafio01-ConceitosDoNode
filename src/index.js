const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: "Username no Exists!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const verifyUser = users.find(user => user.username === username);

  if(verifyUser){
    return response.status(400).json({ error: "Username Exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const userTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(userTodo);

  return response.status(201).json(userTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodo = user.todos.find(todoId => todoId.id === id);

  if(!userTodo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  userTodo.title = title;
  userTodo.deadline = deadline;

  return response.status(201).json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userId = user.todos.find(todoId => todoId.id === id);

  if(!userId) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  userId.done = true;

  return response.status(201).json(userId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyTodo = user.todos.find(todoId => todoId.id === id);

  if(!verifyTodo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  user.todos.splice(verifyTodo, 1);

  return response.status(204).json(verifyTodo);
});

module.exports = app;