require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
    try {
        // MongoDB 연결
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-website');
        console.log('MongoDB 연결 성공');

        // 기존 admin 계정 찾기
        const existingAdmin = await User.findOne({ username: 'kdc0901@admin' });
        
        // 기존 admin 계정이 있다면 삭제
        if (existingAdmin) {
            await User.deleteOne({ _id: existingAdmin._id });
            console.log('기존 관리자 계정이 삭제되었습니다.');
        }

        // 비밀번호 해시화
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123!@', salt);

        // 새로운 관리자 계정 생성
        const adminUser = new User({
            username: 'kdc0901@admin',
            email: 'admin@example.com',
            password: hashedPassword,
            isAdmin: true,
            role: 'admin'
        });

        await adminUser.save();
        console.log('관리자 계정이 성공적으로 생성되었습니다.');
        console.log('아이디: kdc0901@admin');
        console.log('비밀번호: Admin123!@');

        // MongoDB 연결 종료
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('관리자 계정 생성 실패:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

initAdmin(); 