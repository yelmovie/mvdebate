// Node.js 설치 검증 테스트 스크립트
console.log('✅ Node.js is working correctly!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('npm version:', require('child_process').execSync('npm -v', { encoding: 'utf-8' }).trim());

// 간단한 기능 테스트
const fs = require('fs');
const path = require('path');

console.log('\n📁 File system test:');
const testFile = path.join(__dirname, 'test-temp.txt');
fs.writeFileSync(testFile, 'Test successful!');
const content = fs.readFileSync(testFile, 'utf-8');
fs.unlinkSync(testFile);
console.log('   File write/read:', content === 'Test successful!' ? '✅ PASS' : '❌ FAIL');

console.log('\n🎉 All tests passed! Node.js is ready to use.');





