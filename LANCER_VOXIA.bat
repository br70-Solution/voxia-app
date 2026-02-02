@echo off
title Voxia Manager - Demarrage en cours...
echo ====================================================
echo           VOXIA MANAGER - GESTION CABINET
echo ====================================================
echo.
echo [1/3] Verification des services...
echo [2/3] Lancement de la base de donnees...
start /b cmd /c "npm run server"
timeout /t 3 /nobreak > nul
echo [3/3] Lancement de l'interface...
start /b cmd /c "npm run dev"
timeout /t 5 /nobreak > nul
echo.
echo Application prete ! Ouverture du navigateur...
start http://localhost:5173
echo.
echo ====================================================
echo   GARDER CETTE FENETRE OUVERTE PENDANT L'UTILISATION
echo ====================================================
pause
