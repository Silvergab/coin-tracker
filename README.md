🪙 Coin Tracker

Coin Tracker es una aplicación web que permite a los usuarios monitorear en tiempo real el precio de diversas criptomonedas y gestionar su portafolio personal.

📌 Características

✔ Registro e inicio de sesión con autenticación JWT.
✔ Registro de transacciones de compra y venta de criptomonedas.
✔ Cálculo de ganancias y pérdidas basado en los precios actuales.
✔ Visualización del portafolio y el historial de transacciones.
✔ Actualización manual de precios de criptomonedas.
✔ Interfaz simple y funcional con JavaScript ES6 y CSS puro.

🛠 Tecnologías Utilizadas

Backend: Node.js, Express.js, MySQL

Frontend: HTML, CSS, JavaScript ES6 (sin frameworks como React o Bootstrap)

Autenticación: JSON Web Tokens (JWT)

API de criptomonedas: CoinGecko (para obtener precios en tiempo real)

🚀 Instalación y Configuración

1️⃣ Clonar el Repositorio

git clone https://github.com/tuusuario/cointracker.git
cd cointracker

2️⃣ Configurar el Backend

cd backend
npm install

Crear un archivo .env con:

PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=cointracker
JWT_SECRET=tu_clave_secreta

Ejecutar el servidor:

npm run dev

3️⃣ Configurar el Frontend

El frontend se encuentra en la carpeta public. No requiere configuración adicional. Solo abre index.html en un navegador o inicia un servidor local si lo deseas:

cd public
npx http-server

📌 Uso

1️⃣ Registro/Iniciar sesión en la aplicación.
2️⃣ Agregar transacciones de compra o venta de criptomonedas.
3️⃣ Consultar el portafolio y ver el saldo total.
4️⃣ Actualizar los precios de las criptomonedas manualmente.
5️⃣ Revisar el historial de transacciones realizadas.

📬 Contacto

📧 Email: tuemail@example.com🔗 LinkedIn: Mi Perfil💻 GitHub: @tuusuario

🎯 Mejoras Futuras

Agregar gráficas para visualizar tendencias.

Implementar un sistema de notificación de precios.

Optimizar el rendimiento en grandes volúmenes de datos.

🎉 Contribuciones

Si deseas mejorar Coin Tracker, eres bienvenido a contribuir. Solo haz un fork, crea una rama y envía un pull request.

📜 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente.
