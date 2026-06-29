# 🚀 Desplegar SaludJuntos (backend real)

La app sirve **cliente y API desde un solo puerto**. Lee `PORT` del entorno y
escucha en `0.0.0.0`, por lo que funciona en la mayoría de plataformas.

> La app vive en el subdirectorio **`telehealth/`** del repositorio.

---

## Opción A — Render (recomendada, con `render.yaml`)

El `render.yaml` ya configura `rootDir: telehealth`, build, arranque,
healthcheck, `JWT_SECRET` y un disco persistente para SQLite.

1. Entra en **https://render.com** e inicia sesión con GitHub.
2. **New → Blueprint**.
3. Selecciona el repo **`trevejofficial/Project1`**, rama
   **`claude/cuba-remittance-app-7n9yln`**.
4. Render leerá `telehealth/render.yaml`. Pulsa **Apply**.
5. En ~2–3 min tendrás una URL pública (p. ej.
   **`https://saludjuntos.onrender.com`**) que abres desde el móvil.

> El plan `free` se "duerme" tras inactividad; la primera carga tras dormir
> tarda unos segundos. El disco persistente conserva cuentas y citas.

---

## Opción B — Railway / Fly.io / Docker

El directorio incluye un **`Dockerfile`**.

### Railway
1. **https://railway.app** → **New Project → Deploy from GitHub repo**.
2. Elige `trevejofficial/Project1`.
3. En **Settings → Root Directory** pon **`telehealth`** (para que use su Dockerfile).
4. **Generate Domain** para obtener la URL pública.
5. (Opcional) Añade un **Volume** en `/var/data` y `DB_PATH=/var/data/saludjuntos.sqlite`.

### Docker local
```bash
cd telehealth
docker build -t saludjuntos .
docker run -p 4000:4000 -e JWT_SECRET=pon-un-secreto saludjuntos
# Abre http://localhost:4000
```

---

## Variables de entorno

| Variable     | Por defecto              | Descripción                  |
| ------------ | ------------------------ | ---------------------------- |
| `PORT`       | `4000`                   | Puerto del servicio          |
| `JWT_SECRET` | `dev-secret-cambiar…`    | Secreto para firmar tokens   |
| `DB_PATH`    | `telehealth/data/…sqlite`| Ruta de la base SQLite       |
| `CRISIS_LINE`| `988`                    | Línea de crisis mostrada     |

> ⚠️ En producción define siempre un `JWT_SECRET` propio y robusto.
