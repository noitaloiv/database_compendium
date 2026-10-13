-- Starter data for the transfer exercises in chapters 12–15.
-- Run this file in a separate, disposable SQLite database.

PRAGMA foreign_keys = ON;

BEGIN;

DROP TABLE IF EXISTS SessionSpeaker;
DROP TABLE IF EXISTS ConferenceSession;
DROP TABLE IF EXISTS Speaker;
DROP TABLE IF EXISTS Appointment;
DROP TABLE IF EXISTS Practitioner;
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS Loan;
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Artifact;

CREATE TABLE Artifact (
    ArtifactID INTEGER PRIMARY KEY,
    ArtifactName TEXT NOT NULL,
    Category TEXT NOT NULL,
    AcquisitionYear INTEGER NOT NULL,
    OnDisplay INTEGER NOT NULL CHECK (OnDisplay IN (0, 1))
);

INSERT INTO Artifact VALUES
    (1, 'Silver bowl', 'METAL', 2012, 1),
    (2, 'Woven banner', 'TEXTILE', 2019, 1),
    (3, 'Clay vessel', 'CERAMIC', 2021, 0),
    (4, 'Wool cap', 'TEXTILE', 2008, 0);

CREATE TABLE Speaker (
    SpeakerID INTEGER PRIMARY KEY,
    SpeakerName TEXT NOT NULL
);

CREATE TABLE ConferenceSession (
    SessionID INTEGER PRIMARY KEY,
    SessionTitle TEXT NOT NULL,
    Room TEXT NOT NULL
);

CREATE TABLE SessionSpeaker (
    SessionID INTEGER NOT NULL,
    SpeakerID INTEGER NOT NULL,
    SpeakingOrder INTEGER NOT NULL CHECK (SpeakingOrder > 0),
    PRIMARY KEY (SessionID, SpeakerID),
    FOREIGN KEY (SessionID) REFERENCES ConferenceSession (SessionID),
    FOREIGN KEY (SpeakerID) REFERENCES Speaker (SpeakerID)
);

INSERT INTO Speaker VALUES
    (1, 'Amina Said'),
    (2, 'Leo Borg'),
    (3, 'Nora Ali');

INSERT INTO ConferenceSession VALUES
    (10, 'Data with meaning', 'A1'),
    (11, 'Reliable systems', 'B2'),
    (12, 'Closing discussion', 'A1');

INSERT INTO SessionSpeaker VALUES
    (10, 1, 1),
    (10, 2, 2),
    (11, 1, 1);

CREATE TABLE Practitioner (
    PractitionerID INTEGER PRIMARY KEY,
    PractitionerName TEXT NOT NULL
);

CREATE TABLE Appointment (
    AppointmentID INTEGER PRIMARY KEY,
    PractitionerID INTEGER NOT NULL,
    AppointmentDate TEXT NOT NULL,
    DurationMinutes INTEGER NOT NULL CHECK (DurationMinutes > 0),
    Status TEXT NOT NULL CHECK (Status IN ('BOOKED', 'COMPLETED', 'CANCELLED')),
    FOREIGN KEY (PractitionerID) REFERENCES Practitioner (PractitionerID)
);

INSERT INTO Practitioner VALUES
    (21, 'Kim Lund'),
    (22, 'Sam Ek'),
    (23, 'Lo Ali');

INSERT INTO Appointment VALUES
    (101, 21, '2027-02-01', 30, 'COMPLETED'),
    (102, 21, '2027-02-01', 45, 'COMPLETED'),
    (103, 21, '2027-02-02', 30, 'BOOKED'),
    (104, 22, '2027-02-03', 60, 'CANCELLED'),
    (105, 22, '2027-02-04', 40, 'COMPLETED'),
    (106, 23, '2027-02-04', 20, 'COMPLETED');

CREATE TABLE Book (
    BookID INTEGER PRIMARY KEY,
    Title TEXT NOT NULL,
    PublicationYear INTEGER NOT NULL
);

CREATE TABLE Loan (
    LoanID INTEGER PRIMARY KEY,
    BookID INTEGER NOT NULL,
    MemberID INTEGER NOT NULL,
    LoanDate TEXT NOT NULL,
    ReturnDate TEXT,
    FOREIGN KEY (BookID) REFERENCES Book (BookID)
);

CREATE TABLE Reservation (
    ReservationID INTEGER PRIMARY KEY,
    BookID INTEGER NOT NULL,
    MemberID INTEGER NOT NULL,
    ReservedAt TEXT NOT NULL,
    FOREIGN KEY (BookID) REFERENCES Book (BookID)
);

INSERT INTO Book VALUES
    (201, 'North Wind', 2018),
    (202, 'River Maps', 2022),
    (203, 'Small Systems', 2024),
    (204, 'Old Roads', 1998);

INSERT INTO Loan VALUES
    (301, 201, 71, '2027-01-02', '2027-01-20'),
    (302, 202, 72, '2027-01-10', NULL),
    (303, 201, 73, '2027-02-01', NULL);

INSERT INTO Reservation VALUES
    (401, 202, 74, '2027-02-02 09:30'),
    (402, 203, 71, '2027-02-02 10:15');

COMMIT;

-- Kontroll: ConferenceSession 3 rader, Book 4 rader, Appointment 4 rader.
SELECT COUNT(*) AS SessionCount FROM ConferenceSession;
SELECT COUNT(*) AS BookCount FROM Book;
SELECT COUNT(*) AS AppointmentCount FROM Appointment;