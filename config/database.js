// config/database.js
import mysql from "mysql2"; // Importar el cliente MySQL
import dotenv from "dotenv"; // Importar dotenv para manejar variables de entorno

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

// Crear un pool de conexiones MySQL utilizando promesas
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST, // Dirección del servidor MySQL
    user: process.env.MYSQL_USER, // Usuario de la base de datos
    password: process.env.MYSQL_PASSWORD, // Contraseña del usuario
    database: process.env.MYSQL_DATABASE, // Nombre de la base de datos
    waitForConnections: true, // Esperar a que las conexiones estén disponibles
    connectionLimit: 10, // Máximo número de conexiones en el pool
    queueLimit: 0, // No limitar el tamaño de la cola de solicitudes de conexión
  })
  .promise(); // Transformar el pool para usar promesas en lugar de callbacks

// Exportar el pool para que pueda ser utilizado en otros módulos
export default pool;

// Reexportar funciones específicas desde los archivos de `db` para modularidad
export * from './db/usuarios.js'; // Funciones relacionadas con usuarios
export * from './db/criptomonedas.js'; // Funciones relacionadas con criptomonedas
export * from './db/transacciones.js'; // Funciones relacionadas con transacciones
