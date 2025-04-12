# Book & People 프로젝트 변수 정리

## 전역 변수 (Global Variables)

### Express 애플리케이션 변수
- `app`: Express 애플리케이션 인스턴스
- `PORT`: 서버 포트 번호 (기본값: 3000)

### 데이터베이스 관련 변수
- `MONGODB_URI`: MongoDB 연결 문자열 (기본값: 'mongodb://localhost/bookandpeople')
- `mongoose`: MongoDB ODM(Object Document Mapper) 인스턴스

## 세션 변수 (Session Variables)

### 사용자 세션
- `req.session.user`: 로그인한 사용자 정보를 저장
  - `id`: 사용자 ID
  - `username`: 사용자 이름
  - `isAdmin`: 관리자 여부

## 라우트 변수 (Route Variables)

### 페이지 라우트 (pageRoutes.js)
- `todayPicks`: 오늘의 PICK 도서 목록
- `currentBooks`: 현재 추천 도서 목록
- `title`: 페이지 제목

### 인증 라우트 (authRoutes.js)
- `username`: 로그인/회원가입 시 사용자 이름
- `password`: 로그인/회원가입 시 비밀번호

## 모델 변수 (Model Variables)

### Book 모델
- `title`: 도서 제목
- `author`: 저자
- `price`: 가격
- `imageUrl`: 도서 이미지 URL
- `category`: 도서 카테고리 ('pick', 'current' 등)
- `type`: 도서 유형
- `createdAt`: 생성 일자

### User 모델
- `username`: 사용자 이름
- `password`: 암호화된 비밀번호
- `isAdmin`: 관리자 권한 여부
- `createdAt`: 계정 생성 일자

## EJS 템플릿 변수

### 레이아웃 변수 (main.ejs)
- `title`: 페이지 제목
- `style`: 페이지별 스타일
- `body`: 페이지 본문 내용
- `script`: 페이지별 스크립트

### 헤더 변수 (header.ejs)
- `user`: 현재 로그인한 사용자 정보
  - `username`: 사용자 이름
  - `isAdmin`: 관리자 여부

### 메인 페이지 변수 (index.ejs)
- `todayPicks`: 오늘의 PICK 도서 배열
  - `title`: 도서 제목
  - `imageUrl`: 도서 이미지 URL
  - `author`: 저자
  - `price`: 가격
- `currentBooks`: 현재 추천 도서 배열
  - `title`: 도서 제목
  - `imageUrl`: 도서 이미지 URL
  - `author`: 저자
  - `price`: 가격

## CSS 클래스 변수

### 메인 페이지 클래스
- `.main-page`: 메인 페이지 컨테이너
- `.main-page__section`: 섹션 컨테이너
- `.main-page__title`: 섹션 제목
- `.main-page__book-grid`: 도서 그리드
- `.main-page__book-item`: 도서 아이템
- `.main-page__book-image`: 도서 이미지 컨테이너

### 레이아웃 클래스
- `.main-content`: 메인 콘텐츠 영역
- `.footer`: 푸터 영역

## 환경 변수 (Environment Variables)
- `NODE_ENV`: 노드 실행 환경 ('development', 'production')
- `SESSION_SECRET`: 세션 암호화 키
- `MONGODB_URI`: MongoDB 연결 문자열

## 미들웨어 변수

### 인증 미들웨어
- `isAuthenticated`: 사용자 인증 여부 확인
- `isAdmin`: 관리자 권한 확인

### 에러 처리 미들웨어
- `error`: 에러 객체
- `message`: 에러 메시지 