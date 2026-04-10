-- ============================================================
-- Script de Base de Datos - Sistema de Inventario CCL
-- Motor: PostgreSQL
-- ============================================================

-- 1. Crear base de datos (ejecutar conectado a 'postgres')
-- CREATE DATABASE inventario_ccl;

-- 2. Conectar a inventario_ccl y ejecutar lo siguiente:

-- ── Tabla de productos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(200) NOT NULL,
    cantidad INT          NOT NULL DEFAULT 0 CHECK (cantidad >= 0)
);

-- ── Datos iniciales ───────────────────────────────────────────
INSERT INTO productos (nombre, cantidad) VALUES
    ('Laptop Dell Inspiron 15',     25),
    ('Monitor Samsung 24"',         40),
    ('Teclado Mecánico Logitech',   60),
    ('Mouse Inalámbrico HP',        80),
    ('Webcam Logitech C920',        15),
    ('Auriculares Sony WH-1000XM5', 20),
    ('Disco Duro Externo 1TB',      35),
    ('Memoria RAM 16GB DDR5',       50),
    ('Silla Ergonómica OfficePro',  10),
    ('Cable HDMI 2m',               100);

-- ── Verificar datos ───────────────────────────────────────────
SELECT * FROM productos ORDER BY id;
