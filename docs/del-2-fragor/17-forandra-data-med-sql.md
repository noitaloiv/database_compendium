---
layout: default
track: grundspar
prerequisites: "Kapitel 12 och 16: <code>WHERE</code> och integritetsvillkor."
focus: "Kontrollera vilka rader <code>INSERT</code>, <code>UPDATE</code> och <code>DELETE</code> påverkar."
title: 17. Förändra data med SQL
parent: Del II – Frågor och förändring
nav_order: 17
permalink: /docs/del-2-fragor/forandra-data-med-sql/
description: Hur rader läggs till, ändras och tas bort med INSERT, UPDATE och DELETE utan att förlora kontrollen över resultatet.
keywords:
  - SQL
  - DML
  - INSERT
  - UPDATE
  - DELETE
  - integritetsvillkor
  - SQLite
---

# 17. Förändra data med SQL

{% include chapter_guide.html %}

En databas som enbart kunde besvara frågor skulle snart beskriva en värld som
inte längre finns. Nya kunder registreras, orderstatusar ändras och ibland måste
felaktiga eller inaktuella rader tas bort. SQL innehåller därför satser som
förändrar relationernas innehåll: `INSERT`, `UPDATE` och `DELETE`.

Gemensamt för satserna är att de kan påverka mer än den rad som råkar synas i
ett användargränssnitt. Ett felaktigt `WHERE`-villkor kan ändra hundratals rader,
medan en utelämnad kolumnlista kan göra en `INSERT` svår att tolka när schemat
senare ändras. Säker datamanipulation handlar således lika mycket om att
avgränsa och kontrollera förändringen som om att känna till syntaxen.

<aside class="practice-guide" markdown="1">
**Start:** följ [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}) och ladda `nordicbrew-minimal.sql` i en övningsdatabas. Avsnitt 17.1–17.7 är separata exempel: återställ med filen inför varje nytt avsnitt, eftersom en tidigare ändring annars påverkar nästa resultat. Kör satserna i ordning inom avsnittet. Museiövningen i avsnitt 17.8 använder en egen databas och startkod.
</aside>

## 17.1 Förbered en återställningsbar övningsdatabas

Exemplen ska köras mot en egen kopia av Nordic Brew. Följ först
[guiden till att köra SQL]({{ '/docs/arbeta-praktiskt/' | relative_url }}) och
läs in [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}).
Skriptets kontrollfråga ska visa tre kunder, fyra produkter, tre beställningar
och fyra orderrader.

När du vill börja om kör du installationsskriptet igen. Det tar bort tabellerna
i övningsdatabasen och återställer samma exempeldata, vilket gör att följande
resultat går att förutsäga och upprepa.

## 17.2 <code>INSERT</code> skapar nya rader

Ponera att kunden Noor Ali registrerar sig hos Nordic Brew. En ny kundrad kan
läggas till genom att kolumnerna först anges inom parentes och deras värden
sedan skrivs i motsvarande ordning:

```sql
INSERT INTO Customer (
    CustomerID,
    CustomerName,
    Email
)
VALUES (
    38,
    'Noor Ali',
    'noor@example.test'
);
```

Kolumnlistan låter oss läsa ihop varje värde med dess avsedda betydelse: 38 är kundnumret, Noor Ali är namnet och den sista texten är e-postadressen. Vi behöver därför inte känna till ordningen på alla kolumner i tabellens definition för att förstå insättningen. Om tabellen senare får en ytterligare kolumn fortsätter den skrivna listan också att ange var just dessa tre värden hör hemma. Efter körningen kontrollerar vi att rätt kundrad skapades genom att söka på samma identifierare:

```sql
SELECT CustomerID, CustomerName, Email
FROM Customer
WHERE CustomerID = 38;
```

Flera rader kan läggas till i samma sats:

```sql
INSERT INTO Product (
    ProductID,
    ProductName,
    ListPriceOre,
    Active
)
VALUES
    (505, 'House blend 500 g', 11900, 1),
    (506, 'Filter papers 100-pack', 4900, 1);
```

I en produktionsdatabas skapas identifierare ofta av databasen eller ett
applikationsflöde. Här anges numren uttryckligen för att varje övningskörning ska
få samma resultat.

## 17.3 Integritetsvillkoren prövar den nya raden

`INSERT` får inte kringgå reglerna från kapitel 16. Om vi försöker registrera en
andra kund med Mira Eks e-postadress bryter raden mot `UNIQUE (Email)`. Mira finns redan i startdata, så exemplet fungerar även efter en återställning:

```sql
INSERT INTO Customer (
    CustomerID,
    CustomerName,
    Email
)
VALUES (
    39,
    'Nora Ali',
    'mira@example.test'
);
```

SQLite ska avvisa satsen eftersom e-postadressen redan används och därmed bryter mot unikhetsvillkoret. I detta försök är felmeddelandet ett förväntat resultat: det visar att databasen tillämpar den regel vi avsiktligt prövar. Kontrollera också att kund 39 faktiskt saknas efter det avvisade försöket:

```sql
SELECT *
FROM Customer
WHERE CustomerID = 39;
```

På motsvarande sätt avvisas en order med ett okänt `CustomerID`, förutsatt att
kontrollen av främmande nycklar är aktiverad. Ett program bör fånga sådana fel
och förklara dem för användaren, men bör inte tysta dem och låtsas att raden
sparades.

## 17.4 <code>UPDATE</code> ändrar de rader som villkoret träffar

Anta att den bekräftade ordern 1042 nu har skickats. Börja med att kontrollera
dess nuvarande status:

```sql
SELECT OrderID, Status
FROM SalesOrder
WHERE OrderID = 1042;
```

Frågan visar en rad med status `CONFIRMED`. Vi använder samma avgränsning
för förändringen, och anger det nya värdet efter `SET`:

```sql
UPDATE SalesOrder
SET Status = 'SHIPPED'
WHERE OrderID = 1042;
```

Efter `UPDATE` körs kontrollfrågan igen. Statusen ska då ha ändrats från
`CONFIRMED` till `SHIPPED`, medan övriga beställningar ska vara oförändrade.

`UPDATE` kan även beräkna ett nytt värde från det gamla. Anta att listpriset ska höjas med 100 öre för aktiva produkter. Kontrollera först hur många produkter som berörs:

```sql
SELECT COUNT(*) AS RowsToChange
FROM Product
WHERE Active = 1;
```

Med det ursprungliga underlaget ska villkoret träffa tre produkter. När det stämmer genomför vi förändringen:

```sql
UPDATE Product
SET ListPriceOre = ListPriceOre + 100
WHERE Active = 1;
```

Efter höjningen har produkt 501, 502 och 503 priserna 13000, 9000 respektive 10000 öre, medan den inaktiva produkten 504 ligger kvar på 14900 öre. För att kontrollera uppdateringen behöver vi granska båda grupperna: ändringen ska ha genomförts för de aktiva produkterna och samtidigt lämnat den inaktiva produkten orörd.

{: .mistake }
> Utan `WHERE` gäller en `UPDATE` samtliga rader i tabellen. Det kan vara
> avsiktligt, men ska aldrig vara en överraskning.

## 17.5 <code>DELETE</code> tar bort hela rader

Om en utkastorder skapades av misstag och ännu saknar orderrader kan den tas
bort med:

```sql
DELETE FROM SalesOrder
WHERE OrderID = 1044
  AND Status = 'DRAFT';
```

Det extra statusvillkoret gör avsikten tydligare: ordern ska bara försvinna om
den fortfarande är ett utkast. Samma villkor bör först köras som en `SELECT`,
och efteråt ska kontrollfrågan ge noll rader.

Om vi i stället försöker ta bort kund 17 påverkas hänvisningarna från Miras beställningar. Deras kundnummer skulle då peka på en kund som inte längre finns, vilket schemats främmande nyckel förbjuder när kontrollen är aktiverad. Följande sats ska därför avvisas trots att både syntaxen och kundnumret är korrekta:

```sql
DELETE FROM Customer
WHERE CustomerID = 17;
```

Att en rad inte längre ska visas i den normala verksamheten betyder heller inte
alltid att den bör raderas. Produkter kan i stället inaktiveras med
`Active = 0`, så att historiska orderrader fortfarande kan förstås. Valet mellan
radering och statusändring är därmed ett informations- och verksamhetsbeslut,
inte en fråga som syntaxen ensam kan besvara.

## 17.6 Kontrollera före, under och efter

Prisändringen i avsnitt 17.4 visar varför vi behöver granska både de rader som ska förändras och de som ska lämnas orörda:

<figure class="figure" id="figur-17-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 17.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/35-uppdatera-ratt-rader.svg' | relative_url }}" alt="Produkt 501, 502 och 503 är aktiva och får priserna 13000, 9000 och 10000. Produkt 504 är inaktiv och behåller 14900." width="900" height="425" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 17.1.</strong> Prisändringen från avsnitt 17.4 träffar tre rader. Både de ändrade priserna och den oförändrade raden behöver kontrolleras. <a href="{{ '/assets/images/35-uppdatera-ratt-rader.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

En arbetsrutin för motsvarande förändringar är:

1. Formulera vilken verklig förändring som ska registreras.
2. Kör en `SELECT` med det planerade `WHERE`-villkoret.
3. Kontrollera radantal och identifierare innan `UPDATE` eller `DELETE` körs.
4. Kör en ny `SELECT` och jämför resultatet med förutsägelsen.

Genom att granska raderna före och efter ändringen kan vi upptäcka många missförstånd, men granskningen hindrar inte alla fel. Underlaget kan till exempel ändras av någon annan mellan vår kontroll och vår uppdatering. I de följande kapitlen kompletterar vi därför arbetssättet med transaktioner och samordning, så att sammanhörande ändringar kan hanteras som en enhet även när flera arbetar med databasen.

## 17.7 Stanna upp och förutsäg

Utgå från den nyss återställda Nordic Brew-databasen. Hur många rader förändras
av följande sats, och vilka är de?

```sql
UPDATE Product
SET Active = 0
WHERE ListPriceOre >= 12000
  AND Active = 1;
```

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Endast produkt 501 förändras. Dess pris är 12&nbsp;900 öre och den är aktiv. Produkt 504 har också ett tillräckligt högt pris men är redan inaktiv, medan produkterna 502 och 503 kostar mindre än 12&nbsp;000 öre.</p>
</details>

## 17.8 Praktisk övning: ett museimagasin

Skapa en tom övningsdatabas och kör följande startkod:

```sql
DROP TABLE IF EXISTS Artifact;
CREATE TABLE Artifact (
    ArtifactID INTEGER PRIMARY KEY,
    ArtifactName TEXT NOT NULL,
    StorageRoom TEXT NOT NULL,
    OnDisplay INTEGER NOT NULL CHECK (OnDisplay IN (0, 1))
);

INSERT INTO Artifact VALUES
    (1, 'Silver bowl', 'A1', 0),
    (2, 'Woven banner', 'B2', 1),
    (3, 'Clay vessel', 'A1', 0);
```

Genomför därefter följande förändringar och kontrollera resultatet med en
`SELECT` efter varje steg:

1. lägg till föremålet `Glass bead`, med `ArtifactID = 4`, i rum `C3`; det är inte utställt;
2. flytta alla föremål i rum `A1` till rum `A2`;
3. ta bort föremål 4, men endast om det inte visas;
4. försök lägga till ett andra föremål med `ArtifactID = 2` och förklara felet;
5. återställ databasen genom att köra startkoden på nytt och kontrollera att den
   åter innehåller tre rader.

<details class="answer" markdown="1">
  <summary>Visa en möjlig lösning</summary>

```sql
INSERT INTO Artifact (ArtifactID, ArtifactName, StorageRoom, OnDisplay)
VALUES (4, 'Glass bead', 'C3', 0);

UPDATE Artifact
SET StorageRoom = 'A2'
WHERE StorageRoom = 'A1';

DELETE FROM Artifact
WHERE ArtifactID = 4
  AND OnDisplay = 0;
```

När de tre förändringarna har genomförts ska föremål 1, 2 och 3 finnas kvar. Frågan `SELECT * FROM Artifact ORDER BY ArtifactID;` ska då visa föremål 1 och 3 i `A2`, medan föremål 2 fortfarande finns i `B2`. Kontrollera alltså både vilka rader som återstår och vilken plats varje kvarvarande föremål har fått.

Kör nästa sats separat. **Här är ett felmeddelande det förväntade resultatet:**

```sql
INSERT INTO Artifact VALUES (2, 'Duplicate', 'C3', 0);
```

Den sista satsen ska avvisas eftersom primärnyckeln 2 redan används. Kör sedan startkoden igen: den återställer tre rader, där föremål 1 och 3 åter finns i `A1`.
</details>

## Kontrollfrågor

1. Varför bör en `INSERT` normalt ange en uttrycklig kolumnlista?
2. Hur kan samma `WHERE`-villkor användas för att kontrollera en `UPDATE`?
3. Vad händer om `WHERE` utelämnas från `UPDATE` eller `DELETE`?
4. Varför kan en korrekt förändringssats ändå avvisas av databasen?
5. När kan en statusändring vara lämpligare än `DELETE`?
6. Varför ska praktiska förändringsövningar göras i en återställningsbar kopia?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Kolumnlistan visar vilket värde som hör till vilket attribut. Om vi anger `CustomerID`, `CustomerName` och `Email` i den ordningen går insättningen att förstå utan att känna till ordningen på alla tabellens kolumner. Den uttryckliga kopplingen gör också avsikten mindre känslig för att tabellen senare får fler kolumner.

2. Kör först en `SELECT` med samma villkor och granska både radantalet och vilka identifierare som träffas. Vid uppdateringen av order 1042 ska förhandsgranskningen exempelvis visa just den ordern. Efteråt körs en ny kontroll för att se att rätt värde har ändrats och att sådant som skulle lämnas orört fortfarande stämmer. Kontrollen ersätter inte samtidighetsskydd när flera arbetar samtidigt.

3. Utan `WHERE` omfattas alla tabellens rader av satsen. En `UPDATE` kan då sätta samma status på varje beställning, medan `DELETE` tar bort alla rader men lämnar tabellens struktur kvar. Detta kan vara avsiktligt, men om bara en viss rad skulle beröras saknas den avgränsning som behövs.

4. Korrekt syntax betyder att systemet kan tolka satsen, men den föreslagna förändringen måste också följa tabellens regler. En insättning kan exempelvis ange ett redan använt primärnyckelvärde eller en e-postadress som måste vara unik. Då är avvisningen ett skydd för integriteten, inte ett tecken på att SQL-syntaxen är fel.

5. En statusändring är ofta lämplig när företeelsen ska sluta användas i nya händelser men fortfarande behövs för att förstå historiken. En produkt kan exempelvis få `Active = 0` samtidigt som äldre orderrader fortsätter att hänvisa till den. Om raden raderades skulle den historiska kopplingen behöva hanteras på annat sätt.

6. En förändringssats kan påverka fler rader än väntat, och ett nytt försök kan få ett annat resultat om tidigare ändringar ligger kvar. Med en separat övningsdatabas och en känd startfil kan du återgå till samma utgångsläge och jämföra resultaten utan att riskera värdefulla uppgifter. Återställningen är därför en del av ett kontrollerbart experiment.

</details>

## Sammanfattning

<code>INSERT</code>, <code>UPDATE</code> och <code>DELETE</code> förändrar databasens innehåll och behöver därför avgränsas och kontrolleras. Börja med ett känt underlag, undersök vilka rader villkoret träffar och kontrollera resultatet efteråt. När flera ändringar hör till samma händelse behövs också en gemensam gräns för vad som ska lyckas tillsammans; det leder vidare till transaktioner.