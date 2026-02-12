# Edmonds Cafe — Wastage Log

A tablet-friendly web app for tracking food items that leave inventory without a sale (staff meals, waste, comps, Too Good To Go, etc.).

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- ngrok (for remote demos): `brew install ngrok`

### Setup & Run

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 3. Open http://localhost:5173 on your browser/tablet
```

### Demo with ngrok

```bash
# In a third terminal — exposes your local app to the internet
ngrok http 5173
# Copy the https URL and open it on any device
```

## Architecture

```
frontend/          React + Vite (tablet-first UI)
├── src/
│   ├── api.js           All API calls (centralized)
│   ├── constants.js     Reason labels, date helpers
│   ├── App.jsx          Tab navigation, layout
│   ├── components/
│   │   ├── TallyGrid.jsx      Main data entry (spreadsheet-like)
│   │   ├── ReasonPicker.jsx   Bottom sheet for reason selection
│   │   ├── TodayLog.jsx       Today's entries with delete
│   │   ├── Reports.jsx        Date-range summaries
│   │   └── ManageItems.jsx    Add/edit/toggle items & vendors
│   └── styles/
│       └── global.css         All styles (warm cafe theme)

backend/           FastAPI + SQLite
├── app.py               All API endpoints + DB setup + seed data
├── requirements.txt
└── wastage.db           Created automatically on first run
```

## Usage

- **Log tab**: Scroll through items, tap + to increment (uses default reason). Long-press + to pick a different reason.
- **Today tab**: See all entries logged today with details. Delete entries for corrections.
- **Reports tab**: Select a date range to see breakdowns by item, reason, and vendor. Export to CSV.
- **Manage tab**: Add/edit items and vendors. Toggle items active/inactive for seasonal changes.

## Wastage Reasons

| Reason | Description |
|--------|-------------|
| Waste / Unsold | Made but not sold, end of day waste |
| Staff Meal | Consumed by staff |
| Comped / Voucher | Given free to customer |
| Too Good To Go | Donated via 2G2G program |
| Expired | Past sell-by date |
| Sample | Given as tasting sample |
| Other | Anything else (add notes) |

## Deployment (Azure)

This app is designed to run alongside the Edmonds Cafe Analytics app on the same Azure Linux instance. Deployment instructions TBD after demo approval.
