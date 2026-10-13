-- Kapitel 26. Kör i en separat övningsdatabas. Återställer dessa fyra tabeller.
PRAGMA foreign_keys = ON;
BEGIN;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Tour;
DROP TABLE IF EXISTS Visitor;
DROP TABLE IF EXISTS Guide;
CREATE TABLE Guide (
    GuideID INTEGER PRIMARY KEY,
    GuideName TEXT NOT NULL
);
CREATE TABLE Visitor (
    VisitorID INTEGER PRIMARY KEY,
    VisitorName TEXT NOT NULL
);
CREATE TABLE Tour (
    TourID INTEGER PRIMARY KEY,
    Title TEXT NOT NULL,
    StartsAt TEXT NOT NULL,
    Capacity INTEGER NOT NULL CHECK (Capacity > 0),
    GuideID INTEGER NOT NULL,
    FOREIGN KEY (GuideID) REFERENCES Guide(GuideID)
);
CREATE TABLE Booking (
    TourID INTEGER NOT NULL,
    VisitorID INTEGER NOT NULL,
    Seats INTEGER NOT NULL CHECK (Seats > 0),
    PRIMARY KEY (TourID, VisitorID),
    FOREIGN KEY (TourID) REFERENCES Tour(TourID),
    FOREIGN KEY (VisitorID) REFERENCES Visitor(VisitorID)
);
INSERT INTO Guide VALUES (11, 'Amina'), (12, 'Leo');
INSERT INTO Visitor VALUES (1, 'Nora'), (2, 'Bo'), (3, 'Inez');
INSERT INTO Tour VALUES
    (101, 'Textiles', '2027-03-10 10:00', 5, 11),
    (102, 'Silver', '2027-03-10 13:00', 8, 12),
    (103, 'Storage', '2027-03-11 10:00', 4, 11);
INSERT INTO Booking VALUES (101, 1, 2), (101, 2, 1), (102, 1, 2);
COMMIT;
-- Kontroll: 2 guider, 3 besökare, 3 visningar, 3 bokningar.
SELECT * FROM Booking ORDER BY TourID, VisitorID;
