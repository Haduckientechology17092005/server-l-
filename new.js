const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

const authorize = (req, res, next) => {
  const authorization = req.headers['authorization'];
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authorization.split(' ')[1];
  const validToken = process.env.ACCESS_TOKEN || 'your_secure_token';
  if (token !== validToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

let users = [
  { id: 1, name: "User 1", email: "user1@example.com" },
  { id: 2, name: "User 2", email: "user2@example.com" },
  { id: 3, name: "User 3", email: "user3@example.com" }
];

app.get('/users', authorize, (req, res) => {
  console.log("GET all users - Query:", req.query);
  res.json(users);
});

app.get('/users/:id', authorize, (req, res) => {
  const userId = parseInt(req.params.id);
  console.log("GET user by ID - Params:", userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

app.post('/users', authorize, (req, res) => {
  console.log("POST new user - Body:", req.body);
  const { name, email } = req.body;
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/users/:id', authorize, (req, res) => {
  const userId = parseInt(req.params.id);
  console.log("PUT update user - Params:", userId, "Body:", req.body);
  const { name, email } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  users[userIndex] = { ...users[userIndex], name, email };
  res.json(users[userIndex]);
});

app.delete('/users/:id', authorize, (req, res) => {
  const userId = parseInt(req.params.id);
  console.log("DELETE user - Params:", userId);
  users = users.filter(u => u.id !== userId);
  res.status(204).end();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
