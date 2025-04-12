const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['new', 'best', 'free', 'general']
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    downloads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ebook', ebookSchema); 