@echo off
chcp 65001 >nul
title Eurovision 2014 Scoreboard

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   Eurovision Song Contest 2014       ║
echo  ║   Запуск локального сервера...       ║
echo  ╚══════════════════════════════════════╝
echo.

:: Проверяем Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python найден — запускаю сервер...
    echo  Открой браузер: http://localhost:8080
    echo  Для остановки нажми Ctrl+C
    echo.
    start "" "http://localhost:8080"
    python -m http.server 8080
    goto :end
)

:: Проверяем Python через py
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python найден — запускаю сервер...
    echo  Открой браузер: http://localhost:8080
    echo  Для остановки нажми Ctrl+C
    echo.
    start "" "http://localhost:8080"
    py -m http.server 8080
    goto :end
)

:: Проверяем Node.js / npx
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Node.js найден — запускаю сервер...
    echo  Открой браузер: http://localhost:3000
    echo  Для остановки нажми Ctrl+C
    echo.
    start "" "http://localhost:3000"
    npx serve . -l 3000
    goto :end
)

:: Ничего не найдено
echo  [!] Python и Node.js не найдены.
echo.
echo  Установи одно из:
echo    Python:  https://www.python.org/downloads/
echo    Node.js: https://nodejs.org/
echo.
echo  После установки запусти этот файл снова.
echo.
pause

:end
