const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Ebook = require('../models/Ebook');
const Paper = require('../models/Paper');

// 메인 페이지
router.get('/', async (req, res) => {
    try {
        // 오늘의 PICK 도서 가져오기 (최근 4개)
        const todayPicks = await Book.find({ category: 'pick' })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        // 지금, 이 책 가져오기 (최근 4개)
        const currentBooks = await Book.find({ category: 'current' })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        // 전체 도서 목록 가져오기 (최근 12개)
        const allBooks = await Book.find()
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();

        console.log('Session:', req.session);
        console.log('Books loaded:', {
            todayPicksCount: todayPicks.length,
            currentBooksCount: currentBooks.length,
            allBooksCount: allBooks.length
        });

        res.render('index', {
            title: '북앤피플',
            user: req.session.user || null,
            todayPicks,
            currentBooks,
            allBooks
        });
    } catch (error) {
        console.error('메인 페이지 로드 중 에러:', error);
        res.status(500).send('서버 에러가 발생했습니다.');
    }
});

// 도서 목록 페이지
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.render('books', {
            title: '도서 목록 - 북앤피플',
            user: req.session.user || null,
            books
        });
    } catch (error) {
        console.error('도서 페이지 로드 중 에러:', error);
        res.status(500).send('서버 에러가 발생했습니다.');
    }
});

// 전자책 페이지
router.get('/ebooks', async (req, res) => {
    try {
        const ebooks = await Ebook.find();
        res.render('ebooks', {
            title: '전자책 - 북앤피플',
            user: req.session.user || null,
            ebooks
        });
    } catch (error) {
        console.error('전자책 페이지 로드 중 에러:', error);
        res.status(500).send('서버 에러가 발생했습니다.');
    }
});

// 소논문집 페이지
router.get('/papers', async (req, res) => {
    try {
        const papers = await Paper.find();
        res.render('papers', {
            title: '소논문집 - 북앤피플',
            user: req.session.user || null,
            papers
        });
    } catch (error) {
        console.error('소논문집 페이지 로드 중 에러:', error);
        res.status(500).send('서버 에러가 발생했습니다.');
    }
});

// 공개용 도서 목록 API
router.get('/api/public/books', async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .select('-__v')
            .lean();
        res.json(books);
    } catch (error) {
        console.error('도서 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router; 