import jwt from 'jsonwebtoken';

// Middleware para verificar la autenticidad del token JWT
const verificarToken = (req, res, next) => {
  // Extraer el token del encabezado Authorization
  const token = req.header('Authorization');
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token.',
    });
  }

  // Eliminar el prefijo 'Bearer ' si está presente
  const tokenStr = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    // Verificar el token utilizando la clave secreta definida en las variables de entorno
    const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);

    // Adjuntar los datos decodificados del usuario al objeto de la solicitud
    req.usuario = decoded;

    // Pasar el control al siguiente middleware o ruta
    next();
  } catch (error) {
    // Manejar errores específicos del JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'El token proporcionado es inválido o está mal formado.',
      });
    }

    // Manejar otros errores inesperados
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al verificar el token.',
      error: error.message, // Incluir detalles del error para depuración
    });
  }
};

export default verificarToken;
