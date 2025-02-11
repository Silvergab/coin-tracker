// Manejar el formulario de login
export async function handleLoginForm(e) {
  e.preventDefault(); // Evita el comportamiento predeterminado del formulario (recargar la página).

  // Seleccionamos los contenedores de mensajes de error y éxito.
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  // Aseguramos que no se muestren mensajes previos al intentar iniciar sesión nuevamente.
  errorMessage.style.display = "none";
  successMessage.style.display = "none";

  // Obtenemos los valores del formulario ingresados por el usuario.
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validamos que ambos campos estén llenos antes de enviar la solicitud.
  if (!email || !password) {
    errorMessage.innerText = "Por favor, llena ambos campos para iniciar sesión.";
    errorMessage.style.display = "block";
    return;
  }

  try {
    // Enviamos la solicitud al backend con los datos de inicio de sesión.
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email, contraseña: password }),
    });

    const data = await response.json(); // Convertimos la respuesta del servidor en un objeto.

    if (response.ok && data.success) {
      // Si la autenticación es exitosa, guardamos el token del usuario en el almacenamiento local.
      localStorage.setItem("token", data.token);
      // Redirigimos al dashboard.
      window.location.href = "dashboard.html";
    } else {
      // Si hubo un problema, mostramos el mensaje proporcionado por el servidor.
      const mensajeError = data.message || "No pudimos iniciar sesión. Verifica tus credenciales.";
      errorMessage.innerText = mensajeError;
      errorMessage.style.display = "block";
    }
  } catch (error) {
    // Manejamos cualquier error inesperado, como problemas de conexión.
    console.error("Error al intentar iniciar sesión:", error);
    errorMessage.innerText = "Algo salió mal. Intenta nuevamente más tarde.";
    errorMessage.style.display = "block";
  }
}

// Manejar el formulario de registro
export async function handleRegisterForm(e) {
  e.preventDefault(); // Bloqueamos el comportamiento estándar del formulario.

  // Obtenemos los valores del formulario que ingresó el usuario.
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validamos que todos los campos estén completos.
  if (!name || !email || !password) {
    document.getElementById("error-message").innerText = "Todos los campos son obligatorios. Por favor, complétalos.";
    return;
  }

  try {
    // Enviamos la solicitud al servidor para registrar al nuevo usuario.
    const response = await fetch("/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ nombre: name, email, contraseña: password }),
    });

    const data = await response.json(); // Convertimos la respuesta en un objeto.

    if (response.ok && data.success) {
      // Si el registro es exitoso, notificamos al usuario y redirigimos al login.
      document.getElementById("success-message").innerText = "Registro exitoso. Redirigiendo al inicio de sesión...";
      setTimeout(() => {
        window.location.href = "login.html?mensaje=Registro%20completado";
      }, 2000);
    } else {
      // Mostramos los errores específicos devueltos por el servidor.
      if (data.errors && data.errors.length > 0) {
        document.getElementById("error-message").innerText = data.errors[0].msg;
      } else {
        document.getElementById("error-message").innerText = data.message || "No pudimos completar el registro.";
      }
    }
  } catch (error) {
    // Manejamos errores inesperados.
    console.error("Error al intentar registrarse:", error);
    document.getElementById("error-message").innerText =
      "Ocurrió un problema. Por favor, intenta más tarde.";
  }
}
