@echo off
REM Script para hacer deploy a Cloud Run en Windows
REM Uso: deploy.bat PROJECT_ID

if "%1"=="" (
  echo Uso: deploy.bat PROJECT_ID
  exit /b 1
)

setlocal enabledelayedexpansion

set PROJECT_ID=%1
set REGION=us-central1
set SERVICE_NAME=tech-ascent

echo.
echo ========================================
echo   Deploy a Google Cloud Run
echo ========================================
echo.
echo Proyecto: %PROJECT_ID%
echo Region: %REGION%
echo Servicio: %SERVICE_NAME%
echo.

REM Autenticarse
echo [1/5] Autenticando con Google Cloud...
call gcloud auth login
call gcloud config set project %PROJECT_ID%

REM Crear Cloud SQL
echo.
echo [2/5] Verificando Cloud SQL Instance...
gcloud sql instances describe tech-ascent-db --region %REGION% >nul 2>&1
if errorlevel 1 (
  echo Creando Cloud SQL Instance...
  call gcloud sql instances create tech-ascent-db ^
    --database-version=POSTGRES_15 ^
    --tier=db-f1-micro ^
    --region=%REGION% ^
    --availability-type=ZONAL
  
  echo Creando base de datos...
  call gcloud sql databases create tech_ascent ^
    --instance=tech-ascent-db
  
  echo Creando usuario...
  call gcloud sql users create appuser ^
    --instance=tech-ascent-db ^
    --password=TempPassword123!
)

REM Crear secretos
echo.
echo [3/5] Configurando secretos en Google Secret Manager...
gcloud secrets create DATABASE_URL --replication-policy=automatic >nul 2>&1
gcloud secrets create SESSION_SECRET --replication-policy=automatic >nul 2>&1

echo.
set /p DATABASE_URL="Ingresa DATABASE_URL: "
echo %DATABASE_URL% | gcloud secrets versions add DATABASE_URL --data-file=-

set /p SESSION_SECRET="Ingresa SESSION_SECRET: "
echo %SESSION_SECRET% | gcloud secrets versions add SESSION_SECRET --data-file=-

REM Deploy
echo.
echo [4/5] Compilando y subiendo a Container Registry...
call gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --set-env-vars "NODE_ENV=production,PORT=8080" ^
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest" ^
  --cloud-sql-instances "%PROJECT_ID%:%REGION%:tech-ascent-db" ^
  --cpu 2 ^
  --memory 512Mi ^
  --timeout 3600 ^
  --max-instances 10

echo.
echo ========================================
echo   [5/5] Deploy completado!
echo ========================================
echo.
echo Obtiendo URL...
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"') do set URL=%%i
echo.
echo URL de tu servicio: %URL%
echo.
pause