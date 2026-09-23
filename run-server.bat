@echo off
title Server Monitoring Satwa SUTT/SUTET - UPT Palembang
echo ======================================================================
echo    Sistem Monitoring Kerawanan Satwa & Proteksi SUTT/SUTET
echo                    PLN UPT PALEMBANG
echo ======================================================================
echo.

:: Hentikan proses lama yang masih mengunci port 8080 jika ada
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Membuka browser di http://localhost:8080/ ...
start "" "http://localhost:8080/"
echo.
echo Server berjalan di http://localhost:8080/. Tekan Ctrl+C untuk menghentikan.
echo.
node server.js
pause
