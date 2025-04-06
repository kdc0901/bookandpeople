require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetUsers = async () => {
    try {
        // MongoDB 연결
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-website');
        console.log('MongoDB 연결 성공');

        // 모든 사용자 삭제
        await User.deleteMany({});
        console.log('모든 사용자가 삭제되었습니다.');

        process.exit(0);
    } catch (error) {
        console.error('오류 발생:', error);
        process.exit(1);
    }
};

resetUsers(); 