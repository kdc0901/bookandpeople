require('dotenv').config();
const mongoose = require('mongoose');

const resetDB = async () => {
    try {
        // MongoDB 연결
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-website');
        console.log('MongoDB 연결 성공');

        // 모든 컬렉션 삭제
        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
            await collection.drop();
            console.log(`컬렉션 ${collection.collectionName} 삭제 완료`);
        }

        console.log('데이터베이스 초기화가 완료되었습니다.');
        
        // MongoDB 연결 종료
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

resetDB(); 