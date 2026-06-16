<div align="center">

# ⚽ Porra Mundial 2026

**Quiniela express entre colegas** — plan de última hora de **Manolin**

[![Web en vivo](https://img.shields.io/badge/🌐_Jugar_ahora-porra--mundial--2026--rust.vercel.app-2563eb?style=for-the-badge)](https://porra-mundial-2026-rust.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Porra--Mundial--2026-111827?style=for-the-badge&logo=github)](https://github.com/titicuevas/Porra-Mundial-2026)

*La quiniela que cuenta es la de eliminatorias · Exporta PDF · A por el mundial*

<br/>

<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://porra-mundial-2026-rust.vercel.app" alt="QR porra mundial 2026" width="140" height="140"/>

<br/>

**Escanea para abrir en el móvil** · [porra-mundial-2026-rust.vercel.app](https://porra-mundial-2026-rust.vercel.app)

</div>

---

## 🏆 Enlace oficial

### 👉 [https://porra-mundial-2026-rust.vercel.app](https://porra-mundial-2026-rust.vercel.app)

Pásalo por WhatsApp al grupo (botón en la web) o con el QR de arriba.

---

## ⭐ Lo importante (léelo primero)

| Qué | Detalle |
|-----|---------|
| **Lo que puntúa** | Solo la pestaña **🏅 Eliminatorias** (según Manolin) |
| **Fase de grupos** | Opcional — diversión y PDF; **no cuenta** para el bote |
| **Cuota** | **10 €** por persona |
| **Puntos** | **1 punto** por acierto (partido + cada especial) |
| **Premios** | 🥇 60 % · 🥈 30 % · 🥉 10 % del bote |
| **Copia de seguridad** | Exporta el PDF — la porra vive en el navegador |

---

## ✨ Qué incluye la app

### ⚽ Grupos (opcional)
- 72 partidos con banderas · **1 · X · 2**
- PDF de fase de grupos · guardado en `porra2026v5`

### 🏅 Eliminatorias (la que cuenta)
- **Especiales (modo simple):**
  - Semifinalistas: **1 por esquina** → `G1 ↖`, `G2 ↗`, `G3 ↙`, `G4 ↘`
  - Finalistas: **1 de arriba** + **1 de abajo**
  - Campeón: entre tus 2 finalistas  
  *(editables hasta 28 jun 12:00)*
- **Quiniela:** ganador de cada partido (16avos → final)
- **Verde** = ganador · **Rojo** = eliminado · etiquetas SEMI / FINAL / CAMPEÓN
- **Limpiar partidos** no borra la quiniela de grupos
- PDF: `porra-knockout-2026-nombre.pdf` · datos en `porra2026_knockout`

### 🏆 Clasificación
- Tabla provisional · `leaderboard.json`

### 📋 Extra
- Resultados oficiales · `results.json` · modo `?admin=1`
- PWA: «Añadir a pantalla de inicio» en móvil (`manifest.json`)
- Modo prueba eliminatorias (contraseña antes del 12 jul)

---

## 🚀 Cómo jugar

### Eliminatorias (lo principal)

```
1. Abre el enlace (o escanea el QR)
2. Pestaña 🏅 Eliminatorias → elige participante
3. Especiales por esquinas (G1/G2/G3/G4) + finalistas arriba/abajo
4. «Exportar PDF eliminatorias» (verde cuando esté completo)
5. Guarda o envía el PDF por WhatsApp
```

### Grupos (opcional)

```
1. Tu nombre → 72 partidos 1/X/2 → Exportar PDF al final
```

---

## 📅 Plazos (CEST, peninsular)

| Hito | Fecha |
|------|--------|
| 🔒 Cierre pronósticos **grupos** | 11 jun 2026, 21:00 |
| 🔒 Cierre **especiales** KO | 28 jun 2026, 12:00 |
| 🏅 Apertura **eliminatorias** | 12 jul 2026, 7:00 |
| 📊 Clasificación provisional | Tras grupos (27 jun+) |

---

## 💻 Local y despliegue

| Script | Qué hace |
|--------|----------|
| `iniciar.bat` | Servidor [localhost:8765](http://localhost:8765) |
| `sync-html.bat` | Copia `porra-mundial-2026.html` → `index.html` |
| `preparar-deploy.bat` | Sync + verificación antes de subir a Vercel |
| `node scripts/verify.js` | Comprueba HTML, knockout y JSON |

```bash
python -m http.server 8765          # alternativa manual
./sync-html.sh                      # Linux/Mac
```

> ⚠️ No uses `file://`. Tras editar HTML, **siempre** `sync-html.bat`.  
> Al cambiar `knockout.js`, sube `?v=35` (o siguiente) en ambos HTML.

### Modo prueba eliminatorias
Pestaña 🏅 → contraseña `Españita` (solo esa sesión del navegador).

---

## 🛠️ Mantenimiento

<details>
<summary><strong>Flujo recomendado antes de cada push</strong></summary>

```bash
preparar-deploy.bat    # Windows
git add .
git commit -m "Descripción"
git push
```

Vercel despliega solo. Repo: [github.com/titicuevas/Porra-Mundial-2026](https://github.com/titicuevas/Porra-Mundial-2026)

</details>

<details>
<summary><strong>Editar HTML</strong></summary>

1. Cambia **`porra-mundial-2026.html`** (copia de trabajo)
2. Ejecuta **`sync-html.bat`**
3. Vercel sirve **`index.html`**

</details>

<details>
<summary><strong>Participantes (eliminatorias)</strong></summary>

Array `PARTICIPANTS` en `knockout.js` → sync → push.

</details>

<details>
<summary><strong>Resultados del mundial</strong></summary>

- Vacío listo: `results.json` → `{}`
- Ejemplo con partidos: `results.example.json`
- Admin: `?admin=1` → copiar JSON → pegar en `results.json` → push

</details>

<details>
<summary><strong>Clasificación</strong></summary>

`leaderboard.json` o admin → «Copiar JSON → leaderboard.json».

</details>

---

## 📁 Estructura

```
├── porra-mundial-2026.html    ← Fuente principal (editar aquí)
├── index.html                 ← Copia de despliegue (la sirve Vercel)
├── knockout.js                ← Lógica eliminatorias + PDF KO
├── manifest.json              ← PWA / añadir a inicio
├── results.json               ← Marcadores ({})
├── results.example.json       ← Plantilla de ejemplo
├── leaderboard.json           ← Clasificación
├── scripts/verify.js          ← Comprobaciones pre-deploy
├── sync-html.bat / .sh
├── preparar-deploy.bat
├── assets/
├── vercel.json
└── iniciar.bat
```

**CDN:** Tailwind, jsPDF, flagcdn.com — sin `npm install`.

### Estructura mental rápida (KISS)

- `porra-mundial-2026.html`: UI general (grupos, tabs, estilos globales).
- `knockout.js`: todo lo de eliminatorias (reglas, validaciones, export PDF KO).
- `index.html`: solo artefacto final para Vercel (se regenera con `sync-html.bat`).

---

## 💡 Mejoras futuras (opcional)

| Idea | Estado |
|------|--------|
| Sync HTML automático | ✅ `sync-html.bat` + `verify.js` |
| `results.json` en repo | ✅ `{}` + `results.example.json` |
| PWA / añadir a inicio | ✅ `manifest.json` |
| QR + WhatsApp | ✅ En README y botón en web |
| Aviso backup PDF | ✅ En pestaña eliminatorias |
| Porra en la nube | 🔜 Requeriría backend (Supabase, etc.) |
| Participantes sin tocar código | 🔜 Panel admin |

---

<div align="center">

**10 €** · **1 pt / acierto (eliminatorias)** · **60 % / 30 % / 10 %**

🍻 *Porra entre colegas — que gane el más listo (o el más cabrón)*

</div>
