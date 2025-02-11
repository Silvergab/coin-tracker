import {
  obtenerToken,
  mostrarError,
  mostrarMensaje,
  cerrarSesion,
  redirigirSiNoAutenticado,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado antes de continuar
  if (!redirigirSiNoAutenticado()) {
    return; // Detener ejecución si no está autenticado
  }

  // Cargar el portafolio del usuario al cargar la página
  cargarPortafolio();

  // Llamar a la función de cargar criptomonedas al cargar el dashboard
  cargarCriptomonedas();

  // Configurar el botón "Actualizar Precios"
  const updateButton = document.getElementById("update-prices");
  if (updateButton) {
    updateButton.addEventListener("click", actualizarPrecios);
  }

  // Configurar el botón "Cerrar Sesión"
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault(); // Evitar comportamiento por defecto del enlace
      cerrarSesion("Has cerrado sesión correctamente.");
    });
  }

  // Configurar el formulario de registro de transacciones
  const transactionForm = document.getElementById("transaction-form");
  if (transactionForm) {
    transactionForm.addEventListener("submit", registrarTransaccion);
  }

  // Configurar el botón "Ver Historial"
  const verHistorialButton = document.getElementById("ver-historial");
  if (verHistorialButton) {
    verHistorialButton.addEventListener("click", () => {
      window.location.href = "/historial.html";
    });
  }
});

// Cargar y mostrar el portafolio del usuario
async function cargarPortafolio() {
  const token = obtenerToken();
  if (!token) {
    console.error("No se encontró un token. El usuario no está autenticado.");
    cerrarSesion("Debes iniciar sesión para acceder a esta página.");
    return;
  }

  try {
    const response = await fetch("/portafolio", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.success) {
      mostrarPortafolio(data.portafolio); // Renderizar el portafolio en la tabla
    } else {
      mostrarError(
        data.message || "Error desconocido al cargar el portafolio."
      );
    }
  } catch (error) {
    mostrarError("Error al cargar el portafolio.");
  }
}

// Renderizar los datos del portafolio en la tabla
function mostrarPortafolio(portafolio) {
  const tableBody = document.getElementById("portfolio-table");
  tableBody.innerHTML = ""; // Limpiar contenido previo

  if (portafolio.length === 0) {
    // Mostrar mensaje si no hay datos en el portafolio
    tableBody.innerHTML =
      "<tr><td colspan='7'>No hay datos en el portafolio.</td></tr>";
    return;
  }

  // Crear filas dinámicamente para cada criptomoneda en el portafolio
  portafolio.forEach((cripto) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cripto.id}</td>
      <td>${cripto.nombre}</td>
      <td>${cripto.simbolo}</td>
      <td>${cripto.cantidad}</td>
      <td>${parseFloat(cripto.precio_actual).toFixed(2)} USD</td>
      <td>${parseFloat(cripto.valor_actual).toFixed(2)} USD</td>
      <td>${parseFloat(cripto.ganancia_perdida).toFixed(2)} USD</td>
    `;
    tableBody.appendChild(row);
  });
}

// Registrar una nueva transacción
async function registrarTransaccion(e) {
  e.preventDefault();

  const token = obtenerToken();
  const idCriptomoneda = document
    .getElementById("id-criptomoneda")
    .value.trim();
  const cantidad = document.getElementById("cantidad").value.trim();
  const precio = document.getElementById("precio").value.trim();
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;

  // Validar campos vacíos
  if (!idCriptomoneda || !cantidad || !precio || !tipo) {
    mostrarError("Por favor, completa todos los campos del formulario.");
    return;
  }

  try {
    const response = await fetch("/transacciones", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_criptomoneda: parseInt(idCriptomoneda),
        cantidad: parseFloat(cantidad),
        precio: parseFloat(precio),
        tipo,
      }),
    });

    const data = await response.json();
    if (data.success) {
      mostrarMensaje("Transacción registrada correctamente.");
      cargarPortafolio(); // Actualizar el portafolio
      document.getElementById("transaction-form").reset(); // Limpiar formulario
    } else {
      const errorMsg = data.errors
        ? data.errors.map((err) => err.msg).join(" ")
        : data.message || "Error desconocido al registrar la transacción.";
      mostrarError(errorMsg);
    }
  } catch (error) {
    mostrarError("Error al registrar la transacción.");
  }
}

// Actualizar los precios de las criptomonedas
async function actualizarPrecios() {
  const token = obtenerToken();
  if (!token) {
    console.error("No se encontró un token. El usuario no está autenticado.");
    cerrarSesion("Debes iniciar sesión para acceder a esta página.");
    return;
  }
  const messageElement = document.getElementById("update-message");

  try {
    const response = await fetch("/actualizar-precios", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
      messageElement.innerText = "Precios actualizados correctamente.";
      messageElement.style.display = "block"; // Asegúrate de que se muestre el mensaje
      cargarPortafolio();

      // Borra el mensaje después de 3 segundos
      setTimeout(() => {
        messageElement.innerText = "";
        messageElement.style.display = "none";
      }, 3000);
    } else {
      messageElement.innerText = "Error al actualizar los precios.";
    }
  } catch (error) {
    mostrarError("Error al actualizar los precios.");
  }
}

// Cargar la lista de criptomonedas disponibles
async function cargarCriptomonedas() {
  try {
    const response = await fetch("/criptomonedas");
    const data = await response.json();

    if (data.success && data.criptomonedas) {
      const cryptoListTable = document
        .getElementById("crypto-list-table")
        .querySelector("tbody");
      cryptoListTable.innerHTML = ""; // Limpiar contenido previo

      // Renderizar criptomonedas en la tabla
      data.criptomonedas.forEach((crypto) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${crypto.id}</td>
          <td>${crypto.nombre}</td>
          <td>${crypto.simbolo}</td>
        `;
        cryptoListTable.appendChild(row);
      });
    } else {
      console.error("Error al cargar criptomonedas:", data.message);
      const cryptoListTable = document
        .getElementById("crypto-list-table")
        .querySelector("tbody");
      cryptoListTable.innerHTML =
        '<tr><td colspan="3">No se pudieron cargar las criptomonedas.</td></tr>';
    }
  } catch (error) {
    console.error("Error al obtener criptomonedas:", error);
    const cryptoListTable = document
      .getElementById("crypto-list-table")
      .querySelector("tbody");
    cryptoListTable.innerHTML =
      '<tr><td colspan="3">Error al conectar con el servidor.</td></tr>';
  }
}
