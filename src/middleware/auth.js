// 관리자 권한 확인 미들웨어
const isAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        const user = await User.findById(req.session.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
        }

        next();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

module.exports = { isAuthenticated, isAdmin }; 