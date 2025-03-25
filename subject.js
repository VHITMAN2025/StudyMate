document.addEventListener('DOMContentLoaded', () => {
    const semesters = 8;
    const semesterList = document.getElementById('semester-list');

    for (let i = 1; i <= semesters; i++) {
        const button = document.createElement('button');
        button.textContent = `Semester ${i}`;
        button.addEventListener('click', () => fetchSubjects(i));
        semesterList.appendChild(button);
    }
});

async function fetchSubjects(sem) {
    const regulation = '2022'; // Example regulation
    const branch = 'CSE'; // Example branch
    const url = `/${regulation}/branch/${branch}/sem/${sem}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Subjects not found.');

        const data = await response.json();
        displaySubjects(data.semester, data.subjects);
    } catch (error) {
        alert(error.message);
    }
}

function displaySubjects(sem, subjects) {
    const container = document.getElementById('subjects-container');
    const title = document.getElementById('subjects-title');
    const list = document.getElementById('subjects-list');

    title.textContent = `Subjects for Semester ${sem}`;
    list.innerHTML = '';
    subjects.forEach(subject => {
        const li = document.createElement('li');
        li.textContent = subject;
        list.appendChild(li);
    });

    container.style.display = 'block';
}


require('dotenv').config(); // For environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/subjectsDB';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Subject Schema and Model
const subjectSchema = new mongoose.Schema({
    regulation: String,
    branch: String,
    semester: String,
    subjects: [String],
});

const Subject = mongoose.model('Subject', subjectSchema);

// API Routes
app.get('/:regulation/branch/:branch/sem/:sem', async (req, res) => {
    const { regulation, branch, sem } = req.params;

    try {
        const result = await Subject.findOne({
            regulation: regulation.toUpperCase(),
            branch: branch.toUpperCase(),
            semester: sem,
        });

        if (result) {
            res.json({
                regulation: result.regulation,
                branch: result.branch,
                semester: result.semester,
                subjects: result.subjects,
            });
        } else {
            res.status(404).send(`Subjects not found for regulation '${regulation}', branch '${branch}', and semester '${sem}'.`);
        }
    } catch (error) {
        res.status(500).send('Error fetching data: ' + error.message);
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
