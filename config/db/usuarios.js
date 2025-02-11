import pool from "../database.js"; // Pool de conexión para interactuar con la base de datos
import bcrypt from "bcryptjs"; // Librería para encriptar contraseñas

// Función para obtener todos los usuarios de la base de datos
export async function getUsuarios() {
  const [rows] = await pool.query("SELECT * FROM usuarios"); // Ejecuta una consulta para obtener todos los usuarios
  return rows; // Retorna los resultados como un array
}

// Función para crear un nuevo usuario con contraseña encriptada
export async function crearUsuario(nombre, email, contraseña) {
  // Verifica si el email ya está registrado
  const [existingUser] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );
  if (existingUser.length > 0) {
    // Lanza un error si el email ya existe en la base de datos
    throw new Error("El email ya está registrado");
  }

  // Encripta la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(contraseña, 10);

  // Inserta el nuevo usuario en la base de datos
  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)",
    [nombre, email, hashedPassword]
  );

  // Retorna los datos básicos del nuevo usuario creado
  return { id: result.insertId, nombre, email };
}

// Función para obtener un usuario por su email
export async function getUsuarioPorEmail(email) {
  // Busca un usuario con el email proporcionado
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
    email,
  ]);

  if (rows.length === 0) {
    // Si no se encuentra el usuario, lanza un error
    throw new Error("Usuario no encontrado");
  }

  return rows[0]; // Retorna el primer resultado encontrado
}