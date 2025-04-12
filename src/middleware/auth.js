// 미들웨어: 로그인 여부 확인
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }
};

// 미들웨어: 관리자 권한 확인
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
};

module.exports = { isAuthenticated, isAdmin }; 