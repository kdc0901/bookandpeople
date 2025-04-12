const mongoose = require('mongoose');
const Book = require('./models/Book');

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/bookandpeople', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 테스트 데이터
const books = [
    {
        title: '오늘의 추천도서 1',
        author: '저자 1',
        price: 15000,
        description: '오늘의 추천도서 1 설명',
        type: 'new',
        category: 'pick',
        imageUrl: '/images/books/1744454880703-pn0nqs.jpg'
    },
    {
        title: '오늘의 추천도서 2',
        author: '저자 2',
        price: 18000,
        description: '오늘의 추천도서 2 설명',
        type: 'new',
        category: 'pick',
        imageUrl: '/images/books/1744455035319-6vx6ll.jpg'
    },
    {
        title: '오늘의 추천도서 3',
        author: '저자 3',
        price: 16000,
        description: '오늘의 추천도서 3 설명',
        type: 'new',
        category: 'pick',
        imageUrl: '/images/books/1744466911581-vm86l5_resized.jpg'
    },
    {
        title: '오늘의 추천도서 4',
        author: '저자 4',
        price: 17000,
        description: '오늘의 추천도서 4 설명',
        type: 'new',
        category: 'pick',
        imageUrl: '/images/books/1744467610682-clovkd_resized.jpg'
    },
    {
        title: '지금 주목받는 책 1',
        author: '저자 5',
        price: 20000,
        description: '지금 주목받는 책 1 설명',
        type: 'new',
        category: 'current',
        imageUrl: '/images/books/1744455050628-hkoqtj.jpg'
    },
    {
        title: '지금 주목받는 책 2',
        author: '저자 6',
        price: 22000,
        description: '지금 주목받는 책 2 설명',
        type: 'new',
        category: 'current',
        imageUrl: '/images/books/1744455064526-38cz6u.jpg'
    },
    {
        title: '지금 주목받는 책 3',
        author: '저자 7',
        price: 19000,
        description: '지금 주목받는 책 3 설명',
        type: 'new',
        category: 'current',
        imageUrl: '/images/books/1744467615828-awpms7_resized.jpg'
    },
    {
        title: '지금 주목받는 책 4',
        author: '저자 8',
        price: 21000,
        description: '지금 주목받는 책 4 설명',
        type: 'new',
        category: 'current',
        imageUrl: '/images/books/1744467620617-3wpv3r_resized.jpg'
    }
];

// 기존 데이터 삭제 후 새 데이터 추가
async function seedData() {
    try {
        await Book.deleteMany({});
        await Book.insertMany(books);
        console.log('테스트 데이터가 성공적으로 추가되었습니다.');
        mongoose.connection.close();
    } catch (error) {
        console.error('데이터 추가 중 오류 발생:', error);
        mongoose.connection.close();
    }
}

seedData(); 