# Tech Ascent - Plataforma Educativa

Una plataforma educativa gamificada construida con Express, React y PostgreSQL.

## Características

- **Admin Dashboard**: Gestión de mundos, usuarios y asignaciones
- **Profesor Manager**: Carga de contenido educativo (PDF, Video, Asignaciones)
- **Estudiante**: Exploración de mundos, avatar personalizado, progreso con XP
- **Avatares**: Sistema de skins raros y legendarios con monedas
- **Fondos Dinámicos**: Temas personalizados por mundo
- **Responsive**: Diseño completo para móvil y desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express + Node.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Animations**: Framer Motion
- **State Management**: React Query
- **UI Components**: Shadcn/ui

## Requisitos Previos

- Node.js 20+
- PostgreSQL 13+
- npm o yarn
- Google Cloud Account (para Cloud Run)

## Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/gismartz2004/argacademy.git
cd argacademy

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run db:push

# Iniciar desarrollo
npm run dev
```

## Variables de Entorno

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tech_ascent

# Session
SESSION_SECRET=your-secret-key-change-in-production

# Node
NODE_ENV=development
PORT=5000
```

## Deploy en Cloud Run

### 1. Preparar el repositorio

```bash
# Inicializar Git si no está hecho
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Tech Ascent platform"

# Agregar remote
git remote add origin https://github.com/gismartz2004/argacademy.git

# Push a main
git branch -M main
git push -u origin main
```

### 2. Crear Cloud SQL Instance

```bash
# Instalar Google Cloud CLI (https://cloud.google.com/sdk/docs/install)

# Autenticarse
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Crear instancia PostgreSQL
gcloud sql instances create tech-ascent-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=ZONAL

# Crear base de datos
gcloud sql databases create tech_ascent \
  --instance=tech-ascent-db

# Crear usuario
gcloud sql users create appuser \
  --instance=tech-ascent-db \
  --password=YOUR_SECURE_PASSWORD
```

### 3. Crear archivo cloudbuild.yaml

El archivo ya está incluido en el repositorio.

### 4. Configurar secretos en Cloud Run

```bash
# Crear secretos en Secret Manager
echo -n "postgresql://appuser:PASSWORD@/tech_ascent?host=/cloudsql/PROJECT_ID:us-central1:tech-ascent-db" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "your-production-secret-key" | \
  gcloud secrets create SESSION_SECRET --data-file=-
```

### 5. Deploy a Cloud Run

```bash
# Opción A: Manual (build y deploy)
gcloud run deploy tech-ascent \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest" \
  --cloud-sql-instances PROJECT_ID:us-central1:tech-ascent-db

# Opción B: Automático (GitHub Actions)
# Push a main dispara el deploy automático
git push -u origin main
```

## Estructura del Proyecto

```
tech-ascent/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── hooks/        # Hooks personalizados
│   │   └── lib/          # Utilidades
│   └── index.html
├── server/               # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Base de datos
│   └── seed.ts           # Seed inicial
├── shared/               # Código compartido
│   └── schema.ts         # Schema de BD
├── Dockerfile            # Configuración Docker
├── cloudbuild.yaml       # CI/CD config
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session

### Admin
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users` - Crear usuario
- `DELETE /api/admin/users/:id` - Eliminar usuario
- `POST /api/admin/worlds` - Crear mundo
- `PATCH /api/admin/worlds/:id/professor` - Asignar profesor

### Worlds
- `GET /api/worlds` - Listar mundos
- `GET /api/worlds/:id` - Obtener mundo
- `GET /api/worlds/:id/content` - Contenido del mundo

### Content
- `POST /api/worlds/:id/content` - Crear contenido
- `POST /api/content/:id/submit` - Enviar asignación
- `GET /api/content/:id/submissions` - Ver envíos

### Avatars
- `GET /api/skins` - Listar avatares
- `GET /api/user/skins` - Avatares del usuario
- `POST /api/user/skins/purchase` - Comprar avatar
- `PUT /api/user/avatar` - Cambiar avatar

## Troubleshooting

### Error: "Cloud SQL connection failed"
- Verificar que Cloud SQL Proxy está corriendo
- Verificar la `DATABASE_URL` en secretos

### Error: "Port already in use"
- Cloud Run asigna automáticamente el puerto 8080
- No cambiar el PORT en producción

### Error: "File upload fails"
- En Cloud Run usar Cloud Storage en lugar de `/uploads` local
- Actualizar storage.ts para usar GCS

## Contacto

Desarrollado por Tech Ascent Team