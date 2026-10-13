---
layout: default
title: Kör SQL-exemplen
nav_order: 6
permalink: /docs/arbeta-praktiskt/
description: En stegvis guide till att skapa en övningsdatabas och köra kompendiets SQL-exempel i SQLite.
keywords:
  - SQLite
  - DBHS
  - DBMS
  - SQL-övning
  - DB Browser for SQLite
  - sqlite3
  - övningsdatabas
---

# Kör SQL-exemplen

Kompendiets webbsidor visar SQL men kör inte koden åt dig. När en uppgift ber
dig att skriva, pröva eller ändra SQL behöver du därför använda ett
databashanteringssystem. I exemplen nedan används SQLite, eftersom hela
övningsdatabasen kan ligga i en lokal fil och enkelt återställas.

Du behöver inte skapa tabellerna på fri hand innan du kan börja. De flesta
SQL-kapitel länkar till ett installationsskript som skapar rätt tabeller och
exempelrader. Uppgiften anger vilket skript du ska använda och om du ska börja
med en tom databas.

## Välj ett av två arbetssätt

SQLite är själva databashanteringssystemet. Ett program som DB Browser for
SQLite eller terminalprogrammet `sqlite3` är däremot en **klient** genom vilken
du skickar SQL till SQLite. Båda alternativen nedan använder alltså samma typ av
databas.

### Alternativ A: ett grafiskt SQLite-program

Om du saknar ett sådant program kan du installera [DB Browser for SQLite](https://sqlitebrowser.org/dl/). Det är klienten, medan SQLite är databashanteringssystemet. Nedan används dess namn på funktionerna som exempel.

1. Hämta SQL-filen som uppgiften länkar till.
2. Skapa en ny databasfil i programmet, exempelvis `nordicbrew-lab.db`.
3. Öppna programmets SQL-editor och läs in den hämtade `.sql`-filen.
4. Kör hela skriptet. De avslutande kontrollfrågorna ska visa de radantal som
   anges i filen.
5. Skriv och kör din egen SQL i editorn. Visa gärna resultatet i tabellform så
   att du kan jämföra det med din förutsägelse.

Menyernas namn varierar mellan programversioner, men funktionerna brukar heta
något i stil med *New database*, *Execute SQL* och *Open SQL file*. Om du
använder DB Browser for SQLite behöver du dessutom välja *Write Changes* när
en ändring ska sparas utanför en uttrycklig SQL-transaktion.

### Alternativ B: terminalklienten sqlite3

Öppna en terminal i den katalog där du har sparat SQL-filen och starta en ny
databas:

```console
sqlite3 nordicbrew-lab.db
```

Läs därefter in installationsskriptet och gör resultaten mer lättlästa:

```text
.read nordicbrew-minimal.sql
.headers on
.mode box
```

Rader som börjar med en punkt är kommandon till klienten och ska därför inte
avslutas med semikolon. Vanlig SQL, såsom `SELECT * FROM Product;`, ska däremot
avslutas med semikolon.

## En arbetscykel som går att kontrollera

Arbeta med en separat övningsfil och följ samma cykel för varje uppgift:

1. återställ databasen genom att köra det angivna installationsskriptet;
2. skriv ned vad du tror att satsen kommer att göra;
3. kör först en `SELECT` med samma villkor om uppgiften ändrar eller tar bort
   rader;
4. kör satsen och kontrollera resultatet med den kontrollfråga som anges;
5. jämför med facit eller lösningsprinciperna först efter ditt eget försök.

{: .important }
> Arbeta aldrig mot en databas som innehåller värdefulla data. Skripten i
> kompendiet tar avsiktligt bort och återskapar tabeller för att ge ett känt
> utgångsläge.

## När ett felmeddelande är en del av uppgiften

Vissa övningar försöker medvetet bryta mot en primärnyckel, en främmande nyckel
eller ett `CHECK`-villkor. Ett felmeddelande är då det förväntade resultatet och
visar att databasen har skyddat regeln. Läs först vilket villkor som nämns i
meddelandet och kontrollera därefter att den otillåtna raden inte lagrades.

SQLite kontrollerar främmande nycklar per databasanslutning. Kör följande inställning när du öppnar anslutningen, innan någon transaktion har startats. Startfilerna gör detta åt dig vid inläsningen:

```sql
PRAGMA foreign_keys = ON;
```

## Transaktionsövningarna kräver inte två programfönster

Kapitel 18 använder en enda anslutning för att prova <code>COMMIT</code> och <code>ROLLBACK</code>.
Kapitel 19–20 använder scheman, lösningsförslag och en stegvis visning direkt på
webbsidan. Dessa kan genomföras utan en SQL-klient. Det finns även ett valbart
[terminalexperiment med två anslutningar]({{ '/docs/fordjupning/sqlite-tva-anslutningar/' | relative_url }}),
men det är inte en förutsättning för grundövningarna.

## Välj rätt startfil

| Kapitel eller uppgift | Fil | Förväntat startläge |
| --- | --- | --- |
| 12–15, 17 och valbar indexövning i 21 | [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}) | 3 kunder, 4 produkter, 3 beställningar, 4 orderrader |
| 12–15, andra verksamheter | [transfer-exercises.sql]({{ '/assets/sql/transfer-exercises.sql' | relative_url }}) | Bland annat 4 museiföremål, 3 programpunkter, 6 vårdbokningar och 4 böcker |
| 16.12, eget tabellbygge | [rental-starter.sql]({{ '/assets/sql/rental-starter.sql' | relative_url }}) | <code>Equipment</code> utan rader; <code>Rental</code> bygger du själv |
| 16.12, färdig lösning | [rental-solution.sql]({{ '/assets/sql/rental-solution.sql' | relative_url }}) | En utrustning och en uthyrning |
| 16.13, utrustningskontroller | Eget bygge i tom databas; [inspection-solution.sql]({{ '/assets/sql/inspection-solution.sql' | relative_url }}) för återställning till lösningen | 1 utrustning, 1 kontrollant och 1 kontroll i lösningsfilen |
| 17.8, museimagasin | Startkod finns direkt i kapitlet | En separat databas med 3 föremål |
| 18.1–18.5, Nordic Brews lager | [nordicbrew-transactions.sql]({{ '/assets/sql/nordicbrew-transactions.sql' | relative_url }}) | 2 lagerposter med 100 respektive 60 förpackningar; inga leveranser |
| 18.6, kontoöverföring | [transaction-basics.sql]({{ '/assets/sql/transaction-basics.sql' | relative_url }}) | Kontosaldon 1000 och 500 |
| 26, museifallet | [museum-case.sql]({{ '/assets/sql/museum-case.sql' | relative_url }}) | 2 guider, 3 besökare, 3 visningar och 3 bokningar |

Använd olika databasfiler för dessa underlag. Två startfiler kan använda samma
tabellnamn med olika kolumner, exempelvis <code>Artifact</code>. Att blanda dem gör därför
inte övningen mer fullständig utan ändrar dess förutsättningar.