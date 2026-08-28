# Cañon City Schools — Board Letter Generator

An official web-based generator for **Cañon City Schools (School District Fremont RE-1)** to compose, preview, and export board employment, transfer, resignation, and retirement letters.

---

## ✨ Features

- **5 Official Letter Types**:
  - **Certified**: Licensed staff board approval with lane, step, base salary, and start date.
  - **Classified**: Classified staff board approval with classification, level, hourly wage, optional center-based stipend, and start date.
  - **Transfer**: Board action approval of transfer in role, hours, and school location.
  - **Resignation**: Formal board acceptance of resignation with personalized appreciation notes.
  - **Retirement**: Board approval of retirement request, years of service recognition, optional remainder of school year clause, and retiree celebration event details.
- **Authentic Stationery & Typography**:
  - Official district logo seal and header banner.
  - Administrative staff roster and district contact info.
  - Jamie Davis Director of HR signature, typist initials (`/ks`), and `Cc: personnel file`.
- **Live 8.5" &times; 11" Paper Preview**:
  - Real-time WYSIWYG paper preview with zoom controls.
  - Full-screen document review mode for distraction-free proofreading.
- **Export & Production Formats**:
  - **PDF Export**: 1-click client-side vector/canvas PDF rendering (`.pdf`).
  - **Print Letter**: Native `@media print` layout styled for standard US Letter sheets (`Cmd+P`).
  - **Word Document (.docx)**: Generates editable Microsoft Word documents with full formatting.
  - **Copy Text**: Cleanly formatted clipboard copy.
- **Bulk Batch Generator**:
  - CSV upload support for generating dozens of letters in a single click.
  - Downloadable CSV template and sample batch data.
  - 1-click batch printing.
- **District Stationery Customizer**:
  - Edit district names, addresses, contacts, mission statement, and administrative staff roster.
  - Auto-saved locally in browser storage.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The production bundle will be generated in `dist/`.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Export Engines**: `jspdf`, `html-to-image`, `docx`, `file-saver`
- **Quality**: TypeScript strict type safety & ESLint / Oxlint

---

## 📄 License
Internal district utility for Cañon City Schools (Fremont RE-1).
