const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const port = 8000;

const mongoURI = 'mongodb+srv://HITMAN:HITMAN2025@cluster0.mo4bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => console.error(err));
  const fileSchema = mongoose.Schema({
    name: String,
    filename: String,
    data: Buffer,
    contentType: String,
    sem: Number,
    branch: String,
    regulation: String,
    subject:String,
    uploadedBy: String // Ensure this field is included
  });
  
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const File = mongoose.model('File', fileSchema);
const User = mongoose.model('User', userSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for sessions
app.use(session({
  secret: 'mySuperSecretKey123!@#', // Replace with a strong and unique secret key
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoURI }),
  cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}));


function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login_page.html'));
});

app.get('/file-management', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'file-management.html'));
});

app.get('/regulations', isAuthenticated,async(req,res) =>
{
  res.sendFile(path.join(__dirname,'regulations.html'));
});

app.get('/branch', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'branch.html'));
});

app.get('/regulations/:regulation/branch/:branch',isAuthenticated, async (req, res) => {
  const regulation = req.params.regulation;
  const branch = req.params.branch;
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

app.get('/regulations/:regulation',async(req,res)=>
{
  res.sendFile(path.join(__dirname,'branch.html'))
  res.sendStatus
});

app.get('/semesters', async (req, res) => {
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

app.get('/subject', async (req, res) => {
  res.sendFile(path.join(__dirname, 'subjects.html'));
});

app.get('/:regulation/branch', async (req, res) => {
  res.sendFile(path.join(__dirname, 'branch.html'));
});

app.get('/:regulation/branch/:branch', async (req, res) => {
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

app.get('/:regulation/branch/:branch/sem/:sem', async (req, res) => {
  res.sendFile(path.join(__dirname, 'subjects.html'));
});

app.get('/:regulation/branch/:branch/sem/:sem/subject/:subject', async (req, res) => {
  const regulation = req.params.regulation;
  const branch = req.params.branch;
  const sem = req.params.sem;
  const subject = req.params.subject;

  try {
    const files = await File.find({ regulation: regulation, sem: sem, branch: branch,subject: subject }, 'filename _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Regulation ${regulation}, Branch ${branch}, and Semester ${sem}</title>
        <style>
          body { 
          color: black; 
           background: linear-gradient(135deg, #b32271, #d5d818);
          }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid black; }
          th, td { padding: 10px; text-align: left; font-size : 25px;}
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #b37af0, #e2ac47); /* Gradient background */
            color: #fff;
            text-align: center;
        }

        h1 {
            margin: 20px 0;
            font-size: 2.5rem;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        }

        /* Table Styling */
        table {
            width: 90%; /* Center the table and limit its width */
            margin: 20px auto; /* Center the table horizontally */
            border-collapse: collapse;
            background-color: #fff; /* Table background */
            color: #333; /* Text color */
            border-radius: 10px; /* Rounded corners */
            overflow: hidden; /* Ensure rounded corners are visible */
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Shadow for depth */
        }

        table, th, td {
            border: 1px solid #ddd; /* Light border */
        }

        th {
            background-color: #f02626; /* Green header */
            color: white;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 15px;
        }

        td {
            padding: 15px;
            text-align: left;
            font-size: 0.9rem;
        }

        tr:nth-child(even) {
            background-color: #ee9f9f; /* Light gray for alternating rows */
        }

        tr:nth-child(odd) {
            background-color: #e29c9c; /* White for other rows */
        }

        tr:hover {
            background-color: #d88181; /* Highlight row on hover */
        }

        /* Link Styling */
        td a {
            text-decoration: none;
            color: #4c9baf;
            font-weight: bold;
            transition: color 0.3s ease;
        }

        td a:hover {
            color: #e8eb52; /* Darker green on hover */
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            table, th, td {
                font-size: 0.8rem; /* Reduce font size for smaller screens */
            }

            th, td {
                padding: 10px;
            }
        }
            td{font-size: 25px;}
        </style>
      </head>
      <body>
        <h1>Files for Regulation ${regulation}, Branch ${branch}, and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.filename}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});

// test driven code
app.get('/regulation/:/regulation/branch/sem/:sem/subject/:subject', async (req, res) => {
  const sem = req.params.sem;
  const branch = req.params.branch;
  const regulation = req.params.regulation;
  const subject = req.params.subject;
  try {

    const files = await File.find({ regulations: regulation ,sem: sem, branch: branch,subject: subject }, 'filename _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Branch ${branch} and Semester ${sem}</title>
        <style>
          body {
            color: black;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>Files for Branch ${branch} and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.filename}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.put('/rename-file/:id', async (req, res) => {
  const fileId = req.params.id;
  const newFilename = req.body.filename;
  try {
    const file = await File.findById(fileId);
    if (file) {
      file.filename = newFilename;
      await file.save();
      res.send('Filename updated successfully');
    } else {
      res.status(404).send('File not found');
    }
  } catch (err) {
    console.error('Error renaming file:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/get-username/:id', async (req, res) => {
  const userId = req.params.id; // Extracting the ID from the URL parameters
  try {
    const user = await User.findById(userId); // Fetching the user by ID
    if (user) {
      res.json({ username: user.username });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).send('Error fetching username');
  }
});


app.get('/sem/:sem', async (req, res) => {
  const sem = req.params.sem;
  const branch = req.query.branch; 
  try {
    const files = await File.find({ sem: sem, branch: branch }, 'name _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Branch ${branch} and Semester ${sem}</title>
        <style>
        body {
          color: red;
        }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>Files for Branch ${branch} and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.name}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const sem = req.body.sem;
  const branch = req.body.branch;
  const regulation = req.body.regulation;
  const filename = req.body.filename;
  const subject = req.body.subject;
  const uploadedBy = req.body.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  File.findOne({ filename: filename })
    .then(existingFile => {
      if (existingFile) {
        return res.status(400).send('File with this filename already exists.');
      }

      const newFile = new File({
        name: file.originalname,
        filename: filename,
        data: file.buffer,
        contentType: file.mimetype,
        sem: sem,
        branch: branch,
        regulation: regulation,
        subject:subject,
        uploadedBy: uploadedBy
      });

      return newFile.save();
    })
    .then(savedFile => {
      if (savedFile) {
        res.send(`File uploaded and inserted successfully!`)
      }
    })
    .catch(err => {
      console.error('Error saving file:', err);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    });
});


app.get('/view-file/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send('File not found');
    }
    res.contentType(file.contentType);
    res.send(file.data);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/delete-file/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).send('File not found');
    }
    res.status(200).send('File deleted successfully');
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/files', async (req, res) => {
  const userId = req.query.userId;
  try {
    const files = await File.find({ uploadedBy: userId }, 'filename _id');
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login_page.html'));
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });

  
  User.findOne({ username: username })
    .then(existingFile => {
      if (existingFile) {
        return res.status(400).send('User already exists try log in');
      }
      else
      {
        newUser.save()
    .then(() => {
      // res.status(200).send(`Username: ${username}, Password: ${password} saved successfully`);
       res.sendFile(path.join(__dirname,'login_page.html'))
    })
    .catch(err => {
      res.status(500).send('Error saving user data');
    });
  }
      })
});
app.post('/login', (req, res) => {
  const teachers = ['vijay', 'yoshitha','harsha'];
  const { username, password } = req.body;

  User.findOne({ username, password })
    .then(user => {
      if (user) {
        req.session.user = user; // Set the user information in the session
        const userId = user._id; // Assuming '_id' is the user ID field in your database
        if (teachers.includes(username)) {
          res.redirect(`/file-management?userId=${userId}`);
        } else {
          res.redirect(`/regulations?userId=${userId}`);
        }
      } else {
        res.status(401).send(`
          <html>
          <head>
              <title>Login Status</title>
              <style>
                  body {
                      background: linear-gradient(135deg, #b32271, #d5d818);
                  }
                  h1 {
                      color: #ffffff;
                  }
              </style>
          </head>
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

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
