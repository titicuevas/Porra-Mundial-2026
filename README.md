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
  *(editables hasta 28 jun, 21:00)*
- **Quiniela:** ganador de cada partido (16avos → final)
- **Verde** = ganador · **Rojo** = eliminado · etiquetas SEMI / FINAL / CAMPEÓN
- **Limpiar partidos** no borra la quiniela de grupos
- PDF: `porra-knockout-2026-nombre.pdf` · datos en `porra2026_knockout`

### 🏆 Clasificación
- Tabla provisional · `leaderboard.json`

### 📋 Extra
- Resultados oficiales · `results.json` · modo `?admin=1`
- PWA: «Añadir a pantalla de inicio» en móvil (`manifest.json`)

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
| 🔒 Cierre **especiales** KO | 28 jun 2026, 21:00 |
| 🏅 Apertura **quiniela dieciseisavos** | 28 jun 2026, 10:00 |
| 🏅 Octavos / cuartos / semis / final | 4, 9, 14 y 19 jul 2026 |
| 📊 Clasificación provisional | Tras grupos (27 jun+) |

---

## 💻 Local y despliegue

| Script | Qué hace |
|--------|----------|
| `iniciar.bat` | Servidor [localhost:8765](http://localhost:8765) |
| `preparar-deploy.bat` | Sincroniza versión + verificación antes de subir a Vercel |
| `node scripts/sync-version.js` | Propaga `js/version.js` → `?v=` en HTML y `manifest.json` |
| `node scripts/verify.js` | Comprueba estructura, versión y cuadro FIFA |

```bash
python -m http.server 8765          # alternativa manual
preparar-deploy.bat                 # Windows, antes de cada push
```

> ⚠️ No uses `file://`. Tras cambiar JS/CSS, sube el número en **`js/version.js`** y ejecuta **`node scripts/sync-version.js`** (o `preparar-deploy.bat`).

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
<summary><strong>Editar HTML o JS</strong></summary>

1. **`index.html`** — única página de la app
2. **`js/version.js`** — sube `PORRA_BUILD` al cambiar assets
3. **`preparar-deploy.bat`** — sincroniza versión y verifica

</details>

<details>
<summary><strong>Participantes (eliminatorias)</strong></summary>

Array `PARTICIPANTS` en `js/knockout.js` → sync → push.

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
├── index.html                 ← Única página (HTML + enlaces a JS/CSS)
├── css/app.css                ← Estilos
├── js/
│   ├── version.js             ← Versión única (PORRA_BUILD)
│   ├── schedule.js            ← Calendario grupos + FIFA KO (P73–P104)
│   ├── groups-data.js         ← 12 grupos, equipos y partidos
│   ├── groups-app.js          ← Fase de grupos, PDF, clasificación
│   ├── knockout.js            ← Eliminatorias + PDF KO
│   ├── annex-c-data.js        ← Anexo FIFA (cruces 3º)
│   └── team-fifa-meta.js      ← Metadatos equipos FIFA
├── results.json               ← Marcadores oficiales
├── results.example.json       ← Plantilla de resultados
├── leaderboard.json           ← Clasificación participantes
├── manifest.json              ← PWA
├── scripts/
│   ├── sync-version.js        ← Propaga versión al HTML
│   └── verify.js              ← Comprobaciones pre-deploy
├── iniciar.bat / preparar-deploy.bat
└── assets/
```

**CDN:** Tailwind, jsPDF, flagcdn.com — sin `npm install`.

Al cambiar CSS o JS: edita **`js/version.js`** → `node scripts/sync-version.js` → `preparar-deploy.bat`.

---

## 💡 Mejoras futuras (opcional)

| Idea | Estado |
|------|--------|
| Sync HTML automático | ✅ Un solo `index.html` |
| Versión centralizada | ✅ `js/version.js` + `sync-version.js` |
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
