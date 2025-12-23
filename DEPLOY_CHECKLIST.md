# 📋 Checklist: Deploy a Cloud Run

## ✅ Paso 1: Preparar Código (5 min)

- [ ] Código está en `c:\Users\OSCURIDAD\Desktop\Tech-Ascent`
- [ ] Todos los cambios están listos (play.tsx, componentes, etc.)
- [ ] Sin errores en `npm run dev`

```bash
# Verificar que está todo bien
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent
npm run check
```

## ✅ Paso 2: Configurar Git (10 min)

```bash
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent

# Configurar Git
git config user.name "Tu Nombre"
git config user.email "tu.email@gmail.com"

# Agregar todo
git add .

# Commit inicial
git commit -m "Initial commit: Tech Ascent platform with play world enhancements"

# Conectar con GitHub (reemplazar gismartz2004 por tu usuario si es diferente)
git branch -M main
git remote add origin https://github.com/gismartz2004/argacademy.git
git push -u origin main
```

- [ ] Git inicializado
- [ ] Conectado a GitHub
- [ ] Push a main completado

## ✅ Paso 3: Instalar Google Cloud SDK (15 min)

- [ ] Descargar SDK: https://cloud.google.com/sdk/docs/install
- [ ] Instalar localmente
- [ ] Abrir PowerShell como Administrador

```bash
# Verificar instalación
gcloud --version
```

## ✅ Paso 4: Configurar Google Cloud (5 min)

```bash
# Autenticarse (abrirá navegador)
gcloud auth login

# Listar proyectos
gcloud projects list

# Establecer proyecto (reemplazar con tu proyecto ID)
gcloud config set project tu-proyecto-id

# Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable sql.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

- [ ] Autenticado en Google Cloud
- [ ] Proyecto seleccionado
- [ ] APIs habilitadas

## ✅ Paso 5: Crear Base de Datos (15 min)

```bash
# 1. Crear Cloud SQL
gcloud sql instances create tech-ascent-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=ZONAL

# Esperar a que se cree (5-10 min)

# 2. Crear BD
gcloud sql databases create tech_ascent \
  --instance=tech-ascent-db

# 3. Crear usuario
gcloud sql users create appuser \
  --instance=tech-ascent-db \
  --password=TuPassword123456!

# 4. Guardar connection name
gcloud sql instances describe tech-ascent-db --format='value(connectionName)'
# Copiar esto (ejemplo: mi-proyecto:us-central1:tech-ascent-db)
```

- [ ] Cloud SQL creada
- [ ] BD creada
- [ ] Usuario creado
- [ ] Connection name anotado

## ✅ Paso 6: Crear Secretos (10 min)

```bash
# Reemplazar estos valores con los tuyos:
# CONNECTION_NAME = mi-proyecto:us-central1:tech-ascent-db (del paso anterior)
# PASSWORD = TuPassword123456! (el que usaste al crear usuario)

# 1. Crear secreto DATABASE_URL
gcloud secrets create DATABASE_URL --replication-policy=automatic

# 2. Agregar valor (ajusta CONNECTION_NAME)
echo -n "postgresql://appuser:TuPassword123456!@/tech_ascent?host=/cloudsql/CONNECTION_NAME" | `
  gcloud secrets versions add DATABASE_URL --data-file=-

# 3. Crear secreto SESSION_SECRET
gcloud secrets create SESSION_SECRET --replication-policy=automatic

# 4. Agregar valor seguro
echo -n "super-secreto-seguro-minimo-32-caracteres-aleatorios-xyz123" | `
  gcloud secrets versions add SESSION_SECRET --data-file=-
```

- [ ] Secreto DATABASE_URL creado
- [ ] Secreto SESSION_SECRET creado

## ✅ Paso 7: Configurar Permisos (5 min)

```bash
# Obtener PROJECT_NUMBER
$PROJECT_NUMBER = gcloud projects describe `
  (gcloud config get-value project) `
  --format='value(projectNumber)'

# Dar permisos para secretos
gcloud secrets add-iam-policy-binding DATABASE_URL `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding SESSION_SECRET `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/secretmanager.secretAccessor

# Dar permisos para Cloud SQL
gcloud projects add-iam-policy-binding (gcloud config get-value project) `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/cloudsql.client
```

- [ ] Permisos configurados

## ✅ Paso 8: Deploy a Cloud Run

### Opción A: Deploy Manual (Recomendado para primera vez)

```bash
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent

# Ejecutar deploy
gcloud run deploy tech-ascent `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "NODE_ENV=production,PORT=8080" `
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest" `
  --cloud-sql-instances "PROJECT_ID:us-central1:tech-ascent-db" `
  --cpu 2 `
  --memory 512Mi `
  --timeout 3600 `
  --max-instances 10

# Esperar a que compile y deploy (5-10 min)
```

- [ ] Deploy completado
- [ ] URL disponible

### Opción B: Deploy Automático con GitHub Actions (Próxima vez)

1. [ ] Ir a `.github/workflows/deploy.yml`
2. [ ] Seguir instrucciones en `CLOUD_RUN_GUIDE.md` (Paso 7)
3. [ ] Los próximos pushes harán deploy automático

## ✅ Paso 9: Verificar Servicio

```bash
# 1. Obtener URL
gcloud run services describe tech-ascent `
  --region=us-central1 `
  --format='value(status.url)'

# 2. Probar health check
curl https://tech-ascent-xxxxx.run.app/health

# 3. Ver logs
gcloud run services logs read tech-ascent --region=us-central1 --limit=50
```

- [ ] Servicio activo
- [ ] Health check OK
- [ ] URL accesible

## ✅ Paso 10: Configurar Dominio Personalizado (Opcional)

```bash
# 1. Agregar mapeo de dominio
gcloud run domain-mappings create --service=tech-ascent `
  --domain=tudominio.com --region=us-central1

# 2. Agregar registros DNS según lo indicado por Google Cloud
```

- [ ] Dominio configurado (opcional)

## 🎉 ¡Completado!

Tu aplicación está ahora en: `https://tech-ascent-xxxxx.run.app`

## 📊 Próximos Pasos

1. **Instalar certificados SSL**: Google Cloud los proporciona automáticamente
2. **Configurar Backups**: Cloud SQL > Backups
3. **Monitorear logs**: `gcloud run services logs read tech-ascent --stream`
4. **Escalar según demanda**: Cambiar `--max-instances` según necesidad

## 🆘 Si algo falla

```bash
# Ver logs detallados
gcloud run services logs read tech-ascent --region=us-central1 --limit=100

# Revisar builds
gcloud builds list

# Ver logs de build específico
gcloud builds log [BUILD_ID] --stream
```

Consultar `CLOUD_RUN_GUIDE.md` sección "Troubleshooting"