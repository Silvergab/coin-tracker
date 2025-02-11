// Importar los módulos necesarios
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // Para manejar rutas en ES Modules
import dotenv from 'dotenv'; // Para cargar variables de entorno
import authRoutes from './routes/authRoutes.js'; // Rutas de autenticación
import transactionRoutes from './routes/transactionRoutes.js'; // Rutas de transacciones
import portfolioRoutes from './routes/portfolioRoutes.js'; // Rutas de portafolio

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express(); // Crear una instancia de la aplicación Express
const port = process.env.PORT || 8000; // Usar el puerto definido en .env o el puerto 8000 por defecto

// Configurar la ruta de archivos estáticos
// __filename y __dirname no están disponibles en ES Modules, por eso se define manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Hacer que los archivos en la carpeta 'public' estén disponibles públicamente
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejar datos JSON en el cuerpo de las solicitudes
app.use(express.json()); // Esto permite analizar el cuerpo JSON en solicitudes POST/PUT

// Middleware para registrar todas las solicitudes entrantes
// Esto ayuda a depurar el tráfico que pasa por el servidor
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next(); // Llamar al siguiente middleware en la cadena
});

// Usar las rutas modularizadas
// Cada conjunto de rutas está modularizado para mantener la organización del código
app.use(authRoutes);           // Maneja registro, login y autenticación
app.use(transactionRoutes);    // Maneja transacciones de compra/venta de criptomonedas
app.use(portfolioRoutes);      // Maneja portafolio, historial y resumen financiero

// Iniciar el servidor y escuchar en el puerto definido
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
