"""
Edmonds Cafe Wastage Log — FastAPI Backend
API routes for tracking food items that leave inventory without a sale.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date

from database import get_db, init_db, seed_db
from routes_reports import router as reports_router

app = FastAPI(title="Edmonds Cafe Wastage Log")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports_router)


# --- Pydantic models ---

class LogEntry(BaseModel):
    item_id: int
    quantity: int = 1
    reason: str = "lost"
    notes: Optional[str] = None

class LogEntryUpdate(BaseModel):
    quantity: Optional[int] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class ItemCreate(BaseModel):
    vendor_id: int
    name: str

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    vendor_id: Optional[int] = None

class VendorCreate(BaseModel):
    name: str


# --- Startup ---

@app.on_event("startup")
def startup():
    init_db()
    seed_db()


# --- Item endpoints ---

@app.get("/api/items")
def get_items(active_only: bool = True):
    """Get all items, optionally filtered to active only."""
    conn = get_db()
    query = """
        SELECT i.id, i.name, i.is_active, i.display_order,
               v.id as vendor_id, v.name as vendor_name
        FROM items i JOIN vendors v ON i.vendor_id = v.id
    """
    if active_only:
        query += " WHERE i.is_active = 1"
    query += " ORDER BY i.display_order, i.name"
    rows = conn.execute(query).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/items")
def create_item(item: ItemCreate):
    """Add a new item."""
    conn = get_db()
    max_order = conn.execute("SELECT MAX(display_order) FROM items").fetchone()[0] or 0
    cursor = conn.execute(
        "INSERT INTO items (vendor_id, name, display_order) VALUES (?, ?, ?)",
        (item.vendor_id, item.name, max_order + 1),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "name": item.name}


@app.patch("/api/items/{item_id}")
def update_item(item_id: int, item: ItemUpdate):
    """Update an item (name, active status, vendor)."""
    conn = get_db()
    updates, params = [], []
    if item.name is not None:
        updates.append("name = ?"); params.append(item.name)
    if item.is_active is not None:
        updates.append("is_active = ?"); params.append(item.is_active)
    if item.vendor_id is not None:
        updates.append("vendor_id = ?"); params.append(item.vendor_id)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.append(item_id)
    conn.execute(f"UPDATE items SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return {"ok": True}


# --- Vendor endpoints ---

@app.get("/api/vendors")
def get_vendors():
    """Get all vendors."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM vendors ORDER BY name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/vendors")
def create_vendor(vendor: VendorCreate):
    """Add a new vendor."""
    conn = get_db()
    cursor = conn.execute("INSERT INTO vendors (name) VALUES (?)", (vendor.name,))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "name": vendor.name}


# --- Waste log endpoints ---

@app.post("/api/logs")
def create_log(entry: LogEntry):
    """Log a wastage entry."""
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO waste_logs (item_id, quantity, reason, notes) VALUES (?, ?, ?, ?)",
        (entry.item_id, entry.quantity, entry.reason, entry.notes),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id}


@app.delete("/api/logs/{log_id}")
def delete_log(log_id: int):
    """Delete a log entry."""
    conn = get_db()
    conn.execute("DELETE FROM waste_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.patch("/api/logs/{log_id}")
def update_log(log_id: int, entry: LogEntryUpdate):
    """Update a log entry."""
    conn = get_db()
    updates, params = [], []
    if entry.quantity is not None:
        updates.append("quantity = ?"); params.append(entry.quantity)
    if entry.reason is not None:
        updates.append("reason = ?"); params.append(entry.reason)
    if entry.notes is not None:
        updates.append("notes = ?"); params.append(entry.notes)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.append(log_id)
    conn.execute(f"UPDATE waste_logs SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/logs/today")
def get_today_logs():
    """Get all log entries for today with item details."""
    conn = get_db()
    rows = conn.execute("""
        SELECT wl.id, wl.item_id, wl.quantity, wl.reason, wl.notes, wl.logged_at,
               i.name as item_name, v.name as vendor_name
        FROM waste_logs wl
        JOIN items i ON wl.item_id = i.id
        JOIN vendors v ON i.vendor_id = v.id
        WHERE date(wl.logged_at) = date('now')
        ORDER BY wl.logged_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/logs/daily-totals")
def get_daily_totals(target_date: Optional[str] = None):
    """Get total quantity per item for a given date (defaults to today)."""
    if target_date is None:
        target_date = date.today().isoformat()
    conn = get_db()
    rows = conn.execute("""
        SELECT i.id as item_id, i.name as item_name, v.name as vendor_name,
               COALESCE(SUM(wl.quantity), 0) as total_quantity
        FROM items i
        JOIN vendors v ON i.vendor_id = v.id
        LEFT JOIN waste_logs wl ON wl.item_id = i.id
            AND date(wl.logged_at) = date(?)
        WHERE i.is_active = 1
        ORDER BY i.display_order, i.name
    """, (target_date,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]
