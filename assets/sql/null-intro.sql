-- Kör i en separat övningsdatabas. Återställer endast Contact.
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS Contact;
CREATE TABLE Contact (CustomerID INTEGER PRIMARY KEY, Email TEXT);
INSERT INTO Contact VALUES (17, 'mira@example.test'), (24, ''), (31, NULL);