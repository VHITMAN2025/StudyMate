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
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
  const filepath = path.join(__dirname, 'signup.html');
  res.sendFile(filepath);
});

app.get('/login', (req, res) => {
  const filepath = path.join(__dirname, 'login_page.html');
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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username, password })
    .then(user => {
      if (user) {
        res.redirect('/welcome'); // Redirect to welcome page on successful login
      } else {
        res.status(401).send(`
          <html>
            <head><title>Login Status</title></head>
            <body>
              <h1>Invalid username or password</h1>
            </body>
          </html>
        `);
      }
    })
    .catch(err => {
      res.status(500).send('Error logging in');
    });
});

app.get('/welcome', (req, res) => {
  const filepath = path.join(__dirname, 'welcome.html'); // Serve the welcome page
  res.sendFile(filepath);
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

const port = 1431;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
