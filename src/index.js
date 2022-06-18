const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  try {
    const { username } = request.headers;
    const user = users.find((user) => user.username === username);
    if (!user) return response.status(404).json({ message: 'Usuário não existe!'})
    next()
  } catch (error) {
    return response.status(400).json(error);
  }
}

app.post('/users', (request, response) => {
  try {
    const { name, username } = request.body;
    const user = users.find((user) => user.username === username);
    if (user) return response.status(400).json({ error: 'Mensagem do erro'});
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    };
    users.push(newUser)
    return response.status(201).json(newUser);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const user = users.find((user) => user.username === username);
    return response.status(200).json(user.todos);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { username } = request.headers;
    const user = users.find((user) => user.username === username);
    const task = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }
    user.todos.push(task)
    return response.status(201).json(task);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;
    const { title, deadline } = request.body;
    const user = users.find((user) => user.username === username);
    const index = user.todos.findIndex((task) => task.id === id);
    if (!user.todos[index]) return response.status(404).json({ error: 'Mensagem do erro'});
    user.todos[index].title = title;
    user.todos[index].deadline = new Date(deadline);
    return response.status(202).json(user.todos[index])
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;
    const user = users.find((user) => user.username === username);
    const index = user.todos.findIndex((task) => task.id === id);
    if (!user.todos[index]) return response.status(404).json({ error: 'Mensagem do erro'});
    user.todos[index] = {
      ...user.todos[index],
      done: true
    }
    return response.status(202).json(user.todos[index])
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;
    const user = users.find((user) => user.username === username);
    const index = user.todos.findIndex((task) => task.id === id);
    if (!user.todos[index]) return response.status(404).json({ error: 'Mensagem do erro'});
    user.todos.splice(index, 1)
    return response.status(204).json(user.todos[index])
  } catch (error) {
    return response.status(400).json(error);
  }
});

module.exports = app;