---
layout: default
track: grundspar
prerequisites: "Kapitel 12–13: filtrering och enkla sammanfogningar."
focus: "Räkna och summera först hela underlaget, sedan en grupp i taget."
title: 14. Sammanfatta och gruppera data
parent: Del II – Frågor och förändring
nav_order: 14
permalink: /docs/del-2-fragor/sammanfatta-och-gruppera-data/
description: Räkna först rader för hand och följ hur COUNT, SUM, GROUP BY och HAVING sammanfattar dem.
keywords: [SQL, COUNT, SUM, AVG, GROUP BY, HAVING, aggregatfunktion]
---

# 14. Sammanfatta och gruppera data

{% include chapter_guide.html %}

En lista med orderrader visar vad som har beställts. När Nordic Brew vill undersöka beställningsvolymen kan en annan fråga vara mer användbar: hur många förpackningar av varje produkt har beställts sammanlagt? Då behöver flera rader bidra till ett gemensamt svar.

Vi börjar med att räkna utan SQL. Därefter låter vi databashanteringssystemet göra samma arbete, först för hela tabellen och sedan för en grupp i taget. Den vägen gör det lättare att upptäcka om en korrekt skriven fråga ändå räknar fel sak.

<aside class="practice-guide" markdown="1">
**Start i SQLite:** återställ [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}). Frågorna förändrar inga data. Om du behöver hjälp att ladda filen, följ [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}).
</aside>

## 14.1 Fyra rader men sju enheter

`OrderLine` innehåller följande uppgifter. Priserna är uttryckta i öre och gäller det pris som avtalades för just beställningen.

| <code>OrderID</code> | <code>ProductID</code> | <code>Quantity</code> | <code>AgreedUnitPriceOre</code> |
| ---: | ---: | ---: | ---: |
| 1042 | 501 | 2 | 12900 |
| 1042 | 502 | 1 | 8900 |
| 1043 | 501 | 1 | 11900 |
| 1043 | 503 | 3 | 9900 |

När vi räknar raderna i tabellen får vi fyra, eftersom varje rad beskriver en produkt på en beställning. För att veta hur många kaffeförpackningar som ska packas måste vi däremot läsa antalet på varje rad och lägga ihop värdena: 2 + 1 + 1 + 3 = 7. Samma tabell ger alltså två olika, korrekta svar beroende på om frågan gäller antalet orderrader eller antalet beställda förpackningar.

```sql
SELECT COUNT(*) AS LineCount, SUM(Quantity) AS TotalQuantity
FROM OrderLine;
```

| <code>LineCount</code> | <code>TotalQuantity</code> |
| ---: | ---: |
| 4 | 7 |

`COUNT(*)` räknar raderna i underlaget, medan `SUM(Quantity)` adderar deras kvantiteter. De är exempel på **aggregatfunktioner**, alltså funktioner som sammanfattar flera rader till ett värde. Utan `GROUP BY` behandlar frågan här hela underlaget som en grupp och lämnar en enda resultatrad.

## 14.2 Samma beräkning för varje produkt

Nordic Brew behöver också kunna skilja mellan produkterna när kaffet ska packas. Vi samlar därför de två orderrader som gäller produkt 501 och summerar deras kvantiteter: två förpackningar på order 1042 och en på order 1043 ger sammanlagt tre. Därefter gör vi samma sak för produkt 502 och 503. Vi använder alltså samma summering som tidigare, men låter den arbeta med en produktgrupp i taget.

<figure class="figure" id="figur-14-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 14.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/33-gruppera-rader.svg' | relative_url }}" alt="Radernas ProductID leder till tre grupper. De två raderna för 501 summeras till tre förpackningar. Grupperna för 502 och 503 innehåller en rad vardera." width="900" height="500" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 14.1.</strong> Varje produktgrupp ger en resultatrad. Att räkna gruppens rader och att summera dess kvantiteter besvarar olika frågor. <a href="{{ '/assets/images/33-gruppera-rader.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

```sql
SELECT ProductID, SUM(Quantity) AS TotalQuantity
FROM OrderLine
GROUP BY ProductID
ORDER BY ProductID;
```

| <code>ProductID</code> | <code>TotalQuantity</code> |
| ---: | ---: |
| 501 | 3 |
| 502 | 1 |
| 503 | 3 |

Produkt 504 finns inte med. Frågan arbetar bara med `OrderLine`, där produkten inte förekommer, och skapar därför ingen grupp för den. För att även få med produkter utan orderrader behöver vi utgå från produkterna och bevara omatchade rader. Avsnitt 14.6 visar samma princip med kunder som saknar beställningar.

**Fyll i:** Byt `SUM(Quantity)` mot `COUNT(*)`. Vad blir de tre värdena? Kontrollera mot figurens högar innan du kör.

<details class="answer" markdown="1">
<summary>Visa svar</summary>

Värdena blir 2, 1 och 1. De räknar orderrader inom varje produktgrupp, inte beställda enheter.
</details>

## 14.3 Vilka kolumner kan visas för en grupp?

Produktgruppen 501 innehåller två olika ordernummer. Om vi lägger till `OrderID` i `SELECT` utan att förändra grupperingen finns därför inget enda ordernummer som representerar hela gruppen.

Som arbetsregel låter vi varje uttryck i `SELECT` antingen ange en grupperingskolumn eller sammanfatta gruppen med en aggregatfunktion. Flera system avvisar frågor som bryter mot den principen, medan SQLite i vissa fall tillåter ett värde från en enskild rad. Att frågan går att köra är alltså inte tillräckligt för att resultatet ska vara väldefinierat enligt vår avsikt.

Vill vi visa produktens namn kan vi först sammanfoga med `Product` och sedan gruppera på produktnummer och namn:

```sql
SELECT p.ProductID, p.ProductName, SUM(ol.Quantity) AS TotalQuantity
FROM Product AS p
JOIN OrderLine AS ol ON ol.ProductID = p.ProductID
GROUP BY p.ProductID, p.ProductName
ORDER BY p.ProductID;
```

Kvantiteterna blir fortfarande 3, 1 och 3, eftersom sammanfogningen lägger till ett produktnamn på varje orderrad utan att skapa extra matchningar. Alla rader med produktnummer 501 får samma namn och hamnar därför fortfarande tillsammans. När både nummer och namn ingår i grupperingen kan vi också visa namnet som en beskrivning av gruppen, samtidigt som numret håller isär produkter som eventuellt har samma namn.

## 14.4 <code>WHERE</code> väljer rader, <code>HAVING</code> väljer grupper

Anta att vi bara vill sammanfatta order 1042. Då begränsar `WHERE` underlaget innan kvantiteterna läggs ihop:

```sql
SELECT ProductID, SUM(Quantity) AS TotalQuantity
FROM OrderLine
WHERE OrderID = 1042
GROUP BY ProductID
ORDER BY ProductID;
```

Vi behåller först de två raderna för order 1042 och får sedan grupperna 501 med summan 2 samt 502 med summan 1. Om frågan i stället är vilka produkter som totalt har beställts i minst tre enheter behöver vi vänta tills summorna finns. Ett villkor på gruppernas resultat skrivs med `HAVING`:

```sql
SELECT ProductID, SUM(Quantity) AS TotalQuantity
FROM OrderLine
GROUP BY ProductID
HAVING SUM(Quantity) >= 3
ORDER BY ProductID;
```

Nu bidrar alla fyra orderrader till grupperingen. Därefter tas grupp 502 bort eftersom dess summa är 1, medan 501 och 503 blir kvar med summan 3 vardera.

| Steg | Vad händer i <code>HAVING</code>-exemplet? |
| --- | --- |
| Underlag | Fyra orderrader hämtas. |
| Gruppering | Raderna samlas på produktnummer. |
| Beräkning | Summorna blir 3, 1 och 3. |
| Gruppvillkor | Endast summor som är minst 3 behålls. |

Den här ordningen beskriver frågans logik. DBHS kan utföra arbetet på andra sätt internt så länge det ger rätt resultat.

## 14.5 Fler sammanfattningar, samma idé

`MIN` och `MAX` hittar det minsta respektive största värdet. `AVG` beräknar ett aritmetiskt medelvärde. På produkternas fyra listpriser kan de användas så här:

```sql
SELECT MIN(ListPriceOre) AS LowestPriceOre,
       MAX(ListPriceOre) AS HighestPriceOre,
       AVG(ListPriceOre) AS AveragePriceOre
FROM Product;
```

Resultatet blir 8900, 14900 och 11650. Varje produkt bidrar med ett pris, oberoende av hur många enheter som har sålts. Formuleringen ”genomsnittligt pris” behöver därför alltid förtydligas: här menar vi genomsnittet av produkternas listpriser.

En orders värde kräver i stället att varje rads kvantitet multipliceras med dess avtalade styckpris innan beloppen summeras:

```sql
SELECT OrderID, SUM(Quantity * AgreedUnitPriceOre) AS OrderTotalOre
FROM OrderLine
GROUP BY OrderID
ORDER BY OrderID;
```

För order 1042 behöver varje avtalat styckepris först multipliceras med antalet förpackningar på orderraden. Beräkningen blir då 2 × 12900 + 1 × 8900 = 34700 öre, vilket är samma belopp som vi tolkade i kapitel 1. På motsvarande sätt ger order 1043 beloppet 1 × 11900 + 3 × 9900 = 41600 öre. Om vi i stället bara summerade `AgreedUnitPriceOre` skulle antalet förpackningar försvinna ur beräkningen, så kontrollera gärna beloppen för hand innan du kör frågan.

## 14.6 Att räkna noll efter <code>LEFT JOIN</code>

För att räkna varje kunds beställningar, även när antalet är noll, behöver vi utgå från alla kunder:

```sql
SELECT c.CustomerID, c.CustomerName, COUNT(so.OrderID) AS OrderCount
FROM Customer AS c
LEFT JOIN SalesOrder AS so ON so.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CustomerName
ORDER BY c.CustomerID;
```

Resultatet blir Mira: 2, Samir: 1 och Lo: 0. För att förstå nollan följer vi Los rad genom de två stegen. Först bevarar `LEFT JOIN` kunden trots att någon beställning inte matchar, och fyller då beställningens kolumner med `NULL`. När gruppen sedan räknas tar `COUNT(so.OrderID)` bara med angivna ordernummer, så Los grupp ger noll. Om vi i stället använde `COUNT(*)` skulle den bevarade raden räknas som en rad och ge 1, trots att ingen beställning finns.

<details class="extension" markdown="1">
<summary>Fördjupning: en summa utan några värden</summary>

<code>SUM</code> och <code>AVG</code> bortser också från <code>NULL</code>, men de returnerar <code>NULL</code> om det inte finns något icke-<code>NULL</code>-värde att beräkna med. <code>COUNT</code> returnerar då 0. När en frånvarande summa verkligen ska betyda noll kan `COALESCE(SUM(...), 0)` användas för att ersätta <code>NULL</code>. Bestäm först vad frånvaron betyder; ett okänt belopp är inte automatiskt ett belopp på noll.
</details>


## Från rader till grupper: ett delvis löst exempel

Två bokningar gäller samma tillfälle. De har `Seats` = 2 respektive 1 och avtalat pris 10000 öre per plats. Första steget är att låta varje bokning bidra med sitt belopp: 20000 respektive 10000 öre. När raderna samlas till en grupp för tillfället ska vi bevara skillnaden mellan bokningar, platser och belopp.

Slutför beräkningen: ange antal bokningar, antal platser och sammanlagt belopp. Välj sedan vilken storhet `COUNT(*)`, `SUM(Seats)` respektive `SUM(Seats * AgreedPriceOre)` beskriver i just dessa matchande bokningsrader.

<details class="answer" markdown="1"><summary>Kontroll och motexempel</summary>

Resultatet är två bokningar, tre platser och 30000 öre. `COUNT(*)` räknar de två raderna, medan de två `SUM`-uttrycken räknar platser respektive belopp. `SUM(AgreedPriceOre)` skulle ge 20000 och missa att den första bokningen avser två platser. Om alla bokningar avsåg en plats skulle felet döljas av just den testdatan.
</details>

**Eget nytt försök:** byt den andra bokningens antal till fyra. Beskriv vilka av de tre resultaten som ändras innan du räknar. Kontroll: antalet bokningar är fortfarande två, men antalet platser blir sex och beloppet 60000 öre. Fortsätt sedan med en av vårdbokningsfrågorna och ange samma tre saker: radbetydelse, grupperingsenhet och beräkning.

## 14.7 Öva med vårdbokningar

**Start:** kör [transfer-exercises.sql]({{ '/assets/sql/transfer-exercises.sql' | relative_url }}) i en separat övningsdatabas. I `Appointment` finns sex bokningar med behandlingstiderna 30, 45, 30, 60, 40 och 20 minuter. De två första och de två sista är genomförda (`COMPLETED`), den tredje bokad och den fjärde avbokad. De genomförda bokningarna fördelas på tre behandlare, så att vi kan se vilka grupper som ett senare gruppvillkor tar bort.

1. Räkna först alla bokningar med <code>COUNT</code> och summera deras minuter. Förklara varför summan ännu inte är genomförd behandlingstid.
2. Begränsa till `Status = 'COMPLETED'`. Gruppera sedan på `PractitionerID` och summera minuterna.
3. Utgå från fråga 2 och visa bara grupper vars summa är minst 60 minuter.

<details class="answer" markdown="1">
<summary>Visa lösningsförslag och resultat</summary>

Fråga 1 ger sex bokningar och 225 minuter. Summan inkluderar även bokad och avbokad tid.

```sql
SELECT COUNT(*) AS AppointmentCount, SUM(DurationMinutes) AS TotalMinutes
FROM Appointment;
```

Fråga 2 ger tre grupper: behandlare 21 med 75 minuter, 22 med 40 och 23 med 20:

```sql
SELECT PractitionerID, SUM(DurationMinutes) AS CompletedMinutes
FROM Appointment
WHERE Status = 'COMPLETED'
GROUP BY PractitionerID;
```

När `HAVING SUM(DurationMinutes) >= 60` läggs efter `GROUP BY` behålls bara behandlare 21 med sammanlagt 75 minuter. De övriga två grupperna uppgår till 40 respektive 20 minuter och uppfyller därför inte gruppvillkoret. Vi har nu gjort två olika avgränsningar: `WHERE` tog bort de bokade och avbokade besöken innan tiderna summerades, medan `HAVING` väljer mellan de tre grupper som de genomförda besöken bildade.
</details>

## 14.8 Välj lösningsväg utifrån informationsbehovet

De tidigare övningarna angav flera av arbetsstegen. Här väljer du dem själv. **Pröva i SQLite:** återställ nordicbrew-minimal.sql i Nordic Brew-databasen. Uppgifterna ändrar inga rader.

1. Visa kundnummer, kundnamn och antal registrerade beställningar för de kunder som har minst två beställningar. Alla beställningsstatusar ska räknas. Sortera på kundnummer.
2. Visa kundnummer, kundnamn, produktnamn och sammanlagt antal beställda förpackningar för varje kombination av kund och produkt där antalet är minst två. Ta bara med order med status <code>CONFIRMED</code> eller <code>SHIPPED</code>. Sortera på kundnummer och produktnummer. Varje kund–produktkombination ska ge en resultatrad.
3. En kollega vill kalla antalet från fråga 1 för ”antal köpta produkter”. Förklara med Miras uppgifter varför rapportens rubrik skulle bli missvisande.

Börja med att beskriva en resultatrad och räkna det förväntade svaret. Rita därefter en väg mellan de tabeller som faktiskt behövs. Försök skriva en hel lösning innan du öppnar förslaget.

<details class="answer" markdown="1">
<summary>Visa frågor, resultat och metodval</summary>

```sql
SELECT c.CustomerID, c.CustomerName, COUNT(so.OrderID) AS OrderCount
FROM Customer AS c
JOIN SalesOrder AS so ON so.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CustomerName
HAVING COUNT(so.OrderID) >= 2
ORDER BY c.CustomerID;
```

Resultatet är (17, Mira Ek, 2). Miras utkast 1044 räknas eftersom frågan uttryckligen gäller alla registrerade beställningar.

Den andra frågan behöver fyra tabeller: kunden ger namnet, ordern kopplar kunden till orderraderna och anger status, orderraden ger antal och produkten ger produktnamnet.

```sql
SELECT c.CustomerID, c.CustomerName, p.ProductName,
       SUM(ol.Quantity) AS TotalQuantity
FROM Customer AS c
JOIN SalesOrder AS so ON so.CustomerID = c.CustomerID
JOIN OrderLine AS ol ON ol.OrderID = so.OrderID
JOIN Product AS p ON p.ProductID = ol.ProductID
WHERE so.Status IN ('CONFIRMED', 'SHIPPED')
GROUP BY c.CustomerID, c.CustomerName, p.ProductID, p.ProductName
HAVING SUM(ol.Quantity) >= 2
ORDER BY c.CustomerID, p.ProductID;
```

| <code>CustomerID</code> | <code>CustomerName</code> | <code>ProductName</code> | <code>TotalQuantity</code> |
| ---: | --- | --- | ---: |
| 17 | Mira Ek | Brew coffee 500 g | 2 |
| 24 | Samir Noor | Decaf coffee 250 g | 3 |

En grupp gäller här kombinationen av kund och produkt, inte bara kunden. Produktnumret ingår i grupperingen för att två skilda produkter med samma namn inte ska blandas ihop. Det behöver däremot inte visas när informationsbehovet bara efterfrågar namnet.

I fråga 1 räknar vi beställningar, vilket inte är samma sak som att räkna orderrader eller förpackningar. Mira har två beställningar: order 1042 innehåller två orderrader med sammanlagt tre förpackningar, medan utkastet 1044 ännu saknar orderrader. Påståendena ”två beställningar”, ”två orderrader” och ”tre förpackningar” är alltså alla förenliga, men de besvarar olika frågor. Ingen av dessa uppgifter visar heller om en betalning har skett.
</details>

## Kontrollfrågor

1. Vad skiljer <code>COUNT(*)</code> från <code>SUM(Quantity)</code>?
2. Vad betyder en resultatrad efter <code>GROUP BY</code> <code>ProductID</code>?
3. Varför används <code>HAVING</code> för ett villkor på en gruppsumma?
4. Varför används <code>COUNT(so.OrderID)</code> när en kund utan beställningar ska få antalet noll?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. `COUNT(*)` räknar antalet rader, medan `SUM(Quantity)` adderar de antal som står på raderna. De fyra orderraderna ger därför 4 med `COUNT(*)` men 7 med `SUM(Quantity)`, eftersom deras kvantiteter är 2, 1, 1 och 3. Skillnaden följer av att en orderrad kan beskriva flera förpackningar av samma produkt.

2. Varje resultatrad sammanfattar en produktgrupp som finns i frågans underlag. När vi grupperar `OrderLine` på `ProductID` hamnar de två orderraderna för produkt 501 tillsammans och ger summan 3. Produkt 504 bildar däremot ingen grupp där, eftersom den inte har någon orderrad. Grupperingen skapar inte automatiskt underlag för produkter som saknas.

3. Gruppsumman kan beräknas först när de bidragande raderna har samlats. `HAVING SUM(Quantity) >= 3` väljer därför mellan färdiga grupper, medan `WHERE` väljer enskilda rader innan grupperna bildas. Om vi exempelvis filtrerade på `Quantity >= 3` med `WHERE` skulle vi förlora de två raderna med 2 och 1 som tillsammans gör produkt 501:s summa till 3.

4. Efter `LEFT JOIN` har Lo en bevarad resultatrad, men dess `OrderID` är `NULL` eftersom ingen beställning matchade. `COUNT(so.OrderID)` bortser från detta och ger därför noll beställningar. `COUNT(*)` skulle däremot räkna själva resultatraden och ge 1. Det är skillnaden mellan att räkna kända ordernummer och att räkna alla rader efter sammanfogningen.

</details>

## Sammanfattning

En sammanställning börjar med att bestämma vad som ska räknas: rader, kvantiteter och belopp är olika saker. <code>GROUP BY</code> samlar underlaget i grupper, <code>WHERE</code> väljer vilka rader som bidrar och <code>HAVING</code> väljer mellan de färdiga grupperna. Resultatet behöver också förklaras när data saknas eller när någon grupp inte får något underlag.