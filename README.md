# 📦 MiniSistema de Gestión de Inventario - CCL
### Desarrollado por Miguel Angel Hurtado Garcia

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

| Herramienta | Versión mínima |
|---|---|
| .NET SDK    | 10.0            |
| Node.js     | 18+            |
| Angular CLI | 19+            |
| PostgreSQL  | 14+            |

---

## 🗄️ 1. Configurar la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Dentro del prompt de psql, crear la base de datos:
CREATE DATABASE inventario_ccl;
\q

# Ejecutar el script SQL (crea la tabla e inserta 33 productos de prueba)
psql -U postgres -d inventario_ccl -f database.sql
```

---

## ⚙️ 2. Configurar y ejecutar el Backend (.NET 10)

### ⚠️ Paso obligatorio — ajustar credenciales de PostgreSQL

Antes de correr el backend, abrir el archivo `InventarioCCL.API/appsettings.json` y reemplazar `TU_USUARIO` y `TU_PASSWORD` con las credenciales de su instalación local de PostgreSQL:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=inventario_ccl;Username=TU_USUARIO;Password=TU_PASSWORD"
}
```

> **Ejemplo con credenciales por defecto de PostgreSQL:**
> ```json
> "DefaultConnection": "Host=localhost;Port=5432;Database=inventario_ccl;Username=postgres;Password=postgres"
> ```
>
> Si instaló PostgreSQL en **macOS con Homebrew**, el usuario suele ser su nombre de sesión y sin contraseña:
> ```json
> "DefaultConnection": "Host=localhost;Port=5432;Database=inventario_ccl;Username=su_usuario_mac;Password="
> ```

### Ejecutar

```bash
cd InventarioCCL.API
dotnet restore
dotnet run
```

El backend quedará disponible en el puerto que asigne .NET (normalmente `5000` o `5158`). Revisar la salida de la terminal, que mostrará algo como:

```
Now listening on: http://localhost:5000
```

- **Swagger UI:** `http://localhost:{PUERTO}/swagger`

---

## 🌐 3. Configurar y ejecutar el Frontend (Angular 19)

### ⚠️ Paso obligatorio — ajustar el puerto del backend

Si el backend quedó en un puerto diferente a `5000`, abrir los dos archivos siguientes y actualizar la URL:

```
inventario-frontend/src/app/core/services/auth.service.ts       → línea 4
inventario-frontend/src/app/core/services/inventario.service.ts → línea 4
```

Cambiar:
```ts
private readonly API = 'http://localhost:5000';
```
por el puerto que arroje su backend, por ejemplo:
```ts
private readonly API = 'http://localhost:5158';
```

### Ejecutar

```bash
cd inventario-frontend
npm install
ng serve
```

> Si `ng` no se reconoce: `npx ng serve`

Frontend disponible en: **http://localhost:4200**

---

## 🔐 Credenciales de acceso a la aplicación

Las credenciales están hardcodeadas en memoria en el backend (no requieren configuración en base de datos):

| Usuario    | Contraseña  |
|------------|-------------|
| `admin`    | `Admin123!` |
| `ccl_user` | `CCL2024#`  |

---

## 📡 Endpoints de la API

| Método | Endpoint                | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | `/auth/login`           | ❌   | Obtener JWT token        |
| POST   | `/productos/movimiento` | ✅   | Registrar entrada/salida |
| GET    | `/productos/inventario` | ✅   | Consultar inventario     |

### Ejemplos con curl

Reemplazar `{PUERTO}` con el puerto real del backend.

**Login:**
```bash
curl -X POST http://localhost:{PUERTO}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "password": "Admin123!"}'
```

**Registrar movimiento:**
```bash
curl -X POST http://localhost:{PUERTO}/productos/movimiento \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"productoId": 1, "tipo": "entrada", "cantidad": 10}'
```

**Consultar inventario:**
```bash
curl -X GET http://localhost:{PUERTO}/productos/inventario \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🧪 Probar con Swagger (recomendado)

1. Abrir `http://localhost:{PUERTO}/swagger`
2. Ejecutar `POST /auth/login` con las credenciales de arriba
3. Copiar el valor del campo `token` de la respuesta
4. Clic en el botón **Authorize** (🔒) → ingresar `Bearer {token}`
5. Ya puede probar `GET /productos/inventario` y `POST /productos/movimiento`

---

