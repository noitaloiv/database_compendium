"""Check actual chapter SQL against independent expected results (no packages)."""
from pathlib import Path
import re
import sqlite3
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parents[1]


def database(name):
    db = sqlite3.connect(':memory:', isolation_level=None)
    db.executescript((ROOT / 'assets/sql' / name).read_text())
    return db


def blocks(section):
    chapter = int(section.split('.')[0])
    path = next((ROOT / 'docs').rglob(f'{chapter:02d}-*.md'))
    match = re.search(rf'^## {re.escape(section)} .*?\n(.*?)(?=^## |\Z)', path.read_text(), re.M | re.S)
    assert match, f'Missing section {section}'
    return re.findall(r'```sql\n(.*?)```', match.group(1), re.S)


def query(db, section, number, expected):
    actual = db.execute(blocks(section)[number - 1]).fetchall()
    assert actual == expected, f'{section}, block {number}: {actual!r} != {expected!r}'


def reject(db, sql, constraint):
    try:
        db.execute(sql)
    except sqlite3.IntegrityError as error:
        assert constraint in str(error), f'Wrong failure: {error}'
    else:
        raise AssertionError(f'Expected {constraint} to reject {sql}')


def check_examples():
    # Every supplied start file must be rerunnable and leave valid references.
    for path in (ROOT / 'assets/sql').glob('*.sql'):
        db = database(path.name)
        before = db.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name').fetchall()
        counts = {name: db.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone() for name, in before}
        db.executescript(path.read_text())
        assert db.execute('PRAGMA foreign_keys').fetchone() == (1,), path.name
        assert db.execute('PRAGMA foreign_key_check').fetchall() == [], path.name
        for name, count in counts.items():
            assert db.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone() == count, path.name
        db.close()

    db = database('nordicbrew-minimal.sql')
    # Chapter 12.3 explicitly uses an independent Contact fixture.
    db.executescript((ROOT / 'assets/sql/null-intro.sql').read_text())
    assert db.execute('SELECT CustomerID FROM Contact WHERE Email IS NULL').fetchall() == [(31,)]
    assert db.execute("SELECT CustomerID FROM Contact WHERE Email = ''").fetchall() == [(24,)]
    assert db.execute("SELECT CustomerID FROM Contact WHERE Email <> 'mira@example.test'").fetchall() == [(24,)]
    for section in ('12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '12.7', '12.9'):
        for sql in blocks(section):
            db.execute(sql).fetchall()
    query(db, '12.7', 1, [(17,), (17,), (24,)])
    query(db, '12.7', 2, [(17,), (24,)])
    query(db, '13.2', 1, [('Mira Ek', 1042), ('Samir Noor', 1043), ('Mira Ek', 1044)])
    query(db, '13.4', 1, [('Mira Ek', 1042), ('Mira Ek', 1044), ('Samir Noor', 1043), ('Lo Chen', None)])
    query(db, '13.6', 2, [(1042, 'Mira Ek', 'Brew coffee 500 g', 2), (1042, 'Mira Ek', 'Espresso blend 250 g', 1), (1043, 'Samir Noor', 'Brew coffee 500 g', 1), (1043, 'Samir Noor', 'Decaf coffee 250 g', 3)])
    query(db, '13.6', 3, [('Mira Ek', 1042), ('Samir Noor', None), ('Lo Chen', None)])
    query(db, '14.1', 1, [(4, 7)])
    query(db, '14.2', 1, [(501, 3), (502, 1), (503, 3)])
    query(db, '14.4', 1, [(501, 2), (502, 1)])
    query(db, '14.4', 2, [(501, 3), (503, 3)])
    query(db, '14.5', 1, [(8900, 14900, 11650)])
    query(db, '14.5', 2, [(1042, 34700), (1043, 41600)])
    query(db, '14.6', 1, [(17, 'Mira Ek', 2), (24, 'Samir Noor', 1), (31, 'Lo Chen', 0)])
    query(db, '14.8', 1, [(17, 'Mira Ek', 2)])
    query(db, '14.8', 2, [(17, 'Mira Ek', 'Brew coffee 500 g', 2), (24, 'Samir Noor', 'Decaf coffee 250 g', 3)])
    query(db, '15.1', 2, [(501, 'Brew coffee 500 g', 12900), (504, 'Winter blend 500 g', 14900)])
    products = [(501, 'Brew coffee 500 g'), (502, 'Espresso blend 250 g'), (503, 'Decaf coffee 250 g')]
    query(db, '15.2', 1, products)
    query(db, '15.6', 4, products)
    for operation, result in [('UNION', [(501,), (502,), (503,), (504,)]), ('INTERSECT', [(501,)]), ('EXCEPT', [(504,)])]:
        assert db.execute(blocks('15.4')[0].replace('UNION', operation)).fetchall() == result
    db.close()

    db = database('transfer-exercises.sql')
    for sql in blocks('12.11'):
        db.execute(sql).fetchall()
    query(db, '12.11', 3, [('Woven banner',)])
    query(db, '12.11', 4, [('CERAMIC',), ('METAL',), ('TEXTILE',)])
    query(db, '12.11', 5, [('Clay vessel', 2021), ('Woven banner', 2019), ('Silver bowl', 2012), ('Wool cap', 2008)])
    query(db, '13.7', 1, [('Data with meaning', 'Amina Said'), ('Data with meaning', 'Leo Borg'), ('Reliable systems', 'Amina Said')])
    query(db, '14.7', 1, [(6, 225)])
    query(db, '14.7', 2, [(21, 75), (22, 40), (23, 20)])
    assert db.execute(blocks('14.7')[1].strip().rstrip(';') + '\nHAVING SUM(DurationMinutes) >= 60').fetchall() == [(21, 75)]
    query(db, '15.6', 1, [(201, 'North Wind'), (202, 'River Maps')])
    query(db, '15.6', 2, [(201,), (202,), (203,)])
    query(db, '15.6', 3, [(203,)])
    assert db.execute(blocks('15.6')[1].replace('UNION', 'INTERSECT')).fetchall() == [(202,)]
    db.close()

    db = database('nordicbrew-minimal.sql')
    db.execute(blocks('17.2')[0])
    query(db, '17.2', 2, [(38, 'Noor Ali', 'noor@example.test')])
    db.close()
    db = database('nordicbrew-minimal.sql')  # Reset before the next section, as instructed.
    reject(db, blocks('17.3')[0], 'UNIQUE')
    query(db, '17.3', 2, [])
    query(db, '17.4', 1, [(1042, 'CONFIRMED')])
    db.execute(blocks('17.4')[1])
    query(db, '17.4', 1, [(1042, 'SHIPPED')])
    query(db, '17.4', 3, [(3,)])
    db.execute(blocks('17.4')[3])
    assert db.execute('SELECT ListPriceOre FROM Product ORDER BY ProductID').fetchall() == [(13000,), (9000,), (10000,), (14900,)]
    db.execute(blocks('17.5')[0])
    assert db.execute('SELECT OrderID FROM SalesOrder ORDER BY OrderID').fetchall() == [(1042,), (1043,)]
    reject(db, blocks('17.5')[1], 'FOREIGN KEY')
    db.close()

    db = sqlite3.connect(':memory:', isolation_level=None)
    db.executescript(blocks('17.8')[0])
    db.executescript(blocks('17.8')[1])
    assert db.execute('SELECT ArtifactID, StorageRoom FROM Artifact ORDER BY ArtifactID').fetchall() == [(1, 'A2'), (2, 'B2'), (3, 'A2')]
    reject(db, blocks('17.8')[2], 'UNIQUE')
    db.executescript(blocks('17.8')[0])
    assert db.execute('SELECT COUNT(*) FROM Artifact').fetchone() == (3,)
    db.close()

    db = database('rental-solution.sql')
    for sql, rule in [("INSERT INTO Equipment VALUES (12, 'Tripod', -100)", 'CHECK'), ('INSERT INTO Rental VALUES (102, 99, 1)', 'FOREIGN KEY'), ('INSERT INTO Rental VALUES (102, 11, 0)', 'CHECK'), ('INSERT INTO Rental VALUES (101, 11, 1)', 'UNIQUE'), ('INSERT INTO Rental VALUES (102, NULL, 1)', 'NOT NULL')]:
        reject(db, sql, rule)
    db.close()
    db = database('inspection-solution.sql')
    assert db.execute('SELECT InspectionID, Result FROM Inspection').fetchall() == [(901, 'PASS')]
    for sql, rule in [
        ("INSERT INTO Inspection VALUES (902, 99, 31, '2027-01-12 10:00', 'PASS')", 'FOREIGN KEY'),
        ("INSERT INTO Inspection VALUES (903, 7, 31, '2027-01-12 10:00', 'UNKNOWN')", 'CHECK'),
        ("INSERT INTO Inspection VALUES (901, 7, 31, '2027-01-12 10:00', 'PASS')", 'UNIQUE'),
        ("INSERT INTO Inspection VALUES (902, NULL, 31, '2027-01-12 10:00', 'PASS')", 'NOT NULL')]:
        reject(db, sql, rule)
    assert db.execute('SELECT COUNT(*) FROM Inspection').fetchone() == (1,)
    db.execute("INSERT INTO Inspection VALUES (904, 7, 31, '2027-01-13 10:00', 'FAIL')")
    assert db.execute('SELECT InspectionID, Result FROM Inspection ORDER BY InspectionID').fetchall() == [(901, 'PASS'), (904, 'FAIL')]
    db.close()
    db = database('museum-case.sql')
    query(db, '26.6', 2, [(101, 'Textiles', 'Nora', 2), (101, 'Textiles', 'Bo', 1), (102, 'Silver', 'Nora', 2)])
    query(db, '26.7', 1, [(101, 3), (102, 2)])
    query(db, '26.7', 2, [(101, 'Textiles', 2), (102, 'Silver', 1), (103, 'Storage', 0)])
    reject(db, blocks('26.8')[0], 'CHECK')
    reject(db, 'INSERT INTO Booking VALUES (999, 3, 1)', 'FOREIGN KEY')
    assert db.execute('SELECT * FROM Booking WHERE VisitorID = 3').fetchall() == []
    db.close()

    db = database('nordicbrew-transactions.sql')
    for sql, units, shipments in zip(blocks('18.3'), [90,100,90], [0,0,1]):
        # Keep BEGIN and ROLLBACK in the same connection across separate blocks.
        for statement in sql.split(';'):
            if statement.strip():
                db.execute(statement)
        assert db.execute('SELECT Units FROM Inventory WHERE ProductID = 501').fetchone() == (units,)
        assert db.execute('SELECT COUNT(*) FROM Shipment').fetchone() == (shipments,)
    assert db.execute('SELECT * FROM Shipment').fetchall() == [(1001,501,10)]
    # The book's caution: a failed second statement leaves the earlier change pending.
    db.execute('BEGIN')
    db.execute('UPDATE Inventory SET Units = Units - 10 WHERE ProductID = 501')
    reject(db, 'INSERT INTO Shipment VALUES (1001,501,10)', 'UNIQUE')
    assert db.in_transaction
    assert db.execute('SELECT Units FROM Inventory WHERE ProductID = 501').fetchone() == (80,)
    db.execute('ROLLBACK')
    assert db.execute('SELECT Units FROM Inventory WHERE ProductID = 501').fetchone() == (90,)
    db.close()
    db = database('transaction-basics.sql')
    for statement in blocks('18.6')[0].split(';'):
        if statement.strip(): db.execute(statement)
    assert db.execute('SELECT AccountID, Balance FROM Account ORDER BY AccountID').fetchall() == [(1,800),(2,700)]
    db.close()
    db = database('transfer-exercises.sql')
    query(db, '12.11', 7, [(302,202),(303,201)])
    db.close()
    db = database('nordicbrew-minimal.sql')
    result = db.execute(blocks('11.6')[0]).fetchall()
    assert set(result) == {('Espresso blend 250 g',8900),('Decaf coffee 250 g',9900)}
    # Set projection versus SQL's retained repeated rows.
    assert db.execute('SELECT CustomerID FROM SalesOrder ORDER BY CustomerID').fetchall() == [(17,),(17,),(24,)]
    assert len(db.execute('SELECT DISTINCT CustomerID, OrderID FROM SalesOrder').fetchall()) == 3
    db.close()
    with TemporaryDirectory() as temporary:
        path = str(Path(temporary) / 'locks.db')
        a = sqlite3.connect(path, timeout=0, isolation_level=None)
        b = sqlite3.connect(path, timeout=0, isolation_level=None)
        try:
            a.executescript('CREATE TABLE Stock (ProductID INTEGER PRIMARY KEY, Units INTEGER); INSERT INTO Stock VALUES (1, 100);')
            a.execute('BEGIN IMMEDIATE')
            a.execute('UPDATE Stock SET Units = Units - 10 WHERE ProductID = 1')
            try:
                b.execute('BEGIN IMMEDIATE')
            except sqlite3.OperationalError as error:
                assert 'locked' in str(error)
            else:
                raise AssertionError('Simultaneous SQLite writers were admitted')
            a.execute('COMMIT')
            b.execute('BEGIN IMMEDIATE')
            assert b.execute('SELECT Units FROM Stock').fetchone() == (90,)
            b.execute('UPDATE Stock SET Units = Units - 20 WHERE ProductID = 1')
            b.execute('COMMIT')
            assert a.execute('SELECT Units FROM Stock').fetchone() == (70,)
        finally:
            a.close()
            b.close()