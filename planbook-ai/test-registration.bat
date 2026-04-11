@echo off
REM ============================================================
REM Test Registration Endpoint
REM ============================================================

echo.
echo === TEST 1: Register New User ===
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"testuser123@example.com\", \"password\": \"Test1234\", \"fullName\": \"Test User\"}" ^
  -v

echo.
echo.
echo === TEST 2: Register with Duplicate Email (Should Fail) ===
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"testuser123@example.com\", \"password\": \"Test5678\", \"fullName\": \"Another User\"}" ^
  -v

echo.
echo.
echo === TEST 3: Check Email Exists ===
curl -X GET "http://localhost:8080/api/auth/check-email?email=testuser123@example.com" ^
  -H "Content-Type: application/json" ^
  -v

echo.
echo.
echo === TEST 4: Login with New User ===
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"testuser123@example.com\", \"password\": \"Test1234\"}" ^
  -v

pause
