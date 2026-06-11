# Porra Mundial 2026

Porra express del Mundial 2026 — plan de última hora de Manolin. Marca tus pronósticos (1 · X · 2), elige semifinalistas, finalistas y campeón, y exporta tu PDF.

**Repositorio:** [github.com/titicuevas/Porra-Mundial-2026](https://github.com/titicuevas/Porra-Mundial-2026)

**Enlace en producción:** _(añadir aquí la URL de Vercel cuando la despliegues)_

---

## Qué incluye

- 72 partidos de la fase de grupos con banderas
- Pronósticos de fase final (4 semifinalistas, 2 finalistas, campeón)
- Normas de la porra (10 €, puntuación, reparto del bote)
- Exportación a PDF con tu nombre
- Resultados oficiales vía `results.json` (se actualizan al redesplegar)

---

## Probar en local

**Recomendado:** doble clic en `iniciar.bat` (abre `http://localhost:8765`).

O en terminal, dentro de esta carpeta:

```bash
python -m http.server 8765
```

Abre [http://localhost:8765](http://localhost:8765)

> No abras el `.html` con doble clic (`file://`). Usa siempre un servidor local o Vercel.

---

## Subir a GitHub

1. Crea un repositorio nuevo en GitHub (vacío, sin README si ya tienes este).

2. En terminal, desde la carpeta del proyecto:

```bash
cd "C:\Users\betic\Desktop\Mundial App"
git init
git add .
git commit -m "Porra Mundial 2026 — versión inicial"
git branch -M main
git remote add origin https://github.com/titicuevas/Porra-Mundial-2026.git
git push -u origin main
```

Sustituye `TU_USUARIO` y `TU_REPO` por los tuyos.

---

## Desplegar en Vercel (automático con cada push)

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (puedes usar tu cuenta de GitHub).

2. **Add New… → Project**

3. **Import** el repositorio de GitHub que acabas de subir.

4. Vercel detecta el proyecto estático. No hace falta cambiar nada:
   - **Framework Preset:** Other
   - **Build Command:** vacío
   - **Output Directory:** `./` (raíz)

5. Pulsa **Deploy**.

A partir de ahí, **cada `git push` a `main` redespliega solo** la web en Vercel.

### Archivo `vercel.json`

Ya está configurado:

- `/` sirve `index.html`
- `results.json` sin caché agresiva (los resultados se ven al momento tras un deploy)

---

## Actualizar resultados cuando empiece el mundial

Edita `results.json` con los marcadores oficiales:

```json
{
  "A1": { "home": 2, "away": 1 },
  "A2": { "home": 0, "away": 0 }
}
```

- Clave = id del partido (`A1`, `B3`, etc.)
- `home` / `away` = goles del local y visitante

Luego:

```bash
git add results.json
git commit -m "Resultados jornada X"
git push
```

Vercel publica los cambios en unos segundos.

**Modo admin (opcional):** abre la web con `?admin=1` para introducir marcadores en el navegador y copiar el JSON con el botón «Copiar JSON → results.json».

---

## Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | App principal (la que sirve Vercel en `/`) |
| `porra-mundial-2026.html` | Copia de la app (mismo contenido) |
| `results.json` | Resultados oficiales compartidos |
| `vercel.json` | Configuración de despliegue |
| `iniciar.bat` | Servidor local en Windows |
| `README.md` | Este archivo |

---

## Plazos automáticos (hora peninsular)

| Fase | Fecha y hora |
|------|----------------|
| **Cierre fase de grupos** | 11 de junio de 2026, 21:00 |
| **Apertura fase final** (semis, final, campeón) | 12 de julio de 2026, 7:00 |

Hasta el 12 de julio la fase final no se muestra editable ni aparece en el PDF.

---

## Notas

- Los pronósticos de cada persona se guardan en el **navegador** (localStorage), no en el servidor.
- El PDF pide **nombre obligatorio** antes de exportar.
- Cuota: **10 €** · Puntos: **1 acierto = 1 punto** · Bote: **60 % / 30 % / 10 %** (1.º, 2.º, 3.º).

---

¡A por el mundial!
