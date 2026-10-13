---
layout: default
track: grundspar
prerequisites: "Kapitel 11: skilj val av rader från val av kolumner."
focus: "Skriv och kontrollera en <code>SELECT</code>-fråga mot en tabell."
title: 12. Hämta data med SQL
parent: Del II – Frågor och förändring
nav_order: 12
permalink: /docs/del-2-fragor/hamta-data-med-sql/
description: Hur vi hämtar data med SQL-förfrågningar.
keywords:
  - SQL
  - SELECT
  - FROM
  - WHERE
  - ORDER BY
  - DISTINCT
---

# 12. Hämta data med SQL

{% include chapter_guide.html %}

Nordic Brew vill visa sitt sortiment med produktnamn och listpris. Vi vet redan hur frågan kan delas upp: välj produktrelationen, behåll relevanta rader och bestäm vilka attribut som ska visas. Nu ska vi uttrycka den avsikten i **SQL** och jämföra den körda frågans resultat med vår förutsägelse.

SQL är ett **deklarativt språk**. Det innebär att en fråga huvudsakligen beskriver vilket resultat som önskas, inte exakt hur databashanteringssystemet ska läsa filen eller i vilken ordning varje intern operation ska utföras. Systemet får själv välja en lämplig arbetsgång, så länge resultatet motsvarar frågan.

I detta kapitel arbetar vi med frågor mot en enda tabell. Sammanfogning av flera tabeller behandlas i nästa kapitel.

<aside class="practice-guide" markdown="1">
**Start i SQLite:** skapa en separat övningsdatabas och läs in [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}) enligt [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}). Underlaget ger 3 kunder, 4 produkter, 3 beställningar och 4 orderrader. Frågorna i avsnitt 12.1–12.10 läser bara data och kan köras i valfri ordning. Överföringsövningen anger en annan startfil. Har du ändrat underlaget tidigare återställer du det genom att läsa in rätt fil igen.
</aside>

## 12.1 Den grundläggande <code>SELECT</code>-frågan

En enkel SQL-fråga består av `SELECT` och `FROM`:

```sql
SELECT ProductName, ListPriceOre
FROM Product;
```

`FROM` anger vilken tabell frågan utgår från, medan `SELECT` anger vilka kolumner resultatet ska innehålla. Frågan ger följande resultat:

| <code>ProductName</code>          | <code>ListPriceOre</code> |
| -------------------- | -----------: |
| Brew coffee 500 g    |        12900 |
| Espresso blend 250 g |         8900 |
| Decaf coffee 250 g   |         9900 |
| Winter blend 500 g   |        14900 |

Semikolonet markerar slutet på SQL-satsen. Vissa verktyg kan köra en ensam sats utan semikolon, men tecknet behövs när flera satser förekommer i samma skript.

SQL-nyckelord är vanligen inte skiftlägeskänsliga, men de skrivs här med versaler för att skilja dem från tabell- och kolumnnamn.

{: .note }

> Exemplen i kapitlet använder SQL som fungerar i SQLite och som huvudsakligen tillhör språkets portabla kärna. Enskilda databashanteringssystem kan ändå skilja sig åt i bland annat textjämförelser, datumfunktioner och datatyper.

## 12.2 Välj uttryckliga kolumner

Asterisken i `SELECT *` betyder att samtliga kolumner ska visas:

```sql
SELECT *
FROM Product;
```

Det är praktiskt när innehållet i en liten tabell utforskas. I frågor som ska sparas, delas eller användas av ett program är det vanligtvis bättre att ange kolumnerna uttryckligen.

```sql
SELECT ProductID, ProductName
FROM Product;
```

Genom att skriva ut kolumnerna visar vi vilka uppgifter frågan ska hämta och minskar samtidigt risken att ett program påverkas om tabellen senare får ytterligare kolumner. Lägg också märke till att stjärnan i `SELECT *` betyder ”alla kolumner”. Att exemplet dessutom visar alla rader beror på att frågan saknar ett `WHERE`-villkor, inte på stjärnan.

## 12.3 <code>WHERE</code> väljer rader

För att begränsa vilka rader som ingår används `WHERE`. Börja med ett enda villkor:

```sql
SELECT ProductName, ListPriceOre
FROM Product
WHERE Active = 1;
```

Frågan ger tre produkter: 501, 502 och 503 om vi följer deras nummer i underlaget. Produkt 504 är inaktiv och kommer inte med. Om vi dessutom vill begränsa priset behöver båda villkoren gälla samtidigt:

```sql
SELECT ProductName, ListPriceOre
FROM Product
WHERE Active = 1
  AND ListPriceOre < 12000;
```

Resultatet innehåller två rader:

| <code>ProductName</code>          | <code>ListPriceOre</code> |
| -------------------- | -----------: |
| Espresso blend 250 g |         8900 |
| Decaf coffee 250 g   |         9900 |

Villkoret motsvarar urvalet från föregående kapitel. `AND` kräver att båda delvillkoren är uppfyllda. Med `OR` räcker det att minst ett av dem är uppfyllt, medan `NOT` negerar ett villkor.

Vanliga jämförelseoperatorer är:

| Operator      | Betydelse                                                    |
| ------------- | ------------------------------------------------------------ |
| `=`           | lika med                                                     |
| `<>`          | inte lika med                                                |
| `<` och `>`   | mindre än respektive större än                               |
| `<=` och `>=` | mindre än eller lika med respektive större än eller lika med |

Textvärden omges med enkla citattecken:

```sql
SELECT OrderID, OrderDate
FROM SalesOrder
WHERE Status = 'DRAFT';
```

Kolumnnamn ska däremot inte skrivas inom enkla citattecken. Uttrycket `'Status'` betecknar texten *<code>Status</code>*, inte kolumnen med detta namn.

### När uppgiften saknas: `NULL`

Ett villkor behöver också kunna hantera att ett värde saknas. Anta att följande fristående övningstabell, `Contact`, innehåller tre kontaktregistreringar. Mira har en adress, Samir har en tom text och Lo har ingen angiven uppgift:

| `CustomerID` | `Email` | Tolkning av registreringen |
| --- | --- | --- |
| 17 | mira@example.test | En registrerad adress |
| 24 | tom text, `''` | En text med längden noll |
| 31 | `NULL` | Ingen angiven uppgift |

`NULL` är ingen särskild adress och inte heller samma sak som den tomma texten. Om vi jämför en saknad uppgift med en viss adress vet vi inte om de är lika eller olika. Eftersom `WHERE` bara behåller rader där villkoret är sant följer raden med `NULL` inte med vid en vanlig jämförelse, vare sig med `=` eller `<>`.

För att undersöka själva frånvaron används i stället `IS NULL`:

```sql
SELECT CustomerID
FROM Contact
WHERE Email IS NULL;
```

Resultatet är kundnummer 31. Villkoret `Email = NULL` uttrycker inte samma kontroll och ska därför inte användas. Motsatsen, att ett värde finns, skrivs `Email IS NOT NULL`; det villkoret behåller här både 17 och 24. Den tomma texten är ju ett angivet textvärde, även om den inte fungerar som e-postadress.

**Pröva i SQLite:** [null-intro.sql]({{ '/assets/sql/null-intro.sql' | relative_url }}) skapar och återställer just `Contact` i en separat övningsdatabas. Den ändrar inte Nordic Brews kundtabell. Följ [körguiden]({{ '/docs/arbeta-praktiskt/' | relative_url }}) och förutsäg sedan vilka kundnummer följande villkor behåller:

1. `Email = ''`
2. `Email <> 'mira@example.test'`
3. `Email IS NOT NULL`

<details class="answer" markdown="1">
<summary>Jämför ditt resonemang med resultatet</summary>

Det första villkoret behåller bara 24, eftersom det söker efter en tom text. Även det andra behåller bara 24: Miras adress är lika med jämförelsevärdet, medan Los saknade adress inte kan bedömas som olik det. Det tredje behåller 17 och 24 eftersom båda har textvärden. Resultaten visar varför ”inte denna adress” och ”ingen adress angiven” är olika frågor.

Senare återkommer skillnaden när [kapitel 14]({{ '/docs/del-2-fragor/sammanfatta-och-gruppera-data/' | relative_url }}) jämför `COUNT(*)` med `COUNT(Email)`. [Kapitel 16]({{ '/docs/del-2-fragor/skapa-tabeller-och-integritetsvillkor/' | relative_url }}) visar i sin tur hur `NOT NULL` och `CHECK` kompletterar varandra när tabellen skapas.

</details>

## 12.4 Kombinera villkor med omsorg

Anta att Nordic Brew vill hitta beställningar som antingen är bekräftade eller skickade och som gjordes den 15 januari 2027. Frågan kan skrivas:

```sql
SELECT OrderID, OrderDate, Status
FROM SalesOrder
WHERE (Status = 'CONFIRMED' OR Status = 'SHIPPED')
  AND OrderDate = '2027-01-15';
```

Parenteserna gör det tydligt att statusvillkoren hör samman. Utan parenteser tillämpas SQL:s prioritetsregler, där `AND` normalt utvärderas före `OR`. En syntaktiskt giltig fråga kan därför ge fel resultat om villkoren grupperas på ett annat sätt än informationsbehovet kräver.

Flera likvärdiga jämförelser kan ibland uttryckas tydligare med `IN`:

```sql
SELECT OrderID, OrderDate, Status
FROM SalesOrder
WHERE Status IN ('CONFIRMED', 'SHIPPED')
  AND OrderDate = '2027-01-15';
```

`BETWEEN` kan användas för ett slutet intervall:

```sql
SELECT ProductName, ListPriceOre
FROM Product
WHERE ListPriceOre BETWEEN 9000 AND 13000;
```

Båda gränserna ingår. Frågan motsvarar därför `ListPriceOre >= 9000 AND ListPriceOre <= 13000`.

## 12.5 Beräknade kolumner

Resultatets kolumner kan även innehålla beräkningar. Anta att vi vill se hur listpriset skulle bli om varje produkt blev 100 öre dyrare:

```sql
SELECT ProductName, ListPriceOre + 100 AS ProposedPriceOre
FROM Product
ORDER BY ProductID;
```

Med `AS ProposedPriceOre` ger vi den beräknade resultatkolumnen ett namn, och det första föreslagna priset blir då 13000 öre. Det ursprungliga priset ligger ändå kvar i databasen, eftersom `SELECT` bara visar beräkningen. Om företaget väljer att faktiskt genomföra prishöjningen behövs en ändringssats, vilket vi återkommer till i kapitel 17.

**Fyll i:** Vad blir det föreslagna priset för produkten som kostar 8900 öre? Kontrollera gärna med frågan innan du går vidare.

<details class="answer" markdown="1">
<summary>Visa svar</summary>

Det blir 9000 öre. Resultatet beskriver ett förslag, medan det lagrade listpriset fortfarande är 8900.
</details>

## 12.6 Sortera med <code>ORDER BY</code>

Om resultatet ska visas i en bestämd ordning används `ORDER BY`:

```sql
SELECT ProductName, ListPriceOre
FROM Product
WHERE Active = 1
ORDER BY ListPriceOre ASC;
```

`ASC` betyder stigande ordning och är vanligtvis standard. `DESC` ger fallande ordning:

```sql
SELECT ProductName, ListPriceOre
FROM Product
WHERE Active = 1
ORDER BY ListPriceOre DESC;
```

Flera sorteringsnycklar kan anges:

```sql
SELECT OrderDate, OrderID, Status
FROM SalesOrder
ORDER BY OrderDate ASC, OrderID ASC;
```

Resultatet sorteras då först efter datum. Rader med samma datum sorteras därefter efter ordernummer.

Utan `ORDER BY` finns ingen garanterad ordning, även om ett verktyg råkar visa raderna på samma sätt vid flera körningar.

## 12.7 <code>DISTINCT</code> tar bort identiska resultatrader

Följande fråga visar kundnumret för varje beställning:

```sql
SELECT CustomerID
FROM SalesOrder
ORDER BY CustomerID;
```

Eftersom samma kund kan ha flera beställningar kan samma kundnummer förekomma flera gånger:

| <code>CustomerID</code> |
| ---------: |
|         17 |
|         17 |
|         24 |

Om informationsbehovet i stället är ”vilka kunder har minst en beställning?” kan identiska resultatvärden tas bort med `DISTINCT`:

```sql
SELECT DISTINCT CustomerID
FROM SalesOrder
ORDER BY CustomerID;
```

Resultatet innehåller då `17` och `24`.

`DISTINCT` ska inte användas för att dölja att en fråga oväntat har skapat dubbletter. Innan det läggs till behöver man avgöra om de upprepade raderna är en naturlig följd av informationens betydelse eller ett tecken på ett fel i frågan.

### När resultatet innehåller flera kolumner

<code>DISTINCT</code> jämför hela resultatrader. Om vi visar både `CustomerID` och `OrderID` är de två beställningarna för kund 17 fortfarande olika rader, eftersom ordernumren skiljer sig åt. Resultatet blir därför tre rader även om <code>DISTINCT</code> läggs till. Precis som för projektionen i kapitel 11 behöver vi fråga vad en rad ska representera innan vi väljer bort uppgifter.

## 12.8 En begreppslig läsordning

En `SELECT`-fråga skrivs vanligen i följande ordning:

```text
SELECT ...
FROM ...
WHERE ...
ORDER BY ...;
```

När frågans innebörd analyseras är det ofta enklare att tänka:

<figure class="figure" id="figur-12-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 12.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/16-select-logisk-lasordning.svg' | relative_url }}" alt="Förstå den enkla frågan genom FROM, WHERE, SELECT och ORDER BY: underlag, urval, resultatkolumner och sortering." width="1040" height="390" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 12.1.</strong> Detta är en begreppslig läsordning för den enkla frågan, inte en beskrivning av DBHS:ets fysiska exekveringsplan. <a href="{{ '/assets/images/16-select-logisk-lasordning.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Diagrammet beskriver frågans logik, inte nödvändigtvis databashanteringssystemets fysiska exekveringsordning. Systemet kan omorganisera arbetet för att genomföra frågan effektivare utan att resultatets betydelse förändras.

## 12.9 Stanna upp och förutsäg

Vad blir resultatet av följande fråga?

```sql
SELECT ProductName
FROM Product
WHERE Active = 1
  AND ListPriceOre >= 9900
ORDER BY ProductName;
```

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Villkoret behåller aktiva produkter vars listpris är minst 9 900 öre. Resultatet innehåller därför <code>Brew coffee 500 g</code> och <code>Decaf coffee 250 g</code>. <code>Winter blend 500 g</code> har ett tillräckligt högt pris men är inte aktiv, medan <code>Espresso blend 250 g</code> har ett för lågt pris.</p>
</details>

## 12.10 Vanlig missuppfattning: ett tomt resultat betyder att frågan är trasig

En korrekt fråga kan ge noll rader. Om ingen produkt uppfyller ett visst villkor är ett tomt resultat det korrekta svaret.

Skillnaden mellan ett tomt resultat och ett felmeddelande är därför betydelsefull. Ett felmeddelande innebär att databashanteringssystemet inte kunde genomföra satsen, exempelvis på grund av ett felstavat kolumnnamn. Ett tomt resultat innebär att satsen kunde genomföras men att ingen rad uppfyllde villkoret.

När ett resultat är oväntat tomt kan frågan felsökas genom att tillfälligt ta bort eller förenkla ett villkor i taget. På så sätt blir det möjligt att se vid vilket steg de förväntade raderna försvinner.

## 12.11 Överföringsövning: museets föremål

Skapa först en separat övningsdatabas och kör
[transfer-exercises.sql]({{ '/assets/sql/transfer-exercises.sql' | relative_url }}).
Filen skapar tabellen `Artifact` med fyra exempelrader. Följ
[körguiden]({{ '/docs/arbeta-praktiskt/' | relative_url }}) om du inte tidigare
har läst in en SQL-fil. Återställ underlaget genom att köra filen igen.

Ett museum använder tabellen:

```text
Artifact(
  ArtifactID,
  ArtifactName,
  Category,
  AcquisitionYear,
  OnDisplay
)
```

Skriv SQL-frågor som:

1. visar namn och kategori för samtliga föremål;
2. visar föremål som förvärvades efter år 2015;
3. visar utställda föremål i kategorin `TEXTILE`;
4. visar alla förekommande kategorier utan identiska dubbletter;
5. sorterar föremålen efter förvärvsår i fallande ordning och därefter efter namn;
6. ger `AcquisitionYear` aliaset `YearAcquired` i resultatet.

För varje fråga bör du även beskriva vad en resultatrad representerar och förutsäga vilka kolumner resultatet får.

<details class="answer" markdown="1">
<summary>Visa frågor, resultat och förklaringar</summary>

**1. Namn och kategori.** Vi behöver två kolumner och inget urval:

```sql
SELECT ArtifactName, Category
FROM Artifact;
```

Varje rad beskriver ett föremål. De fyra kombinationerna är `Silver bowl`/`METAL`, `Woven banner`/`TEXTILE`, `Clay vessel`/`CERAMIC` och `Wool cap`/`TEXTILE`. Utan `ORDER BY` ska vi inte förutsätta en viss ordning.

**2. Förvärv efter 2015.** Lägg till ett villkor och visa gärna årtalet så att resultatet kan kontrolleras:

```sql
SELECT ArtifactName, AcquisitionYear
FROM Artifact
WHERE AcquisitionYear > 2015;
```

Resultatet innehåller `Woven banner` från 2019 och `Clay vessel` från 2021. Här betyder ”efter” att själva gränsåret inte ingår.

**3. Utställda textilier.** Båda villkoren måste gälla för samma föremål:

```sql
SELECT ArtifactName
FROM Artifact
WHERE Category = 'TEXTILE'
  AND OnDisplay = 1;
```

Endast `Woven banner` uppfyller båda. `Wool cap` är också en textil men visas inte.

**4. Kategorier utan upprepning.** Nu representerar en resultatrad en kategori, inte ett enskilt föremål:

```sql
SELECT DISTINCT Category
FROM Artifact
ORDER BY Category;
```

Resultatet har en kolumn och tre rader: `CERAMIC`, `METAL` och `TEXTILE`. De två textilierna ger ett gemensamt kategorivärde.

**5. Nyast förvärv först.** Det andra sorteringsvillkoret avgör ordningen om flera föremål har samma årtal:

```sql
SELECT ArtifactName, AcquisitionYear
FROM Artifact
ORDER BY AcquisitionYear DESC, ArtifactName ASC;
```

Ordningen blir `Clay vessel` (2021), `Woven banner` (2019), `Silver bowl` (2012) och `Wool cap` (2008). Alla fyra årtal är olika i startdata; lägg därför märke till att just detta underlag inte visar vad som händer vid lika årtal.

**6. Ett annat namn i resultatet.** Ett alias ändrar rubriken i resultatet, inte namnet på den lagrade kolumnen:

```sql
SELECT ArtifactName, AcquisitionYear AS YearAcquired
FROM Artifact;
```

Resultatet innehåller alla fyra föremål, med kolumnrubrikerna `ArtifactName` och `YearAcquired`.
</details>

### Sök efter en saknad uppgift

Samma startfil som museiövningen innehåller också bibliotekstabellen `Loan`. Här anger `ReturnDate` när ett lån återlämnades, medan <code>NULL</code> betyder att något återlämningsdatum inte har registrerats. Använd den separata databasen med `transfer-exercises.sql` och pröva:

```sql
SELECT LoanID, BookID
FROM Loan
WHERE ReturnDate IS NULL
ORDER BY LoanID;
```

Resultatet innehåller lån 302 för bok 202 och lån 303 för bok 201, eftersom båda saknar registrerat återlämningsdatum. För att hitta dem används `IS NULL`: en vanlig jämförelse som `ReturnDate = NULL` blir inte sann, och `WHERE` behåller bara rader där villkoret är sant.

Om frågan i stället gäller lån som *har* ett registrerat återlämningsdatum använder vi `IS NOT NULL`. Då blir lån 301 kvar. Skillnaden mellan frågorna följer alltså av vilken registrering som finns, inte av att <code>NULL</code> skulle vara ett särskilt datumvärde.

**Stanna upp:** Bevisar resultatet att böckerna fysiskt är kvar hos låntagarna?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

Frågan visar lån som saknar registrerat återlämningsdatum. Det motsvarar pågående lån enligt vår definition, men en redan återlämnad bok kan ha missats i registreringen. SQL-resultatet behöver tolkas utifrån både definitionen och kvaliteten på uppgifterna.
</details>

## Kontrollfrågor

1. Vad anger `SELECT`, `FROM` och `WHERE`?
2. Varför är en uttrycklig kolumnlista ofta bättre än `SELECT *`?
3. Vad händer om parenteserna tas bort ur ett sammansatt villkor?
4. Varför behövs `ORDER BY` även om resultatet redan verkar vara sorterat?
5. När är `DISTINCT` motiverat, och när kan det dölja ett problem?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. `FROM` anger vilket tabellunderlag frågan använder, `WHERE` väljer vilka av dess rader som uppfyller villkoret och `SELECT` anger resultatets kolumner eller uttryck. Om vi vill visa namn på aktiva produkter hämtar vi alltså från `Product`, begränsar med `Active = 1` och väljer `ProductName`. Läs delarna tillsammans som en beskrivning av resultatet.

2. En uttrycklig lista visar vilka uppgifter resultatet ska innehålla. Med `SELECT ProductName, ListPriceOre` förstår vi exempelvis avsikten utan att känna till alla kolumner i `Product`. `SELECT *` hämtar däremot alla kolumner, så en senare utvidgning av tabellen ändrar också resultatets innehåll. Stjärnan kan vara praktisk vid utforskning, men en bestämd rapport gynnas ofta av tydliga kolumnval.

3. Utan parenteser följer uttrycket SQL:s prioriteringsregler, där `AND` binder starkare än `OR`. Villkoret `(A OR B) AND C` kräver C även när A gäller, medan `A OR B AND C` kan godta A oberoende av C. Ett datumvillkor kan därför råka gälla bara den ena orderstatusen om parenteserna tas bort. Resultatet behöver inte alltid ändras i just exempeldata, men frågans betydelse kan göra det.

4. Den ordning som råkar visas utan `ORDER BY` är ingen garanti för nästa körning. En annan åtkomstväg eller ett förändrat innehåll kan ge en annan ordning utan att frågan är fel. Om vi vill ha äldsta beställningen först måste det därför uttryckas, och ett ytterligare sorteringsvillkor kan behövas för att bestämma ordningen mellan lika datum.

5. `DISTINCT` är motiverat när informationsbehovet gäller olika resultatkombinationer, exempelvis vilka kundnummer som förekommer bland beställningarna. Om samma kund har två order kan numret då visas en gång. Däremot bör oväntade upprepningar i en sammanfogning undersökas innan de tas bort, eftersom de kan avslöja ett felaktigt villkor som `DISTINCT` bara döljer.

</details>

## Sammanfattning

När vi skriver en enkel SQL-fråga börjar vi med att bestämma vilket underlag som behövs. `FROM` anger tabellen, `WHERE` begränsar vilka rader som ska vara med och `SELECT` formar resultatets kolumner. Behöver vi varje resultatkombination endast en gång lägger vi till `DISTINCT`, medan `ORDER BY` bestämmer hur raderna presenteras. Dessa val behöver följa av informationsbehovet: att frågan går att köra visar inte i sig att den besvarar rätt fråga.