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

## ⚙️ 2. Ejecutar el Backend (.NET 9)

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

- API: http://localhost:5158
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
| ccl_user   | CCL2024#    |

---

## 📡 Endpoints de la API

| Método | Endpoint                | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | /auth/login             | No   | Obtener JWT token        |
| POST   | /productos/movimiento   | Sí   | Registrar entrada/salida |
| GET    | /productos/inventario   | Sí   | Consultar inventario     |

---

## 🗂️ Historial de commits sugerido

```
feat: initial project structure
feat: add PostgreSQL connection with Entity Framework Core
feat: implement JWT authentication service
feat: add POST /auth/login endpoint
feat: add POST /productos/movimiento endpoint
feat: add GET /productos/inventario endpoint
feat: configure CORS for Angular frontend
feat: add Swagger with JWT Bearer support
feat: add Angular 19 standalone project setup
feat: implement login component with JWT auth
feat: add HTTP interceptor for Bearer token injection
feat: implement inventario component with search and filters
feat: implement movimiento component with live preview
feat: add auth guard and route protection
docs: complete README and database SQL script
```
