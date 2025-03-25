const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 1234;

// MongoDB Atlas connection URL
const url = 'mongodb+srv://HITMAN:HITMAN2025@cluster0.mo4bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(url)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the File schema
const fileSchema = mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
    sem: Number  // Changed "semester" to "sem"
});

// Create the File model
const fileModel = mongoose.model('File', fileSchema);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the practice.html file when visiting the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'practice.html'));
});

app.get('/sem/:sem', async (req, res) => {
    const sem = req.params.sem;
    try {
        const files = await fileModel.find({ sem: sem }, 'name _id');  // Changed "semester" to "sem"
        let fileListHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Semester ${sem} Files</title>
                <style>
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
                <h1>Files for Semester ${sem}</h1>
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

// Route to view file by ID
app.get('/view-file/:id', async (req, res) => {
    const fileId = req.params.id;
    try {
        const file = await fileModel.findById(fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }

        // Set the appropriate content type and send the file data
        res.contentType(file.contentType);
        res.send(file.data);
    } catch (err) {
        console.error('Error fetching file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to upload a file
app.post('/upload', upload.single('file'), async (req, res) => {
    const newFile = new fileModel({
        name: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype,
        sem: req.body.sem  // Assuming you pass 'sem' as part of the form data
    });

    try {
        await newFile.save();
        res.send('File uploaded successfully');
    } catch (err) {
        console.error('Error saving file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
