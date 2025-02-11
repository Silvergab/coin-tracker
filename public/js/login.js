document.addEventListener("DOMContentLoaded", () => {
  // Extraer parámetros de la URL para manejar mensajes dinámicos
  const params = new URLSearchParams(window.location.search);
  const mensaje = params.get("mensaje"); // Obtener el mensaje si existe

  if (mensaje) {
    // Mostrar un mensaje de éxito si se proporciona en la URL
    const successMessage = document.getElementById("success-message");
    successMessage.innerText = mensaje; // Configurar el texto del mensaje
    successMessage.style.display = "block"; // Hacer visible el mensaje

    // Ocultar automáticamente el mensaje después de 3 segundos
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }

  // Limpiar mensajes de error mientras el usuario interactúa con el formulario
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("input", () => {
      document.getElementById("error-message").style.display = "none";
    });
  }
});
