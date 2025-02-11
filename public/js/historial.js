import {
  obtenerToken,
  mostrarError,
  redirigirSiNoAutenticado,
  cerrarSesion,
} from "./utils.js";

// Función para cargar el historial de transacciones del usuario
async function cargarHistorial() {
  console.log("Iniciando carga del historial de transacciones...");
  const token = obtenerToken();
  if (!token) {
    console.error("No se encontró un token. El usuario no está autenticado.");
    return;
  }

  try {
    // Realizar petición al servidor para obtener el historial
    const response = await fetch("/historial", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Incluir token en la cabecera
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Datos recibidos del servidor:", data);

    if (data.success) {
      // Si la respuesta es exitosa, renderizar el historial
      mostrarHistorial(data.historial);
    } else {
      mostrarError(data.message || "No se pudo cargar el historial.");
    }
  } catch (error) {
    console.error("Error al cargar el historial:", error);
    mostrarError("Ocurrió un error inesperado al cargar el historial.");
  }
}

// Renderizar el historial en la tabla
function mostrarHistorial(historial) {
  console.log("Renderizando el historial en la tabla...");
  const tableBody = document.getElementById("transactions-table");
  tableBody.innerHTML = "";

  if (historial.length === 0) {
    // Mensaje si no hay transacciones registradas
    tableBody.innerHTML =
      "<tr><td colspan='7'>No se encontraron transacciones.</td></tr>";
    return;
  }

  historial.forEach((transaccion) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaccion.tipo}</td>
      <td contenteditable="true" data-field="cantidad">${parseFloat(
        transaccion.cantidad
      ).toFixed(2)}</td>
      <td contenteditable="true" data-field="precio">${parseFloat(
        transaccion.precio_unitario
      ).toFixed(2)}</td>
      <td>${parseFloat(transaccion.total).toFixed(2)} USD</td>
      <td>${new Date(transaccion.fecha_transaccion).toLocaleString()}</td>
      <td>${transaccion.nombre} (${transaccion.simbolo})</td>
      <td>
        <button class="guardar" data-id="${
          transaccion.transaccion_id
        }">Guardar</button>
        <button class="eliminar" data-id="${
          transaccion.transaccion_id
        }">Eliminar</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Agregar eventos a los botones después de renderizar la tabla
  agregarEventosHistorial();
}

// Vincular eventos a los botones de la tabla
function agregarEventosHistorial() {
  console.log("Vinculando eventos a los botones del historial...");
  const botonesEliminar = document.querySelectorAll(".eliminar");
  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", eliminarTransaccion);
  });

  const botonesGuardar = document.querySelectorAll(".guardar");
  botonesGuardar.forEach((btn) => {
    btn.addEventListener("click", guardarTransaccion);
  });
}

// Eliminar una transacción del historial
async function eliminarTransaccion(e) {
  const id = e.target.dataset.id;
  console.log(`Solicitando eliminar la transacción con ID: ${id}`);
  const token = obtenerToken();

  if (!id) {
    mostrarError("No se encontró el ID de la transacción.");
    return;
  }

  try {
    const response = await fetch(`/transacciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    console.log("Respuesta al eliminar transacción:", data);

    if (data.success) {
      alert("Transacción eliminada exitosamente.");
      cargarHistorial(); // Recargar el historial actualizado
    } else {
      mostrarError(data.message || "Error al eliminar la transacción.");
    }
  } catch (error) {
    console.error("Error al eliminar la transacción:", error);
    mostrarError("Ocurrió un error al intentar eliminar la transacción.");
  }
}

// Guardar cambios en una transacción
async function guardarTransaccion(e) {
  const id = e.target.dataset.id;
  console.log(`Solicitando guardar cambios en la transacción con ID: ${id}`);
  const token = obtenerToken();

  const fila = e.target.closest("tr");
  const cantidad = fila
    .querySelector('[data-field="cantidad"]')
    .innerText.trim();
  const precio = fila.querySelector('[data-field="precio"]').innerText.trim();

  if (!cantidad || !precio || isNaN(cantidad) || isNaN(precio)) {
    mostrarError("Cantidad y precio deben ser valores numéricos válidos.");
    return;
  }

  try {
    const response = await fetch(`/transacciones/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cantidad: parseFloat(cantidad),
        precio: parseFloat(precio),
      }),
    });

    const data = await response.json();
    console.log("Respuesta al guardar cambios:", data);

    if (data.success) {
      alert("Cambios guardados correctamente.");
      cargarHistorial(); // Recargar historial actualizado
    } else {
      mostrarError(data.message || "No se pudo actualizar la transacción.");
    }
  } catch (error) {
    console.error("Error al guardar los cambios en la transacción:", error);
    mostrarError("Ocurrió un error al intentar guardar los cambios.");
  }
}

// Inicializar el historial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("Historial inicializado.");
  if (!redirigirSiNoAutenticado()) {
    return; // Detener ejecución si el usuario no está autenticado
  }

  cargarHistorial();

  // Configurar eventos de navegación y cierre de sesión
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => cerrarSesion());
  }

  const verPortafolioButton = document.getElementById("ver-portafolio");
  if (verPortafolioButton) {
    verPortafolioButton.addEventListener("click", () => {
      window.location.href = "/dashboard.html";
    });
  }
});
