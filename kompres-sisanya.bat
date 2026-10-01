@echo off
setlocal
title VirAshelle - Kompres Sisa Media Portfolio

echo ========================================================
echo     VirAshelle - Kompres File Portfolio Yang Tersisa   
echo ========================================================
echo.

:: Set environment variables
if not defined CLOUDFLARE_API_TOKEN (
  for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if "%%a"=="CLOUDFLARE_API_TOKEN" set "CLOUDFLARE_API_TOKEN=%%b"
  )
)
set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Links;%PATH%"

cd /d "%~dp0"

echo Menjalankan proses kompresi sisa file dan auto-upload ke R2...
echo.
node scripts\compress-sisanya.mjs

echo.
echo ========================================================
echo Selesai! Tekan tombol apa saja untuk keluar.
echo ========================================================
pause
