CREATE DATABASE coin_tracker;

USE coin_tracker;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE criptomonedas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    simbolo VARCHAR(10) UNIQUE NOT NULL,
    precio DECIMAL(15, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO criptomonedas (nombre, simbolo, precio)
VALUES 
    ('Bitcoin', 'BTC', 50000.00), 
    ('Ethereum', 'ETH', 3500.00);

CREATE TABLE transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, 
    id_criptomoneda INT NOT NULL,
    tipo ENUM('compra', 'venta') NOT NULL,
    cantidad DECIMAL(15, 8) NOT NULL,
    precio DECIMAL(15, 2) NOT NULL,
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_criptomoneda) REFERENCES criptomonedas(id)
);
