// Importamos las dependencias necesarias
import express from 'express';
import { body, validationResult } from 'express-validator';
import verificarToken from '../middleware/authMiddleware.js';
import pool from '../config/database.js';

const router = express.Router(); // Creamos una instancia de Router

// Ruta para registrar una nueva transacción
router.post(
  '/transacciones',
  verificarToken,
  [
    // Validaciones de los datos de entrada
    body('id_criptomoneda')
      .isInt({ gt: 0 })
      .withMessage('El ID de la criptomoneda debe ser un número entero positivo.'),
    body('cantidad')
      .isFloat({ gt: 0 })
      .withMessage('La cantidad debe ser un número mayor que cero.'),
    body('precio')
      .isFloat({ gt: 0 })
      .withMessage('El precio debe ser un número mayor que cero.'),
    body('tipo')
      .isIn(['compra', 'venta'])
      .withMessage('El tipo debe ser "compra" o "venta".'),
  ],
  async (req, res) => {
    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación al registrar una transacción:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos. Por favor, revisa los campos.',
        errors: errors.array(),
      });
    }

    const { id_criptomoneda, cantidad, precio, tipo } = req.body;
    const id_usuario = req.usuario.id;

    try {
      console.log(`Usuario ${id_usuario} está registrando una transacción...`);
      const query = `
        INSERT INTO transacciones (id_usuario, id_criptomoneda, cantidad, tipo, precio, fecha_transaccion)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const [result] = await pool.query(query, [id_usuario, id_criptomoneda, cantidad, tipo, precio]);

      console.log(`Transacción registrada con éxito. ID: ${result.insertId}`);
      res.json({
        success: true,
        message: 'Tu transacción se ha registrado correctamente.',
        transactionId: result.insertId,
      });
    } catch (error) {
      console.error('Error al registrar la transacción:', error);
      res.status(500).json({
        success: false,
        message: 'Hubo un problema al registrar la transacción. Intenta nuevamente.',
        error: error.message,
      });
    }
  }
);

// Ruta para eliminar una transacción existente
router.delete('/transacciones/:id', verificarToken, async (req, res) => {
  const id_usuario = req.usuario.id;
  const { id } = req.params;

  if (!id) {
    console.log('El ID de la transacción no fue proporcionado.');
    return res.status(400).json({
      success: false,
      message: 'Por favor, proporciona el ID de la transacción que deseas eliminar.',
    });
  }

  try {
    console.log(`Usuario ${id_usuario} intentando eliminar la transacción ID: ${id}`);
    const queryCheck = `
      SELECT * FROM transacciones WHERE id = ? AND id_usuario = ?
    `;
    const [result] = await pool.query(queryCheck, [id, id_usuario]);

    if (result.length === 0) {
      console.log(`La transacción con ID ${id} no pertenece al usuario ${id_usuario}.`);
      return res.status(404).json({
        success: false,
        message: 'No se encontró la transacción o no tienes autorización para eliminarla.',
      });
    }

    const queryDelete = `
      DELETE FROM Transacciones WHERE id = ? AND id_usuario = ?
    `;
    await pool.query(queryDelete, [id, id_usuario]);

    console.log(`Transacción con ID ${id} eliminada con éxito.`);
    res.json({
      success: true,
      message: 'La transacción fue eliminada correctamente.',
    });
  } catch (error) {
    console.error('Error al intentar eliminar la transacción:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar la transacción debido a un problema interno.',
      error: error.message,
    });
  }
});

// Ruta para actualizar una transacción existente
router.put(
  '/transacciones/:id',
  verificarToken,
  [
    // Validaciones opcionales, ya que solo se actualizan ciertos campos
    body('cantidad')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('La cantidad debe ser un número mayor que cero.'),
    body('precio')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('El precio debe ser un número mayor que cero.'),
  ],
  async (req, res) => {
    const id_usuario = req.usuario.id;
    const { id } = req.params;
    const { cantidad, precio } = req.body;

    if (!id) {
      console.log('El ID de la transacción no fue proporcionado.');
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporciona el ID de la transacción que deseas actualizar.',
      });
    }

    try {
      console.log(`Usuario ${id_usuario} intentando actualizar la transacción ID: ${id}`);
      const queryCheck = `
        SELECT * FROM transacciones WHERE id = ? AND id_usuario = ?
      `;
      const [result] = await pool.query(queryCheck, [id, id_usuario]);

      if (result.length === 0) {
        console.log(`La transacción con ID ${id} no pertenece al usuario ${id_usuario}.`);
        return res.status(404).json({
          success: false,
          message: 'No se encontró la transacción o no tienes autorización para actualizarla.',
        });
      }

      const queryUpdate = `
        UPDATE transacciones
        SET cantidad = COALESCE(?, cantidad),
            precio = COALESCE(?, precio)
        WHERE id = ? AND id_usuario = ?
      `;
      await pool.query(queryUpdate, [cantidad, precio, id, id_usuario]);

      console.log(`Transacción con ID ${id} actualizada correctamente.`);
      res.json({
        success: true,
        message: 'La transacción se actualizó correctamente.',
      });
    } catch (error) {
      console.error('Error al intentar actualizar la transacción:', error);
      res.status(500).json({
        success: false,
        message: 'No se pudo actualizar la transacción debido a un problema interno.',
        error: error.message,
      });
    }
  }
);

export default router;
