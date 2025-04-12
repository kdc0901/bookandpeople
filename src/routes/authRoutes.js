const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: '로그인', user: req.session.user });
});

// 로그인 API
router.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 찾기
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        // 세션에 사용자 정보 저장
        req.session.user = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        res.json({
            message: '로그인 성공',
            user: {
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그아웃 API
router.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: '로그아웃 처리 중 오류가 발생했습니다.' });
        }
        res.json({ success: true, message: '로그아웃 되었습니다.' });
    });
});

// 현재 로그인된 사용자 정보 조회
router.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    res.json({ user: req.session.user });
});

module.exports = router; 