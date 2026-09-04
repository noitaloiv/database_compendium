#!/usr/bin/env python3
"""Smoke-test the SQL assets with Python's bundled SQLite."""

from pathlib import Path
import sqlite3


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    sql_path = ROOT / "assets" / "sql" / "nordicbrew-minimal.sql"
    connection = sqlite3.connect(":memory:")
    connection.executescript(sql_path.read_text(encoding="utf-8"))

    assert connection.execute("PRAGMA foreign_keys").fetchone() == (1,)
    expected = {
        "Kund": 3,
        "Produkt": 4,
        "Bestallning": 3,
        "Orderrad": 4,
    }
    for table, count in expected.items():
        actual = connection.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0]
        assert actual == count, f"{table}: expected {count}, got {actual}"

    try:
        connection.execute(
            "INSERT INTO Orderrad VALUES (1042, 999, 1, 5000)"
        )
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Foreign-key violation was accepted")

    print(f"SQL assets valid with SQLite {sqlite3.sqlite_version}")


if __name__ == "__main__":
    main()

