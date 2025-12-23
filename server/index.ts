import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Extensión de tipo para rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// ✅ Habilitar CORS
// En desarrollo, permitimos cualquier origen (ajusta en producción)
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? ["https://tu-dominio.com"] // 🔒 Restringe en producción
    : "*", // 🛠️ Permitir todos en desarrollo (solo para local)
  credentials: true, // Si usas cookies/sesiones
};
app.use(cors(corsOptions));

// Parseo de JSON con rawBody
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Serve uploads directory
app.use("/uploads", express.static("uploads"));

// Logger util
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Logger de requests API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// Inicialización asíncrona
(async () => {
  await registerRoutes(httpServer, app);

  // Manejo global de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // Opcional: no lances el error aquí si ya lo manejaste
    // throw err; // ← esto puede reiniciar el proceso; mejor quitarlo
  });

  // Configuración de frontend (Vite en dev, static en prod)
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Health check endpoint para Cloud Run
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // ✅ Puerto: 5000 en dev, 8080 en producción (Cloud Run)
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`Servidor corriendo en http://0.0.0.0:${port}`);
      if (process.env.NODE_ENV !== "production") {
        log(`Modo: desarrollo (Vite integrado)`);
      } else {
        log(`Modo: producción`);
      }
    }
  );
})();