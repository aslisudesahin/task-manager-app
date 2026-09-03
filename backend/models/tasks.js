const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    date: { type: String },
    category: { type: String, default: 'Work' }, // Kategori alanı
    priority: { type: String, default: 'medium' }, // Öncelik alanı
    userId: { type: mongoose.Schema.Types.Mixed, required: true } // Kullanıcı ID eşleşmesi için
});

module.exports = mongoose.model('Task', taskSchema);