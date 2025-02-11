import pool from "../database.js"; // Importa el pool de conexión

// Obtener precios de todas las criptomonedas
export async function getPrecios() {
  const [rows] = await pool.query("SELECT * FROM criptomonedas");
  return rows;
}
