-- Kapitel 16.12: kör i rental-lab.db, en separat övningsdatabas.
-- Varje körning återställer övningens tabeller. Avsluta tidigare transaktioner först.
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS Rental;
DROP TABLE IF EXISTS Equipment;
CREATE TABLE Equipment (
    EquipmentID INTEGER PRIMARY KEY,
    EquipmentName TEXT NOT NULL,
    DailyPriceOre INTEGER NOT NULL
);
-- Steg 1: komplettera DailyPriceOre ovan med CHECK (DailyPriceOre >= 0).
-- Steg 2: skriv CREATE TABLE Rental här. Läs reglerna i avsnitt 16.12.
-- Steg 3: kör testregistreringarna från texten först när båda tabellerna finns.