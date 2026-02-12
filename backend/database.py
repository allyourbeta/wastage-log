"""
Database initialization and seed data for the wastage log.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "wastage.db")


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );

        CREATE TABLE IF NOT EXISTS waste_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            reason TEXT NOT NULL DEFAULT 'lost',
            notes TEXT,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id)
        );

        CREATE INDEX IF NOT EXISTS idx_waste_logs_logged_at ON waste_logs(logged_at);
        CREATE INDEX IF NOT EXISTS idx_waste_logs_item_id ON waste_logs(item_id);
        CREATE INDEX IF NOT EXISTS idx_waste_logs_reason ON waste_logs(reason);
    """)
    conn.commit()
    conn.close()


def seed_db():
    """Seed the database with Edmonds Cafe items if empty."""
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM vendors").fetchone()[0]
    if count > 0:
        conn.close()
        return

    vendors_and_items = [
        ("Galant", [
            "Bacon Burrito",
            "Chile Verde Burrito",
            "Plant Based Burrito",
            "Chicken Sausage Sandwich",
        ]),
        ("Dining Hall Food", [
            "Turkey Pesto",
            "Eggything",
        ]),
        ("Firebrand", [
            "Everything Bagel Croissant",
            "Butter Croissant",
            "Almond Croissant",
            "Chocolate Croissant",
            "Ham & Cheese Croissant",
            "Banana Walnut Loaf",
            "Sea Salt Pretzel",
        ]),
        ("Third Culture", [
            "Chocolate Donut",
            "Ube Donut",
            "Red Velvet Muffin",
            "Seasonal Muffin/Donut",
        ]),
        ("Boichik Bagels", [
            "Everything Bagel",
            "Sesame Bagel",
            "Cin Raisin Bagel",
            "Plain Bagel",
        ]),
        ("Sysco", [
            "Chocolate Chunk Cookie",
        ]),
    ]

    order = 0
    for vendor_name, items in vendors_and_items:
        cursor = conn.execute(
            "INSERT INTO vendors (name) VALUES (?)", (vendor_name,)
        )
        vendor_id = cursor.lastrowid
        for item_name in items:
            conn.execute(
                "INSERT INTO items (vendor_id, name, display_order) VALUES (?, ?, ?)",
                (vendor_id, item_name, order),
            )
            order += 1

    conn.commit()
    conn.close()
    print(f"Seeded {order} items across {len(vendors_and_items)} vendors.")
