# 📦 Archivos de Configuración para Cloud Run

## Archivos Agregados

### 1. **Dockerfile**
```
Descripción: Configuración para construir la imagen Docker
Ubicación: /Dockerfile
Qué hace:
- Build multietapa para optimizar tamaño
- Instala dependencias
- Copia código compilado
- Configura health check
- Expone puerto 8080
```

### 2. **.dockerignore**
```
Descripción: Archivos a excluir del build Docker
Ubicación: /.dockerignore
Qué hace:
- Excluye node_modules
- Excluye .git
- Optimiza velocidad de build
```

### 3. **cloudbuild.yaml**
```
Descripción: Configuración de Cloud Build
Ubicación: /cloudbuild.yaml
Qué hace:
- Construye imagen Docker
- Push a Container Registry
- Deploy a Cloud Run
- Se ejecuta automáticamente en cada push
```

### 4. **.github/workflows/deploy.yml**
```
Descripción: GitHub Actions workflow para CI/CD
Ubicación: /.github/workflows/deploy.yml
Qué hace:
- Automático: triggers en push a main
- Autentica con Workload Identity Federation
- Build y deploy sin credenciales locales
- Mejor práctica de seguridad
```

### 5. **CLOUD_RUN_GUIDE.md**
```
Descripción: Guía completa paso a paso
Ubicación: /CLOUD_RUN_GUIDE.md
Qué incluye:
- Requisitos previos
- Configuración de Google Cloud
- Creación de Cloud SQL
- Secretos y permisos
- Deploy manual y automático
- Troubleshooting
```

### 6. **DEPLOY_CHECKLIST.md**
```
Descripción: Checklist interactivo para deploy
Ubicación: /DEPLOY_CHECKLIST.md
Qué es:
- Pasos paso a paso con checkboxes
- Comandos listos para copiar-pegar
- Tiempos estimados
```

### 7. **README.md** (Actualizado)
```
Descripción: Documentación del proyecto
Ubicación: /README.md
Cambios:
- Tech stack actualizado
- API endpoints documentados
- Instrucciones de install
- Guía de deploy
```

### 8. **deploy.sh y deploy.bat**
```
Descripción: Scripts automáticos de deploy
Ubicación: /deploy.sh (Linux/Mac) y /deploy.bat (Windows)
Qué hacen:
- Automatiza todo el proceso de deploy
- Crea Cloud SQL si es necesario
- Configura secretos
- Deploy con un solo comando
```

### 9. **.env.example** (Actualizado)
```
Descripción: Variables de entorno de ejemplo
Ubicación: /.env.example
Cambios:
- DATABASE_URL ejemplos para local y Cloud SQL
- SESSION_SECRET con instrucciones
```

### 10. **server/index.ts** (Actualizado)
```
Descripción: Servidor principal
Cambios:
- Agregado endpoint /health para Cloud Run
- Soporte para puerto 8080 en producción
- Logs mejorados para Cloud Run
```

## Cómo Usar Estos Archivos

### 1. Para entender todo el proceso:
```bash
1. Lee: README.md (visión general)
2. Lee: CLOUD_RUN_GUIDE.md (guía detallada)
3. Lee: DEPLOY_CHECKLIST.md (paso a paso)
```

### 2. Para hacer deploy rápido:
```bash
# Opción A: Script automático (Windows)
.\deploy.bat tu-proyecto-id

# Opción B: Script automático (Linux/Mac)
./deploy.sh tu-proyecto-id

# Opción C: Comandos gcloud manuales
# Ver DEPLOY_CHECKLIST.md
```

### 3. Para CI/CD automático:
```bash
1. Push a GitHub
2. GitHub Actions (workflow deploy.yml) se ejecuta automáticamente
3. Deploy a Cloud Run sin intervención
```

## Estructura del Deploy

```
Tu Código en GitHub
        ↓
GitHub Actions (deploy.yml)
        ↓
Google Cloud Build
        ↓
Docker Build
        ↓
Container Registry (GCR)
        ↓
Cloud Run Deploy
        ↓
Tu App en https://tech-ascent-xxxxx.run.app
        ↓
Cloud SQL Database
```

## Requisitos Minimos para Deploy

```
✅ Código en Git (main branch)
✅ Google Cloud Project creado
✅ Google Cloud SDK instalado
✅ gcloud auth login ejecutado
✅ APIs habilitadas (run, sql, secretmanager)
✅ Cloud SQL creada
✅ Secretos configurados (DATABASE_URL, SESSION_SECRET)
```

## Tiempos Aproximados

| Tarea | Tiempo |
|-------|--------|
| Preparar código | 5 min |
| Configurar Git | 5 min |
| Instalar SDK | 15 min |
| Config Google Cloud | 5 min |
| Crear Cloud SQL | 15 min |
| Crear secretos | 10 min |
| Config permisos | 5 min |
| Deploy | 10 min |
| **Total** | **~70 min** |

## Variables de Entorno

### En Desarrollo (.env)
```env
DATABASE_URL=postgresql://localhost:5432/tech_ascent
SESSION_SECRET=dev-secret
NODE_ENV=development
PORT=5000
```

### En Cloud Run (Secretos)
```env
DATABASE_URL=postgresql://appuser:password@/tech_ascent?host=/cloudsql/PROJECT:REGION:INSTANCE
SESSION_SECRET=production-secret
NODE_ENV=production
PORT=8080 (automático en Cloud Run)
```

## Seguridad

✅ **Secrets nunca están en código**
- Guardados en Google Secret Manager
- Inyectados en Cloud Run
- No visible en logs

✅ **Dockerignore excluye archivos sensibles**
- No se suben credenciales
- Optimiza imagen

✅ **CORS configurado por entorno**
- Desarrollo: acepta todo
- Producción: solo dominios autorizados

✅ **Health check**
- Cloud Run puede reiniciar servicio si es necesario

## Monitoreo y Logs

```bash
# Ver logs en tiempo real
gcloud run services logs read tech-ascent --stream

# Ver últimos 50 logs
gcloud run services logs read tech-ascent --limit=50

# Filtrar por nivel
gcloud run services logs read tech-ascent --filter='severity=ERROR'

# Cloud Monitoring
# https://console.cloud.google.com/monitoring
```

## Próximas Mejoras (Opcional)

```
1. Cloud Storage para uploads (en lugar de /uploads local)
2. Redis para sesiones (en lugar de memory store)
3. Firestore para analíticas
4. Cloud Armor para DDoS protection
5. Terraform para Infrastructure as Code
```

## Costos Estimados

| Servicio | Precio/mes | Nota |
|----------|-----------|------|
| Cloud Run | $10-20 | 2M requests gratis |
| Cloud SQL | $15 | Micro instance |
| Secrets | $0 | Gratis |
| Build | $0 | 120 build-minutes gratis |
| **Total** | ~$25-35 | Depende del uso |

---

**¡Listo para deploy!** Sigue el DEPLOY_CHECKLIST.md para empezar.