# 🚀 Desplegar CubaRemesas (backend real)

La app sirve el **cliente y la API desde un solo puerto**, así que se despliega
como un único servicio web. El servidor lee `PORT` del entorno y escucha en
`0.0.0.0`, por lo que es compatible con la mayoría de plataformas.

---

## Opción A — Render (recomendada, con `render.yaml`)

El repo incluye un *Blueprint* (`render.yaml`) que configura todo: build,
arranque, healthcheck, secreto JWT y un disco persistente para la base SQLite.

1. Entra en **https://render.com** e inicia sesión con GitHub.
2. **New → Blueprint**.
3. Selecciona el repositorio **`trevejofficial/Project1`** y la rama
   **`claude/cuba-remittance-app-7n9yln`**.
4. Render leerá `render.yaml`. Pulsa **Apply**.
5. Espera a que termine el build (~2–3 min). Obtendrás una URL pública del tipo
   **`https://cubaremesas.onrender.com`** que puedes abrir desde el móvil.

> El plan `free` se "duerme" tras unos minutos de inactividad; la primera visita
> tras dormir tarda unos segundos en responder. El disco persistente mantiene
> los datos entre reinicios.

Variables que define el Blueprint (puedes cambiarlas en el panel de Render):

| Variable            | Valor                          |
| ------------------- | ------------------------------ |
| `JWT_SECRET`        | generado automáticamente       |
| `DB_PATH`           | `/var/data/cubaremesas.sqlite` |
| `BASE_RATE_USD_CUP` | `370`                          |
| `PORT`              | inyectado por Render           |

---

## Opción B — Railway / Fly.io / Docker

El repo incluye un **`Dockerfile`** que compila y arranca todo.

### Railway
1. Entra en **https://railway.app** → **New Project → Deploy from GitHub repo**.
2. Elige `trevejofficial/Project1` (rama `claude/cuba-remittance-app-7n9yln`).
3. Railway detecta el `Dockerfile` y construye la imagen.
4. En **Settings → Networking** pulsa **Generate Domain** para obtener la URL pública.
5. (Opcional) Añade un **Volume** montado en `/var/data` y la variable
   `DB_PATH=/var/data/cubaremesas.sqlite` para persistir la base de datos.

### Con Docker (cualquier servidor)
```bash
docker build -t cubaremesas .
docker run -p 4000:4000 -e JWT_SECRET=pon-un-secreto cubaremesas
# Abre http://localhost:4000
```

---

## Variables de entorno admitidas

| Variable            | Por defecto             | Descripción                     |
| ------------------- | ----------------------- | ------------------------------- |
| `PORT`              | `4000`                  | Puerto del servicio             |
| `JWT_SECRET`        | `dev-secret-change-me…` | Secreto para firmar tokens      |
| `DB_PATH`           | `server/data/…sqlite`   | Ruta de la base SQLite          |
| `BASE_RATE_USD_CUP` | `370`                   | Tasa base USD → CUP             |
| `FEE_PERCENT`       | `0.05`                  | Comisión porcentual             |
| `FEE_FIXED_USD`     | `2.99`                  | Cargo fijo por envío            |

> ⚠️ En producción define siempre un `JWT_SECRET` propio y robusto.
