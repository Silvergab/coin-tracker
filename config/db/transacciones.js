import pool from "../database.js"; // Importa el pool de conexión

// Registrar una nueva transacción
export async function registrarTransaccion(id_usuario, id_criptomoneda, cantidad, tipo, precio, fecha_transaccion) {
  const [result] = await pool.query(
    "INSERT INTO transacciones (id_usuario, id_criptomoneda, cantidad, tipo, precio, fecha_transaccion) VALUES (?, ?, ?, ?, ?, ?)",
    [id_usuario, id_criptomoneda, cantidad, tipo, precio, fecha_transaccion]
  );
  return { transactionId: result.insertId };
}
