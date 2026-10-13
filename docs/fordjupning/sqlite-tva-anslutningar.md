---
layout: default
title: Två anslutningar i SQLite
parent: Verktygsfördjupning
nav_order: 1
permalink: /docs/fordjupning/sqlite-tva-anslutningar/
description: Ett valbart terminalexperiment med två separata sqlite3-processer och ett känt utgångsläge.
keywords: [SQLite, anslutning, lås, database is locked, fördjupning]
---

# Två anslutningar i SQLite

**Fördjupning.** I kapitel 18 prövas en transaktion i en enda anslutning, medan kapitel 19–20 använder scheman för att undersöka samtidighet. Här går vi vidare till två verkliga SQLite-anslutningar. De kan vara öppna samtidigt, men bara en kan skriva åt gången. Experimentet visar hur den begränsningen påverkar arbetet, och förutsätter inte att SQLite tillåter de felaktiga förloppen från schemana.

Du behöver terminalprogrammet `sqlite3` installerat. Ett grafiskt program med
två flikar ger inte nödvändigtvis två separata anslutningar. Här startar vi
därför två självständiga terminalprocesser. Installation och programfiler finns
på [SQLite Download](https://www.sqlite.org/download.html); använd det paket som
passar ditt operativsystem. Experimentet är valbart om verktyget inte finns.

## 1. Skapa underlaget i terminal A

Skapa en tom övningsmapp och öppna en terminal där. Starta klienten:

```console
sqlite3 concurrency-lab.db
```

Kör sedan följande inne i klienten:

```sql
CREATE TABLE IF NOT EXISTS Stock (
    StockID INTEGER PRIMARY KEY,
    Quantity INTEGER NOT NULL
);
DELETE FROM Stock;
INSERT INTO Stock VALUES (1, 100);
```

Visa vilken fil som faktiskt öppnades:

```text
.databases
```

Kopiera den absoluta sökväg som visas för `main`.

## 2. Öppna exakt samma fil i terminal B

Öppna en andra terminal, starta sqlite3 och öppna filen med sökvägen du nyss
kopierade. Ersätt platshållaren nedan med den verkliga sökvägen. Citationstecknen
behövs om sökvägen innehåller blanksteg.

```console
sqlite3
```

```text
.open "/absolut/sokvag/till/concurrency-lab.db"
.databases
.timeout 0
```

Kontrollera att main visar samma fil i båda terminalerna. Kör
`SELECT * FROM Stock;` i B; resultatet ska vara <code>StockID</code> 1 och <code>Quantity</code> 100.
Fel fil är en vanlig förklaring om anslutningarna tycks arbeta oberoende.

## 3. Låt A börja skriva

Kör bara detta i A och lämna transaktionen öppen:

```sql
BEGIN IMMEDIATE;
UPDATE Stock SET Quantity = Quantity - 10 WHERE StockID = 1;
```

<code>BEGIN IMMEDIATE</code> försöker få tillgång till SQLite-systemets skrivtransaktion
redan vid starten. Den exakta SQLite-mekanismen ska inte förväxlas med att vi
själva begär ett radlås enligt den abstrakta låsmodellen i kapitel 20.

## 4. Försök börja skriva i B

Kör endast denna sats i B:

```sql
BEGIN IMMEDIATE;
```

Med `.timeout 0` ska B omedelbart få ett fel om att databasen är låst eller
upptagen. Fortsätt **inte** med en <code>UPDATE</code> i B: <code>BEGIN</code> misslyckades, så B har inte
startat den avsedda transaktionen. Felet är experimentets förväntade observation.

## 5. Avsluta A och försök om B

Kör `COMMIT;` i A. Först därefter kör du följande i B:

```sql
BEGIN IMMEDIATE;
SELECT Quantity FROM Stock WHERE StockID = 1;
UPDATE Stock SET Quantity = Quantity - 20 WHERE StockID = 1;
COMMIT;
SELECT Quantity FROM Stock WHERE StockID = 1;
```

Första läsningen i B ger 90 och den sista ger 70. Om klienten bara visar sista
resultatet, kör satserna en i taget för att se båda. A:s uttag finns kvar när B
fortsätter. Det beror på att B började om efter A och utförde sin beräkning på
det aktuella saldot.

Avsluta båda klienterna med `.quit`. För att börja om, se först till att inga
transaktioner är öppna och upprepa steg 1. Om en transaktion lämnats öppen efter
ett eget försök avslutas den med <code>ROLLBACK</code> innan underlaget återställs.

**Läs vidare:** [SQLite CLI](https://www.sqlite.org/cli.html) och
[Isolation in SQLite](https://www.sqlite.org/isolation.html).