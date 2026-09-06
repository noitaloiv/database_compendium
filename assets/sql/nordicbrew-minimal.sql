-- Nordic Brew minimal – schema and data version 0.2
-- Used by the introductory chapters in the 2IS007 database compendium.
-- Requires SQLite 3.37 or later because the tables use STRICT mode.

PRAGMA foreign_keys = ON;

BEGIN;

DROP TABLE IF EXISTS OrderLine;
DROP TABLE IF EXISTS SalesOrder;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Customer;

CREATE TABLE Customer (
    CustomerID INTEGER PRIMARY KEY,
    CustomerName TEXT NOT NULL CHECK (length(trim(CustomerName)) > 0),
    Email TEXT NOT NULL UNIQUE CHECK (instr(Email, '@') > 1)
) STRICT;

CREATE TABLE Product (
    ProductID INTEGER PRIMARY KEY,
    ProductName TEXT NOT NULL UNIQUE CHECK (length(trim(ProductName)) > 0),
    ListPriceOre INTEGER NOT NULL CHECK (ListPriceOre >= 0),
    Active INTEGER NOT NULL DEFAULT 1 CHECK (Active IN (0, 1))
) STRICT;

CREATE TABLE SalesOrder (
    OrderID INTEGER PRIMARY KEY,
    OrderDate TEXT NOT NULL
        CHECK (
            length(OrderDate) = 10
            AND OrderDate GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
            AND date(OrderDate) = OrderDate
        ),
    CustomerID INTEGER NOT NULL,
    Status TEXT NOT NULL
        CHECK (Status IN ('DRAFT', 'CONFIRMED', 'SHIPPED', 'CANCELLED')),
    CONSTRAINT fk_sales_order_customer
        FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) STRICT;

CREATE TABLE OrderLine (
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    AgreedUnitPriceOre INTEGER NOT NULL CHECK (AgreedUnitPriceOre >= 0),
    CONSTRAINT pk_order_line PRIMARY KEY (OrderID, ProductID),
    CONSTRAINT fk_order_line_sales_order
        FOREIGN KEY (OrderID) REFERENCES SalesOrder(OrderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_order_line_product
        FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) STRICT;

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

-- Verification: 3 customers, 4 products, 3 orders, and 4 order lines.
SELECT 'Customer' AS RelationName, count(*) AS RowCount FROM Customer
UNION ALL
SELECT 'Product', count(*) FROM Product
UNION ALL
SELECT 'SalesOrder', count(*) FROM SalesOrder
UNION ALL
SELECT 'OrderLine', count(*) FROM OrderLine;

-- Example: show the customer name for order 1042.
SELECT so.OrderID, c.CustomerName
FROM SalesOrder AS so
JOIN Customer AS c ON c.CustomerID = so.CustomerID
WHERE so.OrderID = 1042;
