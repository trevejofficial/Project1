# 🇨🇺 CubaRemesas

Aplicación de envío de **remesas a Cuba**. Permite a un usuario registrarse,
guardar destinatarios en la isla, cotizar un envío con la tasa USD → CUP del
día y crear envíos con seguimiento de estado.

> ⚠️ **Demo educativa.** No procesa pagos reales ni mueve dinero. La tasa de
> cambio y los estados de las transacciones son simulados.

## ✨ Funcionalidades

- **Registro e inicio de sesión** con JWT y contraseñas cifradas (bcrypt).
- **Calculadora de envío** en tiempo real (monto USD → CUP, comisión y total).
- **Gestión de destinatarios**: nombre, teléfono, provincia y método de entrega
  (efectivo a domicilio, recarga de tarjeta CUP o tarjeta MLC).
- **Creación de envíos** con número de referencia y recibo.
- **Panel de control** con historial, totales y seguimiento de estado
  (`pendiente → en proceso → entregada`).

## 🧱 Arquitectura

Monorepo con dos espacios de trabajo (npm workspaces):

```
.
├── server/   API REST en Express + TypeScript + SQLite (better-sqlite3)
└── client/   SPA en React + TypeScript + Vite
```

### Backend (`server/`)

| Método | Ruta                          | Descripción                              |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | `/api/health`                 | Estado del servicio                      |
| POST   | `/api/auth/register`          | Crear cuenta                             |
| POST   | `/api/auth/login`             | Iniciar sesión                           |
| GET    | `/api/rates`                  | Tasa, límites y catálogos                |
| GET    | `/api/rates/quote?amount=100` | Cotización de un envío                    |
| GET    | `/api/recipients`             | Listar destinatarios *(auth)*            |
| POST   | `/api/recipients`             | Crear destinatario *(auth)*              |
| DELETE | `/api/recipients/:id`         | Eliminar destinatario *(auth)*           |
| GET    | `/api/transactions`           | Historial de envíos *(auth)*             |
| POST   | `/api/transactions`           | Crear envío *(auth)*                     |
| POST   | `/api/transactions/:id/advance` | Avanzar estado (simulación) *(auth)*   |

## 🚀 Puesta en marcha

Requisitos: **Node.js ≥ 20**.

```bash
# 1. Instalar dependencias (raíz + workspaces)
npm install

# 2. Levantar API (puerto 4000) y cliente (puerto 5173) a la vez
npm run dev
```

Luego abre **http://localhost:5173**. El cliente hace proxy de `/api` al
servidor automáticamente.

### Otros comandos

```bash
npm run build   # Compila servidor y cliente
npm run start   # Arranca el servidor compilado (dist)
npm test        # Pruebas de la lógica de cotización (server)
```

## ⚙️ Configuración (variables de entorno del servidor)

| Variable            | Por defecto                | Descripción                          |
| ------------------- | -------------------------- | ------------------------------------ |
| `PORT`              | `4000`                     | Puerto de la API                     |
| `JWT_SECRET`        | `dev-secret-change-me…`    | Secreto para firmar tokens           |
| `DB_PATH`           | `server/data/…sqlite`      | Ruta de la base de datos SQLite      |
| `BASE_RATE_USD_CUP` | `370`                      | Tasa base USD → CUP                  |
| `FEE_PERCENT`       | `0.05`                     | Comisión porcentual                  |
| `FEE_FIXED_USD`     | `2.99`                     | Cargo fijo por envío                 |

## 🛠️ Tecnologías

- **Frontend:** React 18, React Router, Vite, TypeScript
- **Backend:** Express, better-sqlite3, JWT, bcryptjs, Zod
- **Pruebas:** node:test
