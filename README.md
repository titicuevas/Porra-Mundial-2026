<div align="center">

# ⚽ Porra Mundial 2026

**Quiniela express entre colegas** — plan de última hora de **Manolin**

[![Web en vivo](https://img.shields.io/badge/🌐_Jugar_ahora-porra--mundial--2026--rust.vercel.app-2563eb?style=for-the-badge)](https://porra-mundial-2026-rust.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Porra--Mundial--2026-111827?style=for-the-badge&logo=github)](https://github.com/titicuevas/Porra-Mundial-2026)

*Marca tus pronósticos · Exporta tu PDF · A por el mundial*

</div>

---

## 🏆 Enlace oficial

### 👉 [https://porra-mundial-2026-rust.vercel.app](https://porra-mundial-2026-rust.vercel.app)

Pásalo por WhatsApp al grupo. Cada persona rellena la suya en el móvil o el PC.

---

## ✨ Qué incluye

| | |
|---|---|
| ⚽ | **72 partidos** de fase de grupos con banderas |
| 🏅 | Fase final: 4 semis, 2 finalistas y campeón *(abre 12 jul)* |
| 📋 | Normas, cuota **10 €** y reparto del bote **60 / 30 / 10 %** |
| 📄 | Exportación a **PDF** con tu nombre |
| 📊 | Resultados oficiales vía `results.json` |

---

## 🚀 Cómo jugar (3 pasos)

```
1. Abre el enlace de Vercel
2. Escribe tu nombre y marca 1 · X · 2 en cada partido
3. Baja al final y pulsa «Exportar mi porra en PDF»
```

> 💾 Tus picks se guardan solos en el navegador. No hace falta cuenta.

---

## 💻 Probar en local

**Windows:** doble clic en `iniciar.bat` → [http://localhost:8765](http://localhost:8765)

```bash
python -m http.server 8765
```

> ⚠️ No abras el `.html` con doble clic (`file://`). Usa servidor local o Vercel.

---

## 📅 Plazos (hora peninsular)

| Fase | Cuándo |
|------|--------|
| 🔒 **Cierre grupos** | 11 jun 2026, 21:00 |
| 🏅 **Apertura fase final** | 12 jul 2026, 7:00 |

---

## 🛠️ Para quien mantenga la porra

<details>
<summary><strong>Subir cambios a GitHub</strong></summary>

```bash
cd "C:\Users\betic\Desktop\Mundial App"
git add .
git commit -m "Tu mensaje"
git push
```

Repo: [github.com/titicuevas/Porra-Mundial-2026](https://github.com/titicuevas/Porra-Mundial-2026)

</details>

<details>
<summary><strong>Sincronizar index.html (importante)</strong></summary>

Vercel sirve **`index.html`**, no `porra-mundial-2026.html`. Tras editar:

```bash
cp porra-mundial-2026.html index.html
```

</details>

<details>
<summary><strong>Actualizar resultados del mundial</strong></summary>

Edita `results.json`:

```json
{
  "A1": { "home": 2, "away": 1 },
  "A2": { "home": 0, "away": 0 }
}
```

```bash
git add results.json && git commit -m "Resultados jornada X" && git push
```

**Modo admin:** `?admin=1` en la URL → editor de marcadores → copiar JSON.

</details>

---

## 📁 Estructura

```
├── index.html              ← Lo que sirve Vercel
├── porra-mundial-2026.html ← Copia de trabajo
├── assets/
│   ├── banner.gif          ← Banner animado
│   ├── banner.svg          ← Respaldo si falla el gif
│   └── flags/              ← Banderas mascotas
├── results.json            ← Marcadores oficiales
├── vercel.json
└── iniciar.bat
```

---

<div align="center">

**10 €** · **1 pt / acierto** · **60 % / 30 % / 10 %**

🍻 *Porra entre colegas — que gane el más listo (o el más cabrón)*

</div>
