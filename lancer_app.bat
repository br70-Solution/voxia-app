@echo off
TITLE AudioPro Manager Pro - Serveur
echo =======================================================
echo    LANCEMENT DE L'APPLICATION AUDIOPRO MANAGER
echo =======================================================
echo.
echo [1/2] Verification des dependances...
if not exist node_modules (
    echo Installation des dependances manquantes...
    call npm install
)

echo.
echo [2/2] Demarrage du serveur et ouverture du navigateur...
echo L'application sera disponible sur http://localhost:5173
echo.

:: Ouvre le navigateur par defaut apres un court delai pour laisser le temps au serveur de demarrer
start "" "http://localhost:5173"

:: Lance le serveur de developpement
call npm run dev

echo.
echo Serveur arrete.
pause
