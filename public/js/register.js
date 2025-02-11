document.addEventListener("DOMContentLoaded", () => {
  // Obtener referencias a los elementos del formulario y los mensajes
  const form = document.getElementById("register-form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");

  // Manejar el envío del formulario
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar que se recargue la página al enviar el formulario

    // Capturar los valores de los campos de entrada
    const nombre = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const contraseña = document.getElementById("password").value;

    // Ocultar mensajes previos
    successMessage.style.display = "none";
    errorMessage.style.display = "none";

    try {
      // Realizar una solicitud al backend para registrar al usuario
      const response = await fetch("/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, contraseña }), // Convertir los datos a JSON
      });

      const data = await response.json(); // Parsear la respuesta en formato JSON

      if (response.ok && data.success) {
        // Mostrar un mensaje de éxito al usuario
        successMessage.innerText = "Registro exitoso. ¡Bienvenido!";
        successMessage.style.display = "block";

        // Ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000);

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = "/login.html?mensaje=Registro%20exitoso";
        }, 2000);
      } else {
        // Si hay errores de validación, mostrarlos
        const errors = data.errors || [{ msg: data.message }];
        errorMessage.innerText = errors.map((err) => err.msg).join(", ");
        errorMessage.style.display = "block";

        // Ocultar el mensaje de error después de 3 segundos
        setTimeout(() => {
          errorMessage.style.display = "none";
        }, 3000);
      }
    } catch (error) {
      // Mostrar un mensaje genérico si ocurre un error inesperado
      errorMessage.innerText = "Ocurrió un error al procesar tu registro.";
      errorMessage.style.display = "block";

      // Ocultar el mensaje de error después de 3 segundos
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);
    }
  });

  // Limpiar mensajes de error mientras el usuario interactúa con el formulario
  form.addEventListener("input", () => {
    errorMessage.style.display = "none";
  });
});
