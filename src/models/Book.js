const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['new', 'used', 'ebook']
    },
    category: {
        type: String,
        required: true,
        enum: ['pick', 'current']
    },
    imageUrl: {
        type: String,
        default: '/images/default-book.jpg'
    },
    originalImageName: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// updatedAt 필드 자동 업데이트
bookSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 