# 📦 MiniSistema de Gestión de Inventario - CCL

Sistema web full-stack para gestión de inventario de productos, con autenticación JWT, backend en C# (.NET 9) y frontend en Angular 19.

---

## 🏗️ Arquitectura

```
InventarioCCL/
├── InventarioCCL.API/              # Backend .NET 9
│   ├── Controllers/                # AuthController, ProductosController
│   ├── Data/                       # AppDbContext (EF Core)
│   ├── DTOs/                       # Request/Response models
│   ├── Models/                     # Entidades (Producto)
│   ├── Services/                   # JwtService
│   ├── appsettings.json
│   └── Program.cs
├── inventario-frontend/            # Frontend Angular 19
│   └── src/app/
│       ├── core/                   # Guards, Interceptors, Services
│       ├── features/               # Login, Inventario, Movimiento
│       └── shared/                 # Navbar, Models
├── database.sql                    # Script de base de datos
└── README.md
```

---

## ✅ Requisitos previos

| Herramienta   | Versión mínima |
|---|---|
| .NET SDK      | 9.0            |
| Node.js       | 18+            |
| Angular CLI   | 19+            |
| PostgreSQL    | 14+            |

---

## 🗄️ 1. Configurar la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE inventario_ccl;
\q

# Ejecutar el script SQL (crea tabla + datos iniciales)
psql -U postgres -d inventario_ccl -f database.sql
```

---

## ⚙️ 2. Ejecutar el Backend (.NET 10.0)

Ajustar credenciales en InventarioCCL.API/appsettings.json si es necesario:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=inventario_ccl;Username=TU_USUARIO;Password=TU_PASSWORD"
}
```

```bash
cd InventarioCCL.API
dotnet restore
dotnet run
```

- API: http://localhost:5158 //  http://localhost:5000 ---- segun el puerto que arroje el backend en mi caso el 5000
- Swagger: http://localhost:5158/swagger

---

## 🌐 3. Ejecutar el Frontend (Angular 19)

```bash
cd inventario-frontend
npm install
npx ng serve
```

Frontend disponible en: http://localhost:4200

---

## 🔐 Credenciales de acceso

| Usuario    | Contraseña  |
|---|---|
| admin      | Admin123!   |
| ccl_user   | CCL2026#    |

---

## 📡 Endpoints de la API

| Método | Endpoint                | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | /auth/login             | No   | Obtener JWT token        |
| POST   | /productos/movimiento   | Sí   | Registrar entrada/salida |
| GET    | /productos/inventario   | Sí   | Consultar inventario     |


###Login

```bash
curl -X POST http://localhost:5158/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "password": "Admin123!"}'
```

### Movimiento (con token)

```bash
curl -X POST http://localhost:5158/productos/movimiento \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"productoId": 1, "tipo": "entrada", "cantidad": 10}'
```

### Inventario

```bash
curl -X GET http://localhost:5158/productos/inventario \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```
---

