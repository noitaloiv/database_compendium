-- Nordic Brew – gemensamma övningsdata för kapitel 12–15 och 17.
-- Kör i en separat övningsdatabas. Filen återställer de fyra tabellerna.
-- Avsluta en eventuell tidigare transaktion innan filen körs.

PRAGMA foreign_keys = ON;

BEGIN;

DROP TABLE IF EXISTS OrderLine;
DROP TABLE IF EXISTS SalesOrder;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Customer;

CREATE TABLE Customer (
    CustomerID INTEGER PRIMARY KEY,
    CustomerName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE
);

CREATE TABLE Product (
    ProductID INTEGER PRIMARY KEY,
    ProductName TEXT NOT NULL UNIQUE,
    ListPriceOre INTEGER NOT NULL CHECK (ListPriceOre >= 0),
    Active INTEGER NOT NULL DEFAULT 1 CHECK (Active IN (0, 1))
);

CREATE TABLE SalesOrder (
    OrderID INTEGER PRIMARY KEY,
    OrderDate TEXT NOT NULL,
    CustomerID INTEGER NOT NULL,
    Status TEXT NOT NULL
        CHECK (Status IN ('DRAFT', 'CONFIRMED', 'SHIPPED', 'CANCELLED')),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE OrderLine (
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    AgreedUnitPriceOre INTEGER NOT NULL CHECK (AgreedUnitPriceOre >= 0),
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES SalesOrder(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

INSERT INTO Customer (CustomerID, CustomerName, Email) VALUES
    (17, 'Mira Ek', 'mira@example.test'),
    (24, 'Samir Noor', 'samir@example.test'),
    (31, 'Lo Chen', 'lo@example.test');

INSERT INTO Product (ProductID, ProductName, ListPriceOre, Active) VALUES
    (501, 'Brew coffee 500 g', 12900, 1),
    (502, 'Espresso blend 250 g', 8900, 1),
    (503, 'Decaf coffee 250 g', 9900, 1),
    (504, 'Winter blend 500 g', 14900, 0);

INSERT INTO SalesOrder (OrderID, OrderDate, CustomerID, Status) VALUES
    (1042, '2027-01-15', 17, 'CONFIRMED'),
    (1043, '2027-01-15', 24, 'SHIPPED'),
    (1044, '2027-01-17', 17, 'DRAFT');

INSERT INTO OrderLine (OrderID, ProductID, Quantity, AgreedUnitPriceOre) VALUES
    (1042, 501, 2, 12900),
    (1042, 502, 1, 8900),
    (1043, 501, 1, 11900),
    (1043, 503, 3, 9900);

COMMIT;

-- Kontroll: 3 kunder, 4 produkter, 3 beställningar, 4 orderrader.
SELECT COUNT(*) AS CustomerCount FROM Customer;
SELECT COUNT(*) AS ProductCount FROM Product;
SELECT COUNT(*) AS OrderCount FROM SalesOrder;
SELECT COUNT(*) AS LineCount FROM OrderLine;
