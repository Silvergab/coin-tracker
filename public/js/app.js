// Importamos las funciones necesarias desde los módulos auth.js y utils.js.
import { handleLoginForm, handleRegisterForm } from "./auth.js";
import { redirigirSiNoAutenticado } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Coin Tracker está listo"); // Confirmación visual en la consola para depuración.

  // Lista de páginas accesibles sin iniciar sesión (públicas).
  const paginasPublicas = ["/login.html", "/registro.html", "/index.html"];

  // Si el usuario no está autenticado y la página no es pública, se redirige al login.
  redirigirSiNoAutenticado(paginasPublicas);

  // Manejo del formulario de inicio de sesión.
  const formularioLogin = document.getElementById("login-form");
  if (formularioLogin) {
    // Asociamos la función para manejar el evento 'submit' del formulario.
    formularioLogin.addEventListener("submit", handleLoginForm);
  }

  // Manejo del formulario de registro.
  const formularioRegistro = document.getElementById("register-form");
  if (formularioRegistro) {
    // Asociamos la función para manejar el evento 'submit' del formulario.
    formularioRegistro.addEventListener("submit", handleRegisterForm);
  }
});
