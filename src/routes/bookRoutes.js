const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Book = require('../models/Book');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// 업로드 디렉토리 설정
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads', 'books');

// 업로드 디렉토리 생성 함수
function createUploadDirectory() {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        return true;
    } catch (error) {
        console.error('디렉토리 생성 오류:', error);
        return false;
    }
}

// 파일명 생성 함수
function generateFilename(originalname) {
    const ext = path.extname(originalname).toLowerCase();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}${ext}`;
}

// 이미지 리사이징 함수
async function resizeImage(inputPath, outputPath, width, height) {
    try {
        // 원본 이미지 정보 가져오기
        const imageInfo = await sharp(inputPath).metadata();
        
        // 원본 이미지가 지정된 크기보다 작으면 리사이징하지 않음
        if (imageInfo.width <= width && imageInfo.height <= height) {
            // 원본 파일을 복사
            fs.copyFileSync(inputPath, outputPath);
            return true;
        }

        // 원본보다 큰 경우에만 리사이징
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ 
                quality: 100,
                force: false // 원본이 PNG인 경우 PNG로 유지
            })
            .png({ 
                quality: 100,
                force: false // 원본이 JPEG인 경우 JPEG로 유지
            })
            .toFile(outputPath);
        
        return true;
    } catch (error) {
        console.error('이미지 리사이징 오류:', error);
        return false;
    }
}

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!createUploadDirectory()) {
            cb(new Error('업로드 디렉토리 생성 실패'));
            return;
        }
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        try {
            const filename = generateFilename(file.originalname);
            cb(null, filename);
        } catch (error) {
            cb(error);
        }
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다. (jpg, png, gif만 가능)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 관리자 도서 관리 페이지
router.get('/books', isAdmin, async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.render('admin-books', { 
            title: '도서 관리',
            books: books,
            user: req.session.user
        });
    } catch (error) {
        console.error('도서 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 도서 목록 조회 API (관리자용)
router.get('/api/books', isAdmin, async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error('도서 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 도서 추가
router.post('/api/books', isAdmin, upload.single('image'), async (req, res) => {
    let uploadedFile = null;
    
    try {
        const { title, author, price, type, category, publishedAt } = req.body;
        
        // 이미지 URL 설정
        let imageUrl = '/images/default-book.jpg';
        if (req.file) {
            uploadedFile = req.file;
            imageUrl = `/uploads/books/${uploadedFile.filename}`;
        }

        const book = new Book({
            title,
            author,
            price: Number(price),
            type,
            category,
            publishedAt: new Date(publishedAt),
            imageUrl
        });

        await book.save();
        res.status(201).json({ 
            success: true,
            message: '도서가 추가되었습니다.',
            book: book
        });
    } catch (error) {
        console.error('도서 추가 에러:', error);
        // 업로드된 파일이 있으면 삭제
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 도서 수정
router.put('/api/books/:id', isAdmin, async (req, res) => {
    try {
        const { title, author, price, type, category, publishedAt } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { 
                title, 
                author, 
                price, 
                type, 
                category,
                publishedAt: new Date(publishedAt)
            },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        res.json({ 
            success: true,
            message: '도서가 수정되었습니다.',
            book: book
        });
    } catch (error) {
        console.error('도서 수정 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 도서 삭제
router.delete('/api/books/:id', isAdmin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        // 기본 이미지가 아닌 경우 이미지 파일 삭제
        if (book.imageUrl && book.imageUrl !== '/images/default-book.jpg') {
            const imagePath = path.join(__dirname, '../../public', book.imageUrl);
            try {
                fs.unlinkSync(imagePath);
            } catch (error) {
                console.error('이미지 삭제 에러:', error);
            }
        }

        await book.deleteOne();
        res.json({ 
            success: true,
            message: '도서가 삭제되었습니다.' 
        });
    } catch (error) {
        console.error('도서 삭제 에러:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

// 이미지 업로드
router.post('/api/books/:id/image', isAdmin, upload.single('image'), async (req, res) => {
    let uploadedFile = null;
    let resizedFilename = null;
    
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: '이미지 파일이 선택되지 않았습니다. 이미지를 선택해주세요.' 
            });
        }

        uploadedFile = req.file;
        console.log('업로드된 파일 정보:', {
            filename: uploadedFile.filename,
            path: uploadedFile.path,
            mimetype: uploadedFile.mimetype,
            size: uploadedFile.size
        });

        // 이미지 저장 경로 설정
        const imageUrl = `/uploads/books/${uploadedFile.filename}`;

        // DB에 이미지 URL 업데이트
        const book = await Book.findById(req.params.id);
        if (!book) {
            // 업로드된 파일 삭제
            if (fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path);
            }
            return res.status(404).json({ 
                success: false,
                message: '도서를 찾을 수 없습니다.' 
            });
        }

        // 기존 이미지가 있으면 삭제
        if (book.imageUrl && book.imageUrl !== '/images/default-book.jpg') {
            const oldImagePath = path.join(PUBLIC_DIR, book.imageUrl);
            try {
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } catch (error) {
                console.error('기존 이미지 삭제 오류:', error);
            }
        }

        // DB 업데이트
        book.imageUrl = imageUrl;
        await book.save();

        res.json({ 
            success: true,
            message: '이미지가 업로드되었습니다.',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        // 업로드된 파일이 있으면 삭제
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.' 
        });
    }
});

module.exports = router; 