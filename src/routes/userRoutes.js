const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');

// 사용자명 유효성 검사 함수
const validateUsername = (username) => {
    if (username.endsWith('@admin')) {
        return true;
    }
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    return usernameRegex.test(username);
};

// 이메일 유효성 검사 함수
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/images/books');
        // 디렉토리가 없으면 생성
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { 
        title: '회원가입',
        user: null
    });
});

// 회원가입 처리
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 입력값 검증
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '모든 필드를 입력해주세요.'
            });
        }

        // 유효성 검사
        if (!validateUsername(username)) {
            return res.status(400).json({
                success: false,
                message: '사용자명은 영문과 숫자로 4-20자여야 합니다.'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: '유효한 이메일 주소를 입력해주세요.'
            });
        }

        // 중복 확인
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 사용자명 또는 이메일입니다.'
            });
        }

        // 새 사용자 생성
        const user = new User({
            username,
            email,
            password,
            isAdmin: username.endsWith('@admin')
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            redirectUrl: '/login'
        });
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { 
        title: '로그인',
        user: null
    });
});

// 로그인 처리
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 입력값 검증
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '아이디와 비밀번호를 모두 입력해주세요.'
            });
        }

        // 사용자 찾기
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 세션에 사용자 정보 저장
        req.session.user = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        res.json({
            success: true,
            message: '로그인 성공',
            user: {
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 로그아웃 처리
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('로그아웃 에러:', err);
            return res.status(500).json({
                success: false,
                message: '로그아웃 중 오류가 발생했습니다.'
            });
        }
        res.json({
            success: true,
            message: '로그아웃되었습니다.'
        });
    });
});

// 마이페이지
router.get('/mypage', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select('-password');
        const orders = await Order.find({ user: req.session.user.id })
            .populate({
                path: 'items.book',
                select: 'title author imageUrl'
            })
            .sort({ createdAt: -1 });

        res.render('mypage', {
            title: '마이페이지',
            user: user,
            orders: orders
        });
    } catch (error) {
        console.error('마이페이지 조회 오류:', error);
        res.status(500).json({ success: false, message: '마이페이지 조회 중 오류가 발생했습니다.' });
    }
});

// 회원정보 수정 페이지
router.get('/mypage/edit', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select('-password');
        res.render('mypage-edit', {
            title: '회원정보 수정',
            user: user
        });
    } catch (error) {
        console.error('회원정보 수정 페이지 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// 회원정보 수정 처리
router.put('/api/users/update', isAuthenticated, async (req, res) => {
    try {
        const { name, email, phone, postcode, address, addressDetail } = req.body;
        
        // 이메일 중복 확인 (현재 사용자 제외)
        const existingUser = await User.findOne({ 
            email, 
            _id: { $ne: req.session.user.id } 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: '이미 사용 중인 이메일입니다.' 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user.id,
            {
                name,
                email,
                phone,
                postcode,
                address,
                addressDetail,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.json({ 
            success: true, 
            message: '회원정보가 성공적으로 수정되었습니다.',
            user: updatedUser 
        });
    } catch (error) {
        console.error('회원정보 수정 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 비밀번호 변경 페이지
router.get('/mypage/password', isAuthenticated, (req, res) => {
    res.render('mypage-password', {
        title: '비밀번호 변경',
        user: req.session.user
    });
});

// 비밀번호 변경 처리
router.put('/api/users/password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.user.id);

        // 현재 비밀번호 확인
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: '현재 비밀번호가 일치하지 않습니다.' 
            });
        }

        // 새 비밀번호 설정
        user.password = newPassword;
        await user.save();

        res.json({ 
            success: true, 
            message: '비밀번호가 성공적으로 변경되었습니다.' 
        });
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

module.exports = router; 