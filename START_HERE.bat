@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║      TRIP PLANNER - START HERE                            ║
echo ║                                                            ║
echo ║      Everything is ready! Just 3 steps:                   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo STEP 1: Initialize Database
echo ═════════════════════════════
echo.
echo Run this command to set up the database:
echo.
echo   node setup.js
echo.
echo This will create all tables, indexes, and sample data.
echo.
echo.
echo STEP 2: Start Customer App (in new terminal)
echo ═════════════════════════════════════════════
echo.
echo   cd customer
echo   npm run dev
echo.
echo Opens at: http://localhost:5173
echo.
echo.
echo STEP 3: Start Admin App (in another new terminal)
echo ═══════════════════════════════════════════════════
echo.
echo   cd admin
echo   npm run dev
echo.
echo Opens at: http://localhost:5174
echo.
echo.
echo ═════════════════════════════════════════════════════════════
echo.
echo TEST CREDENTIALS:
echo.
echo   Customer: customer@micetravel.com / demo
echo   Admin:    admin@micetravel.com / demo
echo.
echo ═════════════════════════════════════════════════════════════
echo.
pause
