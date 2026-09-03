const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    date: { type: String },
    category: { type: String, default: 'Work' }, 
    priority: { type: String, default: 'medium' }, 
    userId: { type: mongoose.Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('Task', taskSchema);