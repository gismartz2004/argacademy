# Guía Completa: Deploy a Google Cloud Run

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud**
   - Crear cuenta en https://console.cloud.google.com
   - Crear un proyecto nuevo

2. **Google Cloud SDK**
   - Descargar: https://cloud.google.com/sdk/docs/install
   - Instalar localmente en tu Windows

3. **GitHub Setup**
   - Repositorio ya creado en: https://github.com/gismartz2004/argacademy
   - Token personal creado

## 🚀 Paso 1: Preparar el Repositorio Local

```bash
# 1. Ir a la carpeta del proyecto
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent

# 2. Inicializar Git (si aún no está hecho)
git init

# 3. Configurar usuario Git
git config user.name "Tu Nombre"
git config user.email "tu.email@gmail.com"

# 4. Agregar todos los archivos
git add .

# 5. Hacer el primer commit
git commit -m "Initial commit: Tech Ascent - Plataforma educativa gamificada"

# 6. Renombrar rama a main (si es necesario)
git branch -M main

# 7. Agregar el remoto a GitHub
git remote add origin https://github.com/gismartz2004/argacademy.git

# 8. Hacer push a GitHub
git push -u origin main
```

## 🔐 Paso 2: Configurar Google Cloud

```bash
# 1. Autenticarse
gcloud auth login

# 2. Establecer el proyecto
gcloud config set project tu-proyecto-id

# 3. Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable sql.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🗄️ Paso 3: Crear Cloud SQL (Base de Datos)

```bash
# 1. Crear instancia PostgreSQL
gcloud sql instances create tech-ascent-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=ZONAL

# 2. Crear base de datos
gcloud sql databases create tech_ascent \
  --instance=tech-ascent-db

# 3. Crear usuario
gcloud sql users create appuser \
  --instance=tech-ascent-db \
  --password=TuPasswordSeguro123!

# 4. Obtener la connection name (la necesitarás)
gcloud sql instances describe tech-ascent-db --format='value(connectionName)'
# Salida: proyecto-id:us-central1:tech-ascent-db
```

## 🔑 Paso 4: Crear Secretos en Secret Manager

```bash
# 1. Crear el secreto DATABASE_URL
gcloud secrets create DATABASE_URL --replication-policy=automatic

# 2. Agregar el valor (ajusta con tus datos)
echo -n "postgresql://appuser:TuPasswordSeguro123!@/tech_ascent?host=/cloudsql/tu-proyecto:us-central1:tech-ascent-db" | \
  gcloud secrets versions add DATABASE_URL --data-file=-

# 3. Crear el secreto SESSION_SECRET
gcloud secrets create SESSION_SECRET --replication-policy=automatic

# 4. Agregar un valor seguro
echo -n "tu-session-secret-super-seguro-minimo-32-caracteres-aleatorios" | \
  gcloud secrets versions add SESSION_SECRET --data-file=-

# Ejemplo de generar secreto seguro (en PowerShell):
# [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

## 🏗️ Paso 5: Dar Permisos a Cloud Run

```bash
# 1. Obtener el número del proyecto
PROJECT_NUMBER=$(gcloud projects list --filter="name:tu-proyecto" --format='value(PROJECT_NUMBER)')
echo $PROJECT_NUMBER

# 2. Dar permisos para acceder a los secretos
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding SESSION_SECRET \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# 3. Dar permisos para acceder a Cloud SQL
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/cloudsql.client
```

## 🚀 Paso 6: Deploy Manual (Opción Rápida)

```bash
# Ejecutar el script de deploy (Windows)
.\deploy.bat tu-proyecto-id

# O en PowerShell:
powershell -ExecutionPolicy Bypass -File deploy.bat tu-proyecto-id

# O en Linux/Mac:
chmod +x deploy.sh
./deploy.sh tu-proyecto-id
```

## 🔄 Paso 7: Deploy Automático con GitHub Actions (Recomendado)

### 7.1 Configurar Workload Identity Federation

```bash
# Este paso permite que GitHub Actions se autentique con GCP sin credenciales

PROJECT_ID="tu-proyecto-id"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
GITHUB_REPO="gismartz2004/argacademy"

# 1. Crear pool de identidad
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions"

# 2. Crear proveedor en el pool
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub" \
  --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 3. Crear la relación de confianza
gcloud iam workload-identity-pools create-oidc-credential-config \
  --workload-identity-pool-name="github-pool" \
  --workload-identity-provider-name="github-provider" \
  --project-id=$PROJECT_ID \
  --service-account-id=github-actions \
  --location=global > /tmp/config.json

# Obtener WIF_PROVIDER:
gcloud iam workload-identity-pools describe github-pool \
  --location=global \
  --format='value(name)'
# Salida: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool

# Obtener WIF_SERVICE_ACCOUNT:
gcloud iam service-accounts describe github-actions@$PROJECT_ID.iam.gserviceaccount.com \
  --format='value(email)'
```

### 7.2 Configurar GitHub Secrets

1. Ir a: https://github.com/gismartz2004/argacademy/settings/secrets/actions

2. Agregar estos secretos:
   ```
   GCP_PROJECT_ID = tu-proyecto-id
   WIF_PROVIDER = projects/123456/locations/global/workloadIdentityPools/github-pool
   WIF_SERVICE_ACCOUNT = github-actions@tu-proyecto.iam.gserviceaccount.com
   ```

### 7.3 Deploy Automático

- El workflow se ejecuta automáticamente al hacer push a main
- Ver status: https://github.com/gismartz2004/argacademy/actions

## ✅ Paso 8: Verificar el Deploy

```bash
# 1. Ver servicios en Cloud Run
gcloud run services list

# 2. Obtener la URL del servicio
gcloud run services describe tech-ascent \
  --region=us-central1 \
  --format='value(status.url)'

# 3. Probar el servicio
curl https://tech-ascent-xxxxx.run.app/health

# 4. Ver logs
gcloud run services logs read tech-ascent --region=us-central1 --limit=50
```

## 🐛 Troubleshooting

### Error: "Build failed"
```bash
# Ver logs detallados
gcloud builds log [BUILD_ID] --stream
```

### Error: "Connection refused"
- Verificar que DATABASE_URL está correcto
- Verificar permisos de Cloud SQL
- Verificar que Cloud SQL Proxy está habilitado

### Error: "Port already in use"
- Cloud Run asigna automáticamente puerto 8080
- No cambiar PORT en variables de entorno

### Error: "File uploads no funcionan"
```bash
# Configurar Cloud Storage para uploads en producción
# Ver server/storage.ts para implementar GCS
```

## 📊 Monitoreo

```bash
# Ver métricas del servicio
gcloud run services describe tech-ascent --region=us-central1

# Configurar alertas en Cloud Monitoring
# https://console.cloud.google.com/monitoring

# Ver costos
# https://console.cloud.google.com/billing
```

## 🔗 Comandos Útiles

```bash
# Actualizar servicio
gcloud run deploy tech-ascent --source . --region us-central1

# Escalar instancias
gcloud run services update tech-ascent \
  --min-instances=1 \
  --max-instances=10

# Cambiar disponibilidad
gcloud run services update tech-ascent \
  --no-allow-unauthenticated

# Ver logs en tiempo real
gcloud run services logs read tech-ascent --region=us-central1 --stream

# Eliminar servicio
gcloud run services delete tech-ascent --region=us-central1
```

## 💰 Estimación de Costos (Mensual)

- **Cloud Run**: ~$10-20 (primeros 2M requests gratis)
- **Cloud SQL (db-f1-micro)**: ~$15
- **Cloud Storage**: ~$5 (si usas para uploads)
- **Secret Manager**: Gratis
- **Total estimado**: ~$30-40/mes

## 📞 Soporte

- Documentación Cloud Run: https://cloud.google.com/run/docs
- Comunidad de GCP: https://stackoverflow.com/questions/tagged/google-cloud-platform