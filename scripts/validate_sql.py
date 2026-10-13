#!/usr/bin/env python3
"""Smoke-test the SQL assets with Python's bundled SQLite."""

from pathlib import Path
import sqlite3
from validate_sql_examples import check_examples


ROOT = Path(__file__).resolve().parents[1]


def load_script(name: str) -> sqlite3.Connection:
    connection = sqlite3.connect(":memory:")
    sql_path = ROOT / "assets" / "sql" / name
    connection.executescript(sql_path.read_text(encoding="utf-8"))
    return connection


def check_counts(
    connection: sqlite3.Connection, expected: dict[str, int]
) -> None:
    for table, count in expected.items():
        actual = connection.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0]
        assert actual == count, f"{table}: expected {count}, got {actual}"


def check_minimal() -> None:
    connection = load_script("nordicbrew-minimal.sql")

    assert connection.execute("PRAGMA foreign_keys").fetchone() == (1,)
    check_counts(connection, {
        "Customer": 3,
        "Product": 4,
        "SalesOrder": 3,
        "OrderLine": 4,
    })

    try:
        connection.execute(
            "INSERT INTO OrderLine VALUES (1042, 999, 1, 5000)"
        )
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Foreign-key violation was accepted")


def check_transaction_lab() -> None:
    connection = load_script("transaction-basics.sql")
    check_counts(connection, {"Account": 2, "Inventory": 1})
    connection.executescript(
        """
        BEGIN;
        UPDATE Account SET Balance = Balance - 200 WHERE AccountID = 1;
        ROLLBACK;
        """
    )
    assert connection.execute(
        "SELECT Balance FROM Account WHERE AccountID = 1"
    ).fetchone() == (1000,)


def check_transfer_exercises() -> None:
    connection = load_script("transfer-exercises.sql")
    check_counts(connection, {
        "Artifact": 4,
        "Speaker": 3,
        "ConferenceSession": 3,
        "SessionSpeaker": 3,
        "Practitioner": 3,
        "Appointment": 6,
        "Book": 4,
        "Loan": 3,
        "Reservation": 2,
    })


def check_rental_solution() -> None:
    connection = load_script("rental-solution.sql")
    check_counts(connection, {"Equipment": 1, "Rental": 1})
    try:
        connection.execute("INSERT INTO Rental VALUES (102, 99, 1)")
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Rental referencing missing equipment was accepted")


def main() -> None:
    check_minimal()
    check_transaction_lab()
    check_transfer_exercises()
    check_rental_solution()
    check_examples()

if __name__ == "__main__":
    main()