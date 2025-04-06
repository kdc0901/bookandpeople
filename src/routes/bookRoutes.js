const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Book = require('../models/Book');

// 미들웨어: 관리자 권한 확인
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
};

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/uploads/books');
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});

// 관리자 도서 관리 페이지
router.get('/admin/books', isAdmin, async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.render('admin-books', { 
            title: '도서 관리',
            books: books,
            user: req.session.user
        });
    } catch (error) {
        console.error('도서 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 도서 목록 조회
router.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error('도서 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 도서 추가
router.post('/api/books', isAdmin, async (req, res) => {
    try {
        const { title, author, price, type } = req.body;
        
        const book = new Book({
            title,
            author,
            price,
            type,
            imageUrl: '/images/default-book.jpg'
        });

        await book.save();
        res.status(201).json({ 
            success: true,
            message: '도서가 추가되었습니다.',
            book: book
        });
    } catch (error) {
        console.error('도서 추가 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 도서 수정
router.put('/api/books/:id', isAdmin, async (req, res) => {
    try {
        const { title, author, price, type } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, price, type },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        res.json({ 
            success: true,
            message: '도서가 수정되었습니다.',
            book: book
        });
    } catch (error) {
        console.error('도서 수정 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 도서 삭제
router.delete('/api/books/:id', isAdmin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        // 기본 이미지가 아닌 경우 이미지 파일 삭제
        if (book.imageUrl && book.imageUrl !== '/images/default-book.jpg') {
            const imagePath = path.join(__dirname, '../../public', book.imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (error) {
                console.error('이미지 삭제 에러:', error);
            }
        }

        await book.deleteOne();
        res.json({ 
            success: true,
            message: '도서가 삭제되었습니다.' 
        });
    } catch (error) {
        console.error('도서 삭제 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 이미지 업로드
router.post('/api/books/:id/image', isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: '이미지가 업로드되지 않았습니다.' 
            });
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        // 이전 이미지 삭제 (기본 이미지가 아닌 경우)
        if (book.imageUrl && book.imageUrl !== '/images/default-book.jpg') {
            const oldImagePath = path.join(__dirname, '../../public', book.imageUrl);
            try {
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.error('이전 이미지 삭제 에러:', error);
            }
        }

        // 새 이미지 경로 저장
        const imageUrl = '/uploads/books/' + req.file.filename;
        book.imageUrl = imageUrl;
        await book.save();

        res.json({ 
            success: true,
            message: '이미지가 업로드되었습니다.',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

module.exports = router; 