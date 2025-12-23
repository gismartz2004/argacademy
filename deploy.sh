#!/bin/bash

# Script para hacer deploy a Cloud Run
# Uso: ./deploy.sh PROJECT_ID

if [ -z "$1" ]; then
  echo "Uso: ./deploy.sh PROJECT_ID"
  exit 1
fi

PROJECT_ID=$1
REGION="us-central1"
SERVICE_NAME="tech-ascent"

echo "🚀 Iniciando deploy a Cloud Run..."
echo "Proyecto: $PROJECT_ID"
echo "Región: $REGION"
echo "Servicio: $SERVICE_NAME"

# Autenticarse
echo "🔐 Autenticando con Google Cloud..."
gcloud auth login
gcloud config set project $PROJECT_ID

# Crear Cloud SQL si no existe
echo "🗄️ Verificando Cloud SQL Instance..."
gcloud sql instances describe tech-ascent-db --region $REGION &>/dev/null
if [ $? -ne 0 ]; then
  echo "📦 Creando Cloud SQL Instance..."
  gcloud sql instances create tech-ascent-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --availability-type=ZONAL

  echo "📚 Creando base de datos..."
  gcloud sql databases create tech_ascent \
    --instance=tech-ascent-db

  echo "👤 Creando usuario..."
  gcloud sql users create appuser \
    --instance=tech-ascent-db \
    --password=$(openssl rand -base64 32)
fi

# Crear secretos si no existen
echo "🔑 Configurando secretos..."
gcloud secrets create DATABASE_URL --replication-policy="automatic" &>/dev/null || true
gcloud secrets create SESSION_SECRET --replication-policy="automatic" &>/dev/null || true

# Actualizar secretos
read -p "Ingresa DATABASE_URL: " DATABASE_URL
echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-

read -p "Ingresa SESSION_SECRET: " SESSION_SECRET
echo -n "$SESSION_SECRET" | gcloud secrets versions add SESSION_SECRET --data-file=-

# Build y deploy
echo "🔨 Compilando y subiendo a Container Registry..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest" \
  --cloud-sql-instances "$PROJECT_ID:$REGION:tech-ascent-db" \
  --cpu 2 \
  --memory 512Mi \
  --timeout 3600 \
  --max-instances 10

echo "✅ Deploy completado!"
echo "URL: https://$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' | sed 's|https://||')"
