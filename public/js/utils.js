// Obtiene el token JWT almacenado en localStorage
export function obtenerToken() {
  return localStorage.getItem('token');
}

// Verifica si el usuario está autenticado basado en la presencia del token
export function estaAutenticado() {
  return !!obtenerToken();
}

// Cierra la sesión eliminando el token y redirige al usuario al login con un mensaje opcional
export function cerrarSesion(mensaje = "Tu sesión ha expirado o se ha cerrado.") {
  localStorage.removeItem('token');
  const url = `/login.html?mensaje=${encodeURIComponent(mensaje)}`;
  window.location.href = url;
}

// Redirige al login si el usuario no está autenticado, salvo que esté en una página pública
export function redirigirSiNoAutenticado(paginasPublicas = []) {
  const esPaginaPublica = paginasPublicas.includes(window.location.pathname);

  if (!estaAutenticado() && !esPaginaPublica) {
    cerrarSesion("Debes iniciar sesión para acceder a esta página.");
    return false; // El usuario no está autenticado
  }

  // Verificar si el token ha expirado (opcional pero útil para mayor seguridad)
  if (estaAutenticado()) {
    const token = obtenerToken();
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del token
      const exp = payload.exp * 1000; // Convierte la expiración a milisegundos
      if (Date.now() >= exp) {
        cerrarSesion("Tu sesión ha expirado o se ha cerrado.");
        return false; // Token expirado, redirige al login
      }
    } catch (error) {
      console.error("Token inválido:", error);
      cerrarSesion("Token inválido.");
      return false; // Token corrupto o malformado
    }
  }
  return true; // El usuario está autenticado y el token es válido
}

// Muestra un mensaje de error en el elemento con ID "error-message"
// Si no existe, muestra una alerta como respaldo
export function mostrarError(mensaje) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerText = mensaje;
  } else {
    alert(mensaje);
  }
}

// Muestra un mensaje de éxito en el elemento con ID "success-message"
// Borra el mensaje automáticamente después de 3 segundos
export function mostrarMensaje(mensaje) {
  const mensajeDiv = document.getElementById('success-message');
  if (mensajeDiv) {
    mensajeDiv.innerText = mensaje;
    setTimeout(() => (mensajeDiv.innerText = ''), 3000); // Limpia el mensaje tras 3 segundos
  } else {
    alert(mensaje);
  }
}
