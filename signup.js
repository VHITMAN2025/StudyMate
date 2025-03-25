const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const mongoURI = 'mongodb+srv://HITMAN:HITMAN2025@cluster0.mo4bh.mongodb.net/myDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const filepath = path.join(__dirname, 'signup.html');
  res.sendFile(filepath);
});

app.get('/authenticate_style.css', (req, res) => {
  const filepath = path.join(__dirname, '/authenticate_style.css');
  res.sendFile(filepath);
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });
  newUser.save()
    .then(() => {
      res.status(200).send(`Username: ${username}, Password: ${password} saved successfully`);
    })
    .catch(err => {
      res.status(500).send('Error saving user data');
    });
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
