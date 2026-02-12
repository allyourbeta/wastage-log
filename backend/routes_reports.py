"""
Report endpoints for the wastage log.
"""

from fastapi import APIRouter
from typing import Optional
from fastapi.responses import StreamingResponse
import csv
import io

from database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/weekly")
def get_weekly_report(week_start: str):
    """
    Weekly summary: total per item per day, plus weekly totals.
    week_start should be a Monday date like '2025-11-03'.
    """
    conn = get_db()
    rows = conn.execute("""
        SELECT i.id as item_id, i.name as item_name, v.name as vendor_name,
               date(wl.logged_at) as log_date,
               wl.reason,
               SUM(wl.quantity) as total_quantity
        FROM waste_logs wl
        JOIN items i ON wl.item_id = i.id
        JOIN vendors v ON i.vendor_id = v.id
        WHERE date(wl.logged_at) >= date(?)
          AND date(wl.logged_at) < date(?, '+7 days')
        GROUP BY i.id, date(wl.logged_at), wl.reason
        ORDER BY i.display_order, i.name, date(wl.logged_at)
    """, (week_start, week_start)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/summary")
def get_summary_report(start_date: str, end_date: str):
    """Summary for a date range: totals by item, by reason, by vendor."""
    conn = get_db()

    by_item = conn.execute("""
        SELECT i.name as item_name, v.name as vendor_name,
               SUM(wl.quantity) as total_quantity
        FROM waste_logs wl
        JOIN items i ON wl.item_id = i.id
        JOIN vendors v ON i.vendor_id = v.id
        WHERE date(wl.logged_at) >= date(?)
          AND date(wl.logged_at) <= date(?)
        GROUP BY i.id
        ORDER BY total_quantity DESC
    """, (start_date, end_date)).fetchall()

    by_reason = conn.execute("""
        SELECT wl.reason, SUM(wl.quantity) as total_quantity
        FROM waste_logs wl
        WHERE date(wl.logged_at) >= date(?)
          AND date(wl.logged_at) <= date(?)
        GROUP BY wl.reason
        ORDER BY total_quantity DESC
    """, (start_date, end_date)).fetchall()

    by_vendor = conn.execute("""
        SELECT v.name as vendor_name, SUM(wl.quantity) as total_quantity
        FROM waste_logs wl
        JOIN items i ON wl.item_id = i.id
        JOIN vendors v ON i.vendor_id = v.id
        WHERE date(wl.logged_at) >= date(?)
          AND date(wl.logged_at) <= date(?)
        GROUP BY v.id
        ORDER BY total_quantity DESC
    """, (start_date, end_date)).fetchall()

    conn.close()
    return {
        "by_item": [dict(r) for r in by_item],
        "by_reason": [dict(r) for r in by_reason],
        "by_vendor": [dict(r) for r in by_vendor],
    }


@router.get("/csv")
def export_csv(start_date: str, end_date: str):
    """Export raw log data as CSV."""
    conn = get_db()
    rows = conn.execute("""
        SELECT wl.logged_at, i.name as item_name, v.name as vendor_name,
               wl.quantity, wl.reason, wl.notes
        FROM waste_logs wl
        JOIN items i ON wl.item_id = i.id
        JOIN vendors v ON i.vendor_id = v.id
        WHERE date(wl.logged_at) >= date(?)
          AND date(wl.logged_at) <= date(?)
        ORDER BY wl.logged_at
    """, (start_date, end_date)).fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date/Time", "Item", "Vendor", "Quantity", "Reason", "Notes"])
    for r in rows:
        writer.writerow([r["logged_at"], r["item_name"], r["vendor_name"],
                        r["quantity"], r["reason"], r["notes"] or ""])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=wastage_{start_date}_to_{end_date}.csv"
        },
    )
