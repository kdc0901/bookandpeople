#!/bin/bash

# MongoDB 서비스 상태 확인
if ! brew services list | grep -q "mongodb-community@6.0.*started"; then
    echo "MongoDB 서버를 시작합니다..."
    brew services start mongodb/brew/mongodb-community@6.0
    sleep 5  # MongoDB가 완전히 시작될 때까지 대기
fi

# Node.js 서버 시작
echo "Node.js 서버를 시작합니다..."
cd "$(dirname "$0")"
npm run dev 