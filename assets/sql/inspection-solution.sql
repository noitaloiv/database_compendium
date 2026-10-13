-- Lösning till 16.13. Använd en separat övningsdatabas inspection.db.
PRAGMA foreign_keys = ON;
BEGIN;
DROP TABLE IF EXISTS Inspection;
DROP TABLE IF EXISTS Equipment;
DROP TABLE IF EXISTS Inspector;
CREATE TABLE Equipment (EquipmentID INTEGER PRIMARY KEY, EquipmentName TEXT NOT NULL);
CREATE TABLE Inspector (InspectorID INTEGER PRIMARY KEY, InspectorName TEXT NOT NULL);
CREATE TABLE Inspection (
 InspectionID INTEGER PRIMARY KEY,
 EquipmentID INTEGER NOT NULL REFERENCES Equipment(EquipmentID),
 InspectorID INTEGER NOT NULL REFERENCES Inspector(InspectorID),
 InspectedAt TEXT NOT NULL,
 Result TEXT NOT NULL CHECK (Result IN ('PASS','FAIL'))
);
INSERT INTO Equipment VALUES (7,'Lift A');
INSERT INTO Inspector VALUES (31,'Nora Berg');
INSERT INTO Inspection VALUES (901,7,31,'2027-01-12 10:00','PASS');
COMMIT;
SELECT * FROM Inspection ORDER BY InspectionID;
