import fetch from "node-fetch"; // Biblioteca para realizar solicitudes HTTP
import pool from "../config/database.js"; // Conexión a la base de datos

// Función para obtener precios de criptomonedas desde la API de CoinGecko
async function fetchPrices() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

  try {
    // Realizamos la solicitud a la API de CoinGecko
    const response = await fetch(url);
    const prices = await response.json(); // Parseamos la respuesta JSON
    return prices; // Retornamos los precios obtenidos
  } catch (error) {
    // Si ocurre un error durante la solicitud, lo registramos en consola
    console.error("Error al obtener los precios desde la API:", error);
    return null; // Retornamos null para indicar que no se pudieron obtener datos
  }
}

// Función principal para actualizar los precios en la base de datos
export async function updatePricesInDatabase() {
  // Llamamos a la API para obtener los precios de las criptomonedas
  const prices = await fetchPrices();

  // Si no se obtuvieron precios, terminamos la ejecución con un mensaje
  if (!prices) {
    console.error(
      "No se pudo actualizar los precios porque no se obtuvieron datos de la API."
    );
    return;
  }

  try {
    // Actualizar el precio de Bitcoin en la base de datos
    const bitcoinPrice = prices.bitcoin.usd; // Obtenemos el precio actual de Bitcoin
    console.log(`Precio actualizado de Bitcoin obtenido: $${bitcoinPrice}`);

    const [btcResult] = await pool.query(
      "UPDATE Criptomonedas SET precio = ? WHERE simbolo = ?",
      [bitcoinPrice, "BTC"] // Actualizamos el precio donde el símbolo es BTC
    );

    // Verificamos si se afectaron filas en la base de datos
    if (btcResult.affectedRows > 0) {
      console.log(
        "El precio de Bitcoin se actualizó correctamente en la base de datos."
      );
    } else {
      console.warn(
        "No se encontró Bitcoin en la base de datos. No se pudo actualizar su precio."
      );
    }

    // Actualizar el precio de Ethereum en la base de datos
    const ethereumPrice = prices.ethereum.usd; // Obtenemos el precio actual de Ethereum
    console.log(`Precio actualizado de Ethereum obtenido: $${ethereumPrice}`);

    const [ethResult] = await pool.query(
      "UPDATE criptomonedas SET precio = ? WHERE simbolo = ?",
      [ethereumPrice, "ETH"] // Actualizamos el precio donde el símbolo es ETH
    );

    // Verificamos si se afectaron filas en la base de datos
    if (ethResult.affectedRows > 0) {
      console.log(
        "El precio de Ethereum se actualizó correctamente en la base de datos."
      );
    } else {
      console.warn(
        "No se encontró Ethereum en la base de datos. No se pudo actualizar su precio."
      );
    }
  } catch (error) {
    // Si ocurre un error al actualizar en la base de datos, lo registramos en consola
    console.error(
      "Hubo un error al intentar actualizar los precios en la base de datos:",
      error
    );
  }
}
