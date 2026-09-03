require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connected successfully."))
    .catch((err) => console.error("Database connection error:", err));

app.use(cors());
app.use(express.json());

const user = require('./models/users');
const task = require('./models/tasks');

// Ping controller
app.get('/api/ping', (req, res) => {
    res.json({ message: "Server is running." });
});

// GET list all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await user.find();
        res.json(users);
    } catch(err) {
        res.status(500).json({ error: "get users error", details: err.message });
    }
});

// POST create new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new user({ name, email, password });
        await newUser.save();

        res.status(201).json({
            message: "User created successfully",
            data: newUser
        });
    } catch (err) {
        res.status(400).json({ error: "create user error", details: err.message });
    }
});

// GET list all tasks 
app.get('/api/tasks', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.userId = userId; 
        }
        const tasks = await task.find(query);
        res.json(tasks);
    } catch (err) {
        console.error("DETAYLI HATA:", err); 
        res.status(500).json({ error: "Tasks could not be retrieved", details: err.message });
    }
});

// POST create new task (category ve priority alanları eklendi)
app.post('/api/tasks', async (req, res) => {
    try {
        const { text, completed, date, category, priority, userId } = req.body; 
        
        const newTask = new task({ 
            text, 
            completed, 
            date, 
            category, 
            priority, 
            userId 
        }); 

        await newTask.save();
        console.log("New task saved to database:", newTask);

        res.status(201).json({
            message: "Task created successfully",
            data: newTask
        });
    } catch (err) {
        res.status(400).json({ error: "create task error", details: err.message });
    }
});

// DELETE delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        await task.findByIdAndDelete(taskId);
        console.log("Task deleted from database:", taskId);
        res.json({ message: "Task deleted successfully", id: taskId });
    } catch (err) {
        res.status(500).json({ error: "Task could not be deleted" });
    }
});

// PUT update task 
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedTask = await task.findByIdAndUpdate(
            taskId,
            { 
                text: req.body.text, 
                completed: req.body.completed,
                category: req.body.category,
                priority: req.body.priority,
                date: req.body.date
            },
            { new: true } 
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found!" });
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: "Task could not be updated" });
    }
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});