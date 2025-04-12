const mongoose = require('mongoose');
const Book = require('../models/Book');

async function resetBookImages() {
    try {
        // MongoDB 연결
        await mongoose.connect('mongodb://localhost:27017/bookstore');
        console.log('MongoDB 연결 성공');

        // 도서 데이터가 있는지 확인
        const bookCount = await Book.countDocuments();
        console.log(`데이터베이스에 ${bookCount}개의 도서가 있습니다.`);

        if (bookCount > 0) {
            // 모든 도서의 이미지 경로를 기본 이미지로 초기화
            const result = await Book.updateMany(
                {},
                {
                    $set: {
                        imageUrl: '/images/default-book.png',
                        originalImageName: ''
                    }
                }
            );
            
            console.log(`${result.modifiedCount}개의 도서 이미지가 초기화되었습니다.`);
        } else {
            console.log('초기화할 도서 데이터가 없습니다.');
        }
        
        // MongoDB 연결 종료
        await mongoose.connection.close();
        console.log('MongoDB 연결 종료');
        
        process.exit(0);
    } catch (error) {
        console.error('이미지 초기화 중 오류:', error);
        process.exit(1);
    }
}

// 스크립트 실행
resetBookImages(); 