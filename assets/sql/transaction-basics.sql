-- Kapitel 18. Kör i en separat övningsdatabas, med föregående transaktion avslutad.
-- Återställer Account och Inventory till ett känt läge.
PRAGMA foreign_keys = ON;
BEGIN;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Inventory;
CREATE TABLE Account (
    AccountID INTEGER PRIMARY KEY,
    Balance INTEGER NOT NULL CHECK (Balance >= 0)
);
CREATE TABLE Inventory (
    ProductID INTEGER PRIMARY KEY,
    UnitsInStock INTEGER NOT NULL CHECK (UnitsInStock >= 0)
);
INSERT INTO Account VALUES (1, 1000), (2, 500);
INSERT INTO Inventory VALUES (501, 100);
COMMIT;
SELECT AccountID, Balance FROM Account ORDER BY AccountID;