-- Nordic Brew minimal – schema- och dataversion 0.1
-- Avsett för kapitel 2 i databaskompendiet för 2IS007.
-- Kräver SQLite 3.37 eller senare på grund av STRICT-tabeller.

PRAGMA foreign_keys = ON;

BEGIN;

DROP TABLE IF EXISTS Orderrad;
DROP TABLE IF EXISTS Bestallning;
DROP TABLE IF EXISTS Produkt;
DROP TABLE IF EXISTS Kund;

CREATE TABLE Kund (
    KundID INTEGER PRIMARY KEY,
    Namn TEXT NOT NULL CHECK (length(trim(Namn)) > 0),
    Epost TEXT NOT NULL UNIQUE CHECK (instr(Epost, '@') > 1)
) STRICT;

CREATE TABLE Produkt (
    ProduktID INTEGER PRIMARY KEY,
    Produktnamn TEXT NOT NULL UNIQUE CHECK (length(trim(Produktnamn)) > 0),
    ListprisOre INTEGER NOT NULL CHECK (ListprisOre >= 0),
    Aktiv INTEGER NOT NULL DEFAULT 1 CHECK (Aktiv IN (0, 1))
) STRICT;

CREATE TABLE Bestallning (
    OrderID INTEGER PRIMARY KEY,
    Orderdatum TEXT NOT NULL
        CHECK (
            length(Orderdatum) = 10
            AND Orderdatum GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
            AND date(Orderdatum) = Orderdatum
        ),
    KundID INTEGER NOT NULL,
    Status TEXT NOT NULL CHECK (Status IN ('UTKAST', 'BEKRAFTAD', 'SKICKAD', 'AVBRUTEN')),
    CONSTRAINT fk_bestallning_kund
        FOREIGN KEY (KundID) REFERENCES Kund(KundID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) STRICT;

CREATE TABLE Orderrad (
    OrderID INTEGER NOT NULL,
    ProduktID INTEGER NOT NULL,
    Antal INTEGER NOT NULL CHECK (Antal > 0),
    AvtalatStyckprisOre INTEGER NOT NULL CHECK (AvtalatStyckprisOre >= 0),
    CONSTRAINT pk_orderrad PRIMARY KEY (OrderID, ProduktID),
    CONSTRAINT fk_orderrad_bestallning
        FOREIGN KEY (OrderID) REFERENCES Bestallning(OrderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_orderrad_produkt
        FOREIGN KEY (ProduktID) REFERENCES Produkt(ProduktID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) STRICT;

INSERT INTO Kund (KundID, Namn, Epost) VALUES
    (17, 'Mira Ek', 'mira@example.test'),
    (24, 'Samir Noor', 'samir@example.test'),
    (31, 'Lo Chen', 'lo@example.test');

INSERT INTO Produkt (ProduktID, Produktnamn, ListprisOre, Aktiv) VALUES
    (501, 'Bryggkaffe 500 g', 12900, 1),
    (502, 'Espressoblandning 250 g', 8900, 1),
    (503, 'Koffeinfritt 250 g', 9900, 1),
    (504, 'Vinterblandning 500 g', 14900, 0);

INSERT INTO Bestallning (OrderID, Orderdatum, KundID, Status) VALUES
    (1042, '2027-01-15', 17, 'BEKRAFTAD'),
    (1043, '2027-01-15', 24, 'SKICKAD'),
    (1044, '2027-01-17', 17, 'UTKAST');

INSERT INTO Orderrad (OrderID, ProduktID, Antal, AvtalatStyckprisOre) VALUES
    (1042, 501, 2, 12900),
    (1042, 502, 1, 8900),
    (1043, 501, 1, 11900),
    (1043, 503, 3, 9900);

COMMIT;

-- Verifiering: ska ge tre kunder, fyra produkter, tre beställningar och fyra orderrader.
SELECT 'Kund' AS Relation, count(*) AS AntalRader FROM Kund
UNION ALL
SELECT 'Produkt', count(*) FROM Produkt
UNION ALL
SELECT 'Bestallning', count(*) FROM Bestallning
UNION ALL
SELECT 'Orderrad', count(*) FROM Orderrad;

-- Exemplet från kapitel 2: kundnamn för order 1042.
SELECT b.OrderID, k.Namn
FROM Bestallning AS b
JOIN Kund AS k ON k.KundID = b.KundID
WHERE b.OrderID = 1042;

