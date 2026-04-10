-- ============================================================
-- Script de Base de Datos - Sistema de Inventario CCL
-- Motor: PostgreSQL
-- ============================================================

-- 1. Crear base de datos (ejecutar conectado a 'postgres')
-- CREATE DATABASE inventario_ccl;

-- 2. Conectar a inventario_ccl y ejecutar lo siguiente:

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(200) NOT NULL,
    cantidad INT          NOT NULL DEFAULT 0 CHECK (cantidad >= 0)
);

-- Limpiar e insertar 33 productos
TRUNCATE TABLE productos RESTART IDENTITY;

INSERT INTO productos (nombre, cantidad) VALUES
    ('Laptop Dell Inspiron 15',          25),
    ('Laptop HP Pavilion 14',            18),
    ('Laptop MacBook Air M2',             8),
    ('Laptop Lenovo ThinkPad E14',       12),
    ('Laptop Asus VivoBook 15',          22),
    ('Monitor Samsung 24"',              40),
    ('Monitor LG UltraWide 29"',         14),
    ('Monitor Dell 27" 4K',               7),
    ('Monitor AOC 22" FHD',              33),
    ('Teclado Mecánico Logitech MX',     60),
    ('Teclado Inalámbrico Microsoft',    45),
    ('Teclado Compacto Apple Magic',      9),
    ('Mouse Inalámbrico HP',             80),
    ('Mouse Logitech MX Master 3',       27),
    ('Mouse Ergonómico Anker',           55),
    ('Webcam Logitech C920',             15),
    ('Webcam Razer Kiyo Pro',             6),
    ('Auriculares Sony WH-1000XM5',      20),
    ('Auriculares Jabra Evolve2 55',      4),
    ('Audífonos JBL Tune 510BT',         38),
    ('Disco Duro Externo 1TB Seagate',   35),
    ('Disco Duro Externo 2TB WD',        19),
    ('SSD Interno Samsung 870 1TB',      42),
    ('Memoria RAM 16GB DDR5',            50),
    ('Memoria RAM 32GB DDR5',            11),
    ('USB Hub 7 Puertos Anker',          73),
    ('Adaptador USB-C a HDMI',           90),
    ('Cable HDMI 2m',                   100),
    ('Cable USB-C 2m Belkin',            66),
    ('Webcam Elgato Facecam',             3),
    ('Silla Ergonómica OfficePro',       10),
    ('Soporte Laptop Ajustable',         28),
    ('Lámpara LED Escritorio',           47);

-- Verificar
SELECT * FROM productos ORDER BY id;