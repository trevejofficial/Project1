# 🩺 SaludJuntos

Plataforma de **telesalud en español** para la comunidad latina en Estados
Unidos. Dos líneas de atención por videollamada:

- **Consultas médicas** — medicina general, pediatría, salud de la mujer, nutrición.
- **Atención psicológica** — psicología, psiquiatría y terapia de pareja/familia.

> ⚠️ **Demostración educativa.** No reemplaza atención médica profesional ni
> procesa pagos reales. La videollamada es una sala simulada.
>
> **Emergencias: 911.** Crisis de salud mental: **988** (en español, marca 2).

## ✨ Funcionalidades

- Registro e inicio de sesión (JWT + bcrypt).
- Catálogo de especialistas filtrable por tipo, con perfil, idiomas, precio y reseña.
- Agenda de citas con **horarios disponibles** (evita dobles reservas).
- Panel de **mis citas** (próximas e historial) con cancelación.
- **Sala de consulta** por video (simulada) con controles de cámara/micrófono.
- Avisos de seguridad y línea de crisis 988 en la atención psicológica.

## 🧱 Arquitectura

App full-stack que sirve **cliente + API desde un solo puerto**.

```
telehealth/
├── server/   API REST en Express + TypeScript + SQLite (better-sqlite3)
└── web/      SPA en React + TypeScript + Vite
```

### Endpoints principales

| Método | Ruta                          | Descripción                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`          | Crear cuenta                         |
| POST   | `/api/auth/login`             | Iniciar sesión                       |
| GET    | `/api/meta`                   | Categorías y línea de crisis         |
| GET    | `/api/providers?category=`    | Listar especialistas                 |
| GET    | `/api/providers/:id`          | Perfil del especialista              |
| GET    | `/api/providers/:id/slots`    | Horarios disponibles                 |
| GET    | `/api/appointments`           | Mis citas *(auth)*                   |
| POST   | `/api/appointments`           | Agendar cita *(auth)*               |
| POST   | `/api/appointments/:id/cancel`| Cancelar cita *(auth)*              |

## 🚀 Puesta en marcha

Requisitos: **Node.js ≥ 20**.

```bash
cd telehealth
npm install
npm run dev      # API (4000) + cliente (5173) con recarga en caliente
```

Abre **http://localhost:5173**.

### Producción (un solo puerto)

```bash
npm run build
npm start        # → http://localhost:4000  (sirve cliente + API)
```

### Otros comandos

```bash
npm test         # Pruebas de la lógica de horarios/dominio
```

## ☁️ Despliegue

Para publicarla con backend real, consulta **[DEPLOY.md](./DEPLOY.md)**. Incluye
`render.yaml` (Render, un clic) y `Dockerfile` (Railway/Fly/Docker).

## 🛠️ Tecnologías

- **Frontend:** React 18, React Router, Vite, TypeScript
- **Backend:** Express, better-sqlite3, JWT, bcryptjs, Zod
