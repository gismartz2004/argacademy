# 🚀 GUÍA RÁPIDA: Sube tu App a Cloud Run en 10 Pasos

## 📝 RESUMEN DE LO QUE NECESITAS HACER

Tu aplicación **Tech Ascent** está lista para subirse a Google Cloud Run. Aquí está el proceso simplificado:

---

## 🎯 Paso 1-2: Preparar Git (5 minutos)

```powershell
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent

# Configurar Git
git config user.name "Tu Nombre"
git config user.email "tu.email@gmail.com"

# Agregar y pushear
git add .
git commit -m "Deploy: Tech Ascent platform ready for Cloud Run"
git branch -M main
git remote add origin https://github.com/gismartz2004/argacademy.git
git push -u origin main
```

✅ **Resultado**: Tu código en GitHub

---

## 🌐 Paso 3-4: Google Cloud Setup (5 minutos)

```powershell
# 1. Descargar SDK: https://cloud.google.com/sdk/docs/install
# 2. Instalar y reiniciar PowerShell

# 3. Autenticar
gcloud auth login

# 4. Seleccionar proyecto (reemplazar tu-proyecto-id)
gcloud config set project tu-proyecto-id

# 5. Habilitar APIs
gcloud services enable run.googleapis.com sql.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com
```

✅ **Resultado**: Google Cloud configurado

---

## 🗄️ Paso 5-6: Crear Base de Datos (20 minutos)

```powershell
# 1. Crear Cloud SQL (espera 10 min a que se cree)
gcloud sql instances create tech-ascent-db `
  --database-version=POSTGRES_15 `
  --tier=db-f1-micro `
  --region=us-central1 `
  --availability-type=ZONAL

# 2. Crear BD
gcloud sql databases create tech_ascent --instance=tech-ascent-db

# 3. Crear usuario
gcloud sql users create appuser --instance=tech-ascent-db --password=TuPassword123!

# 4. GUARDAR ESTO (necesitarás después):
gcloud sql instances describe tech-ascent-db --format='value(connectionName)'
# Copiar la salida (ej: mi-proyecto:us-central1:tech-ascent-db)
```

✅ **Resultado**: Base de datos PostgreSQL lista

---

## 🔐 Paso 7: Crear Secretos (10 minutos)

```powershell
# Reemplazar CONNECTION_NAME con lo que copiaste arriba

# 1. Crear secreto DATABASE_URL
gcloud secrets create DATABASE_URL --replication-policy=automatic

# 2. Agregar el valor
echo "postgresql://appuser:TuPassword123!@/tech_ascent?host=/cloudsql/CONNECTION_NAME" | `
  gcloud secrets versions add DATABASE_URL --data-file=-

# 3. Crear secreto SESSION_SECRET
gcloud secrets create SESSION_SECRET --replication-policy=automatic

# 4. Agregar valor
echo "super-secreto-seguro-minimo-32-caracteres-xyz123456789" | `
  gcloud secrets versions add SESSION_SECRET --data-file=-
```

✅ **Resultado**: Secretos almacenados de forma segura

---

## 🔑 Paso 8: Configurar Permisos (5 minutos)

```powershell
# Obtener PROJECT_NUMBER
$PROJECT_NUMBER = gcloud projects describe (gcloud config get-value project) --format='value(projectNumber)'

# Dar permisos
gcloud secrets add-iam-policy-binding DATABASE_URL `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding SESSION_SECRET `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/secretmanager.secretAccessor

gcloud projects add-iam-policy-binding (gcloud config get-value project) `
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com `
  --role=roles/cloudsql.client
```

✅ **Resultado**: Permisos configurados

---

## 🚀 Paso 9: DEPLOY (10 minutos)

```powershell
cd C:\Users\OSCURIDAD\Desktop\Tech-Ascent

# Reemplazar PROJECT_ID con tu proyecto
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

# Esperar a que termine (5-10 min)
```

✅ **Resultado**: ¡Tu app está en Internet! 🎉

---

## ✅ Paso 10: Verificar que funciona

```powershell
# Ver URL
gcloud run services describe tech-ascent --region=us-central1 --format='value(status.url)'

# Copiar la URL y abrir en navegador
# Debería ver: "Tech Ascent - Plataforma Educativa"

# Probar health check
curl https://tech-ascent-xxxxx.run.app/health
```

✅ **Resultado**: ¡Aplicación en vivo!

---

## 📊 Dashboard de Control

Una vez deployado, puedes:

1. **Ver logs en tiempo real**:
   ```powershell
   gcloud run services logs read tech-ascent --stream
   ```

2. **Ir a la consola web**:
   - https://console.cloud.google.com/run/services

3. **Ver métricas**:
   - https://console.cloud.google.com/monitoring

4. **Ver base de datos**:
   - https://console.cloud.google.com/sql/instances

---

## 🔄 Próximas Veces (Deploy Automático)

```powershell
# Simplemente pushear a main
git add .
git commit -m "Nueva feature"
git push origin main

# GitHub Actions + Cloud Build hacen el deploy automático
# Ver status en: https://github.com/gismartz2004/argacademy/actions
```

---

## 📚 Documentación Completa

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Documentación del proyecto |
| `CLOUD_RUN_GUIDE.md` | Guía detallada paso a paso |
| `DEPLOY_CHECKLIST.md` | Checklist interactivo |
| `DEPLOYMENT_FILES.md` | Descripción de archivos |

---

## 🆘 Si algo sale mal

```powershell
# Ver logs de error
gcloud run services logs read tech-ascent --region=us-central1 --limit=50

# Si no se deploya:
gcloud builds list
gcloud builds log [BUILD_ID] --stream

# Si error de conexión a BD:
# 1. Verificar CONNECTION_NAME
# 2. Verificar DATABASE_URL en secretos
# 3. Verificar permisos de Cloud SQL
```

---

## 💰 Costos

- **Cloud Run**: ~$10-20/mes (2M requests gratis)
- **Cloud SQL**: ~$15/mes
- **Total**: ~$25-35/mes

---

## 🎓 Arquitectura Resultante

```
Usuario (navegador)
    ↓
Cloud Run (tu app)
    ↓
Cloud SQL (base de datos)
    ↓
Cloud Storage (si agregas)
```

---

## ✨ Features Incluidos

✅ Admin Dashboard
✅ Profesor Content Manager  
✅ Estudiante Play World
✅ Sistema de Avatares
✅ Progreso con XP
✅ Base de datos PostgreSQL
✅ Autenticación con sesiones
✅ Uploads de archivos
✅ Health checks
✅ Auto-scaling
✅ Logs en tiempo real
✅ CI/CD automático

---

## 🎯 Next Steps Después del Deploy

1. **Configurar dominio personalizado** (opcional)
   ```powershell
   gcloud run domain-mappings create --service=tech-ascent --domain=tudominio.com --region=us-central1
   ```

2. **Monitorear en tiempo real**
   - Cloud Monitoring: https://console.cloud.google.com/monitoring

3. **Escalar según demanda**
   ```powershell
   gcloud run services update tech-ascent --max-instances=20 --region=us-central1
   ```

4. **Agregar Cloud Storage para uploads**
   - Actualizar `server/storage.ts` para usar Google Cloud Storage

---

## 📞 Soporte

- Docs Cloud Run: https://cloud.google.com/run/docs
- Docs Cloud SQL: https://cloud.google.com/sql/docs
- Stack Overflow: #google-cloud-platform
- GitHub Issues: https://github.com/gismartz2004/argacademy/issues

---

**¡Que disfrutes tu app en production!** 🚀

Preguntas frecuentes:
- "¿Dónde veo mi app?" → La URL está en el output del deploy
- "¿Cómo veo logs?" → `gcloud run services logs read tech-ascent --stream`
- "¿Se paga?" → Solo gastas si usas. Tienes cuotas gratis al inicio