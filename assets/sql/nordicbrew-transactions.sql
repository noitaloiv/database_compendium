-- Separat övningsdatabas för kapitel 18. Kör om filen för att återställa.
-- Kör inte mot nordicbrew-minimal.sql: detta är en avgränsad lagerutvidgning.
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS Shipment;
DROP TABLE IF EXISTS Inventory;
CREATE TABLE Inventory (
    ProductID INTEGER PRIMARY KEY,
    Units INTEGER NOT NULL CHECK (Units >= 0)
);
CREATE TABLE Shipment (
    ShipmentID INTEGER PRIMARY KEY,
    ProductID INTEGER NOT NULL REFERENCES Inventory(ProductID),
    Quantity INTEGER NOT NULL CHECK (Quantity > 0)
);
INSERT INTO Inventory (ProductID, Units) VALUES (501, 100), (502, 60);
-- Kontroller: 2 lagerposter, 0 leveranser; produkt 501 har 100 förpackningar.
SELECT ProductID, Units FROM Inventory ORDER BY ProductID;
SELECT COUNT(*) AS ShipmentCount FROM Shipment;
