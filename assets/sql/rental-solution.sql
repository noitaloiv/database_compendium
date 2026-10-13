-- Lösningsförslag till 16.12. Kör i en separat övningsdatabas.
PRAGMA foreign_keys = ON;
BEGIN;
DROP TABLE IF EXISTS Rental;
DROP TABLE IF EXISTS Equipment;
CREATE TABLE Equipment (
    EquipmentID INTEGER PRIMARY KEY,
    EquipmentName TEXT NOT NULL,
    DailyPriceOre INTEGER NOT NULL CHECK (DailyPriceOre >= 0)
);
CREATE TABLE Rental (
    RentalID INTEGER PRIMARY KEY,
    EquipmentID INTEGER NOT NULL,
    Days INTEGER NOT NULL CHECK (Days > 0),
    FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);
INSERT INTO Equipment VALUES (11, 'Camera', 25000);
INSERT INTO Rental VALUES (101, 11, 2);
COMMIT;
SELECT * FROM Equipment;
SELECT * FROM Rental;