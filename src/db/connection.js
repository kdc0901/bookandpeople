const mongoose = require('mongoose');

const connectDB = async () => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 5000; // 5초

    while (retryCount < maxRetries) {
        try {
            const conn = await mongoose.connect('mongodb://localhost:27017/my-website');
            console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            retryCount++;
            console.error(`MongoDB 연결 실패 (시도 ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount === maxRetries) {
                console.error('최대 재시도 횟수 초과');
                process.exit(1);
            }
            
            console.log(`${retryDelay/1000}초 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

// 연결 상태 모니터링
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다...');
    connectDB();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB 연결 오류:', err);
});

module.exports = connectDB; 