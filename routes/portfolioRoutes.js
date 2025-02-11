import express from 'express';
import verificarToken from '../middleware/authMiddleware.js';
import pool from '../config/database.js';
import { updatePricesInDatabase } from '../scripts/updatePrices.js';

const router = express.Router();

// Ruta para obtener el portafolio
router.get('/portafolio', verificarToken, async (req, res) => {
  const id_usuario = req.usuario.id; // Obtener el ID del usuario autenticado

  try {
    // Consulta para calcular el portafolio del usuario con datos agregados
    const query = `
      SELECT 
        t.id_criptomoneda AS id,
        c.nombre,
        c.simbolo,
        SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad ELSE -t.cantidad END) AS cantidad_total,
        AVG(CASE WHEN t.tipo = 'compra' THEN t.precio END) AS precio_promedio_compra,
        c.precio AS precio_actual
      FROM transacciones t
      JOIN criptomonedas c ON t.id_criptomoneda = c.id
      WHERE t.id_usuario = ?
      GROUP BY t.id_criptomoneda;
    `;

    const [rows] = await pool.query(query, [id_usuario]);

    // Si no hay transacciones, notificar que el portafolio está vacío
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        portafolio: [],
        message: 'Tu portafolio está vacío. Registra tus primeras transacciones para empezar a rastrear tus inversiones.',
      });
    }

    // Procesar datos para calcular ganancia/pérdida y valor actual de cada criptomoneda
    const portafolio = rows.map((row) => {
      const precioActual = parseFloat(row.precio_actual) || 0;
      const cantidadTotal = parseFloat(row.cantidad_total) || 0;
      const precioPromedioCompra = parseFloat(row.precio_promedio_compra) || 0;

      const valor_actual = cantidadTotal * precioActual;
      const ganancia_perdida = valor_actual - (cantidadTotal * precioPromedioCompra);

      return {
        id: row.id,
        nombre: row.nombre,
        simbolo: row.simbolo,
        cantidad: cantidadTotal.toFixed(2),
        precio_actual: precioActual.toFixed(2),
        valor_actual: valor_actual.toFixed(2),
        ganancia_perdida: ganancia_perdida.toFixed(2),
      };
    });

    res.json({
      success: true,
      message: `Portafolio actualizado. Actualmente rastreas ${portafolio.length} criptomonedas.`,
      portafolio,
    });
  } catch (error) {
    console.error('Error al obtener el portafolio:', error);
    res.status(500).json({
      success: false,
      message: 'Hubo un problema al cargar tu portafolio. Por favor, inténtalo nuevamente más tarde.',
      error: error.message,
    });
  }
});

// Ruta para obtener un resumen del portafolio
router.get('/resumen', verificarToken, async (req, res) => {
  const id_usuario = req.usuario.id;

  try {
    // Consulta para calcular el valor total y las ganancias/pérdidas acumuladas
    const query = `
      SELECT 
        SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad * c.precio END) AS valor_total,
        SUM(
          (CASE WHEN t.tipo = 'compra' THEN t.cantidad * c.precio END) - 
          (CASE WHEN t.tipo = 'compra' THEN t.cantidad * t.precio END)
        ) AS ganancia_total
      FROM transacciones t
      JOIN criptomonedas c ON t.id_criptomoneda = c.id
      WHERE t.id_usuario = ?;
    `;

    const [result] = await pool.query(query, [id_usuario]);

    const valor_total = parseFloat(result[0]?.valor_total) || 0;
    const ganancia_total = parseFloat(result[0]?.ganancia_total) || 0;

    res.json({
      success: true,
      message: 'Resumen del portafolio calculado con éxito.',
      resumen: {
        valor_total: valor_total.toFixed(2),
        ganancia_total: ganancia_total.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error al obtener el resumen:', error);
    res.status(500).json({
      success: false,
      message: 'No pudimos calcular el resumen de tu portafolio. Intenta nuevamente más tarde.',
      error: error.message,
    });
  }
});

// Ruta para obtener el historial de transacciones del usuario
router.get('/historial', verificarToken, async (req, res) => {
  const id_usuario = req.usuario.id;
  const { tipo, id_criptomoneda, simbolo, fecha_inicio, fecha_fin } = req.query;

  try {
    let query = `
      SELECT 
        t.id AS transaccion_id,
        t.tipo,
        t.cantidad,
        t.precio AS precio_unitario,
        (t.cantidad * t.precio) AS total,
        t.fecha_transaccion,
        c.nombre,
        c.simbolo
      FROM transacciones t
      JOIN criptomonedas c ON t.id_criptomoneda = c.id
      WHERE t.id_usuario = ?
    `;

    const params = [id_usuario];

    // Agregar filtros condicionales si se especifican en los parámetros de la solicitud
    if (tipo) {
      query += ' AND t.tipo = ?';
      params.push(tipo);
    }
    if (id_criptomoneda) {
      query += ' AND t.id_criptomoneda = ?';
      params.push(id_criptomoneda);
    }
    if (simbolo) {
      query += ' AND c.simbolo = ?';
      params.push(simbolo);
    }
    if (fecha_inicio) {
      query += ' AND t.fecha_transaccion >= ?';
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += ' AND t.fecha_transaccion <= ?';
      params.push(fecha_fin);
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.json({
        success: true,
        historial: [],
        message: 'No se encontraron transacciones que coincidan con los criterios seleccionados.',
      });
    }

    res.json({
      success: true,
      message: `Se encontraron ${rows.length} transacciones.`,
      historial: rows,
    });
  } catch (error) {
    console.error('Error al obtener el historial de transacciones:', error);
    res.status(500).json({
      success: false,
      message: 'No pudimos recuperar el historial de transacciones. Por favor, inténtalo más tarde.',
      error: error.message,
    });
  }
});

// Ruta para actualizar los precios de las criptomonedas
router.post('/actualizar-precios', verificarToken, async (req, res) => {
  try {
    await updatePricesInDatabase();
    res.json({
      success: true,
      message: 'Los precios de las criptomonedas se han actualizado correctamente.',
    });
  } catch (error) {
    console.error('Error al actualizar los precios:', error);
    res.status(500).json({
      success: false,
      message: 'Hubo un error al actualizar los precios. Intenta nuevamente más tarde.',
      error: error.message,
    });
  }
});

// Ruta para listar todas las criptomonedas disponibles
router.get('/criptomonedas', async (req, res) => {
  try {
    const query = 'SELECT id, nombre, simbolo FROM criptomonedas';
    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay criptomonedas registradas en el sistema.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Se encontraron ${rows.length} criptomonedas.`,
      criptomonedas: rows,
    });
  } catch (error) {
    console.error('Error al obtener la lista de criptomonedas:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo recuperar la lista de criptomonedas. Intenta nuevamente más tarde.',
      error: error.message,
    });
  }
});

export default router;
