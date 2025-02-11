// Importaciones necesarias para configurar las rutas de autenticación
import express from "express";
import bcrypt from "bcryptjs"; // Para el manejo de contraseñas
import jwt from "jsonwebtoken"; // Para generar tokens de autenticación
import { crearUsuario, getUsuarioPorEmail } from "../config/database.js"; // Funciones personalizadas para base de datos
import { body, validationResult } from "express-validator"; // Validación de datos del cuerpo de la solicitud

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post(
  "/usuarios",
  [
    // Validaciones para asegurar que los datos sean correctos
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio.")
      .isLength({ min: 3 })
      .withMessage("El nombre debe tener al menos 3 caracteres."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El email es obligatorio.")
      .isEmail()
      .withMessage("El formato del email no es válido.")
      .normalizeEmail(), // Normaliza el email (por ejemplo, elimina espacios innecesarios)
    body("contraseña")
      .notEmpty()
      .withMessage("La contraseña es obligatoria.")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres."),
  ],
  async (req, res) => {
    // Validación de los datos proporcionados en la solicitud
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si hay errores de validación, se envían al cliente
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nombre, email, contraseña } = req.body; // Extraer los datos enviados por el cliente
    try {
      // Verificar si el usuario ya existe en la base de datos
      let existingUser;
      try {
        existingUser = await getUsuarioPorEmail(email); // Buscar usuario por email
      } catch (e) {
        // Si no se encuentra el usuario, se lanza un error específico
        if (e.message !== "Usuario no encontrado") {
          throw e; // Solo continuar si el error es "Usuario no encontrado"
        }
      }

      if (existingUser) {
        // Responder si el email ya está registrado
        return res
          .status(400)
          .json({
            success: false,
            message: "Este correo ya está registrado. Intenta con otro.",
          });
      }

      // Crear un nuevo usuario con los datos proporcionados
      const nuevoUsuario = await crearUsuario(nombre, email, contraseña);
      res.json({
        success: true,
        usuario: nuevoUsuario,
        message: `¡Bienvenido, ${nombre}! Tu cuenta ha sido creada con éxito.`,
      });
    } catch (error) {
      // Manejo de errores generales
      res.status(500).json({
        success: false,
        message:
          "No se pudo completar tu registro. Por favor, inténtalo más tarde.",
        error: error.message,
      });
    }
  }
);

// Ruta para iniciar sesión
router.post(
  "/login",
  [
    // Validaciones para el email y contraseña
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El email es obligatorio.")
      .isEmail()
      .withMessage("El formato del email no es válido.")
      .normalizeEmail(),
    body("contraseña").notEmpty().withMessage("La contraseña es obligatoria."),
  ],
  async (req, res) => {
    // Validar los datos ingresados por el usuario
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, contraseña } = req.body; // Extraer datos del cuerpo de la solicitud
    try {
      // Buscar el usuario por email
      const usuario = await getUsuarioPorEmail(email);
      if (!usuario) {
        // Responder si el email no está registrado
        return res.status(404).json({
          success: false,
          message:
            "No encontramos una cuenta con este correo. Verifica tus datos.",
        });
      }

      // Verificar si la contraseña es correcta
      const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!isMatch) {
        // Responder si la contraseña no coincide
        return res.status(400).json({
          success: false,
          message: "La contraseña ingresada es incorrecta. Intenta nuevamente.",
        });
      }

      // Generar un token JWT para el usuario autenticado
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // El token expira en 1 hora
      );

      // Responder con un mensaje de éxito y el token generado
      res.json({
        success: true,
        message: "Inicio de sesión exitoso. ¡Bienvenido de vuelta!",
        token,
      });
    } catch (error) {
      // Manejo de errores generales
      res.status(500).json({
        success: false,
        message:
          "Hubo un error al iniciar sesión. Por favor, inténtalo más tarde.",
        error: error.message,
      });
    }
  }
);

export default router;
