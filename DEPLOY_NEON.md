# 🚀 Deploy con Neon PostgreSQL - Guía Rápida

## 📋 Lo que necesitas

1. **Neon Database** ✅ (ya lo tienes)
2. **Hosting** - Elige uno:
   - **Railway** (recomendado - más fácil)
   - **Render**
   - **Heroku** (pago)
   - **Tu propio servidor**

---

## 🛤️ OPCIÓN 1: Deploy a Railway (RECOMENDADO)

### Paso 1: Crear cuenta en Railway
1. Ve a https://railway.app
2. Sign up con GitHub
3. Autoriza Railway

### Paso 2: Conectar GitHub repo
1. En Railway dashboard: `New Project` → `Deploy from GitHub`
2. Selecciona `gismartz2004/argacademy`
3. Railway automáticamente detecta Node.js

### Paso 3: Agregar variables de entorno
En Railway → Project Settings → Variables:

```
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/database?sslmode=require
SESSION_SECRET=tu-secreto-minimo-32-caracteres-xyz123456789
NODE_ENV=production
PORT=8080
```

### Paso 4: Configurar como servicio
Railway automáticamente:
- ✅ Detecta `npm install`
- ✅ Corre `npm run build`
- ✅ Corre `npm start` (debes agregar script)
- ✅ Abre puerto 8080

### Paso 5: Agregar npm start script
En `package.json`:

```json
{
  "scripts": {
    "start": "node dist/index.cjs",
    "start:prod": "NODE_ENV=production node dist/index.cjs"
  }
}
```

### Paso 6: Deploy automático
```powershell
git add .
git commit -m "Setup for Railway deployment"
git push origin main
```

Railway automáticamente deploya cuando haces push a main.

---

## 🛤️ OPCIÓN 2: Deploy a Render

### Paso 1: Crear cuenta en Render
https://render.com → Sign up con GitHub

### Paso 2: Crear Web Service
1. Dashboard → `New` → `Web Service`
2. Conecta tu repo de GitHub
3. Autoriza Render

### Paso 3: Configuración

```
Name: tech-ascent
Environment: Node
Region: Ohio (más cercano)
Build Command: npm ci && npm run build
Start Command: npm start
```

### Paso 4: Environment Variables
En Settings → Environment:

```
DATABASE_URL=postgresql://...neon.tech/...
SESSION_SECRET=tu-secreto...
NODE_ENV=production
PORT=8080
```

---

## 🛤️ OPCIÓN 3: Deploy a tu servidor (VPS)

### Paso 1: SSH a tu servidor
```powershell
ssh root@tu-ip-servidor
```

### Paso 2: Instalar Node
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Paso 3: Clonar repo
```bash
cd /var/www
git clone https://github.com/gismartz2004/argacademy.git
cd argacademy
```

### Paso 4: Variables de entorno
```bash
nano .env
```

Pega:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/...
SESSION_SECRET=tu-secreto...
NODE_ENV=production
PORT=8080
```

### Paso 5: Instalar y compilar
```bash
npm ci
npm run build
```

### Paso 6: Ejecutar con PM2 (process manager)
```bash
npm install -g pm2
pm2 start "npm start" --name "tech-ascent"
pm2 startup
pm2 save
```

### Paso 7: Nginx como proxy reverso
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

---

## ✅ Checklist de Verificación

```
[✅] Neon database creada y funcionando
[✅] DATABASE_URL copiada correctamente
[✅] SESSION_SECRET definido (mín 32 chars)
[✅] npm start script agregado a package.json
[✅] Dockerfile configurado para NODE_ENV=production
[✅] Health endpoint (/health) funciona
[✅] server/static.ts sirve dist/public
[✅] Variables de entorno en hosting configuradas
[✅] Puerto 8080 mapeado correctamente
[✅] Logs visibles en hosting console
```

---

## 🔄 Deploy Automático con GitHub Actions

### Si usas Railway:
```yaml
# .github/workflows/deploy-neon.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
```

Railway automáticamente detecta cambios en GitHub y deploya.

### Si usas tu VPS:
```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_KEY }}
          script: |
            cd /var/www/argacademy
            git pull origin main
            npm ci
            npm run build
            pm2 restart tech-ascent
```

---

## 🧪 Probar Localmente

```powershell
# 1. Build
npm run build

# 2. Ejecutar como producción
$env:NODE_ENV="production"
$env:DATABASE_URL="postgresql://..."
$env:SESSION_SECRET="tu-secreto"
node dist/index.cjs

# 3. Probar
curl http://localhost:8080/health
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'dist/index.cjs'"
**Solución**: Ejecuta `npm run build` antes de `npm start`

### Error: "Database connection failed"
**Solución**: Verifica que DATABASE_URL es correcto en Neon

### Error: "Cannot GET /"
**Solución**: Verifica que `server/static.ts` sirve correctamente desde `dist/public`

### Servidor se cuelga/no responde
**Solución**: Ver logs con `pm2 logs` o console en Railway/Render

---

## 📊 Costos

| Plataforma | Costo | Notas |
|-----------|------|-------|
| **Railway** | ~$5-20/mes | Paga por uso, gratis hasta $5 |
| **Render** | Gratis | Spin-down si sin tráfico 15min |
| **Neon** | Gratis | 3 projects gratuitos |
| **Tu VPS** | $5-10/mes | DigitalOcean, Linode, etc |
| **Heroku** | Pago | Ya no tiene opción gratis |

**Total recomendado**: Railway ($5-10) + Neon (gratis) = ~$5-10/mes

---

## 🎯 SIGUIENTE PASO

**¿Cuál prefieres?**
1. ✨ **Railway** - Más fácil, recomendado
2. 🔧 **Render** - Buena alternativa
3. 💻 **Tu VPS** - Más control

Dime cuál y te guío paso a paso. 🚀