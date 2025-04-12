require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./db/connection');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const helmet = require('helmet');
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// 1. 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. 보안 설정
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "http:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
}));

// 3. GZIP 압축
app.use(compression());

// 4. 데이터베이스 연결
connectDB();

// 5. 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookandpeople',
        ttl: 24 * 60 * 60 // 1일
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1일
    }
}));

// 6. 디버깅 미들웨어
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    if (req.session) {
        console.log('Session:', req.session);
    }
    next();
});

// 7. 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// 8. 정적 파일 제공
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.use('/uploads/books', express.static(path.join(__dirname, '../uploads/books'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// 9. 라우트 설정
app.use('/admin', bookRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/', pageRoutes);

// 10. 404 에러 처리
app.use((req, res) => {
    res.status(404).render('error', {
        title: '페이지를 찾을 수 없습니다',
        message: '요청하신 페이지를 찾을 수 없습니다.',
        user: req.session.user || null
    });
});

// 11. 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).render('error', {
        title: '서버 오류',
        message: '서버에서 오류가 발생했습니다.',
        user: req.session.user || null
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 