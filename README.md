# 🏥 ClinArchi — Frontend

**AI-assisted spatial programming platform for hospitals and clinics.**
ClinArchi helps architects and healthcare planners turn a clinic project brief into a complete space program: departments per floor, number of beds and rooms, net/gross areas, a floor-by-floor layout view and a professional report — in minutes instead of days.

> Built during my Full Stack Developer internship at **Groupe Vitalys Santé** (March – April 2026).
> Backend API: [clinarchi-backend](https://github.com/Hanane-b1/clinarchi-backend)

<!-- Add screenshots here: docs/home.png, docs/program.png, docs/report.png -->

## ✨ Features

- **Project setup** — clinic name, city, number of levels (RDC → R+4), basements, parking and land surface
- **Department builder** — choose departments (hospitalisation, technical platform, administration, …) and functional units, and assign them to floors
- **Automatic calculations** — total beds, rooms, net area and estimated gross area
- **Floor-by-floor layout** — generated SVG plan for each level, switchable by floor
- **AI-generated report** — a functional report (executive summary, organisation by level, functional poles, recommendations, applied standards) written by Claude through the backend, with a local fallback report if the AI is unavailable
- **Professional exports** — multi-sheet **Excel** (space program, surface details, summary) and **PDF** report
- **Project history** — every generated project is saved to the database and can be reopened or deleted

## 🛠️ Tech stack

| Layer | Technologies |
|---|---|
| UI | React 19, Vite 7, CSS |
| Exports | SheetJS (xlsx), jsPDF, html2canvas |
| API | REST calls to the Laravel backend (`/api/projects`, `/api/generate-report`) |
| Tooling | ESLint |

## 🚀 Getting started

**Prerequisites:** Node.js 18+ and the [backend](https://github.com/Hanane-b1/clinarchi-backend) running.

```bash
git clone https://github.com/Hanane-b1/clinarchi-frontend.git
cd clinarchi-frontend
npm install
```

Create `src/.env` (or `.env`) with the backend URL:

```env
VITE_API_URL=http://localhost:8000
```

Then start the dev server:

```bash
npm run dev
```

The app runs on http://localhost:5173.

## 📁 Project structure

```
src/
├── components/Home.jsx   # Landing page
├── pages/Program.jsx     # Project form, calculations, floor plans, report & exports
├── api.js                # Calls to the Laravel API
└── App.jsx               # Page switching
```

## 👩‍💻 Author

**Hanane Belhadi** — Full Stack Developer · [GitHub](https://github.com/Hanane-b1)
