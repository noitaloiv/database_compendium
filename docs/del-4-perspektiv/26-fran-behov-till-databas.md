---
layout: default
track: grundspar
prerequisites: "Grundspårets tidigare kapitel."
focus: "Knyt ihop verksamhetsregler, modell, SQL och kontroll i ett mindre fall."
title: 26. Från behov till fungerande databas
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 26
permalink: /docs/del-4-perspektiv/fran-behov-till-databas/
description: Ett sammanhängande museifall knyter ihop begrepp, modellering, normalisering, SQL och transaktioner.
keywords: [tillämpning, modellering, normalisering, SQL, transaktion, museum]
---

# 26. Från behov till fungerande databas

{% include chapter_guide.html %}

Ett museum erbjuder guidade visningar och vill ersätta sin gemensamma bokningslista med en databas. Vi följer hur verksamhetens regler påverkar begreppsmodellen, relationsschemat, SQL-frågorna och vår bedömning av resultatet. På så sätt knyter kapitlet ihop tidigare arbetssätt utan att bli ett nytt, fullständigt projekt.

Arbeta med ett steg i taget. Formulera gärna ett eget svar innan du öppnar lösningsförslaget och jämför sedan framför allt motiveringen. När du kommer till SQL-delen finns en färdig startfil, så att du kan fortsätta även om du har gjort andra modellval i ett tidigare steg. Längre fram ska du också pröva vad bokningsuppgifterna faktiskt kan säga om exempelvis bokade platser och närvaro.

## 26.1 Avgränsa verksamheten

Museet beskriver sitt behov så här:

> En visning är ett bestämt tillfälle med starttid, titel och ett maximalt antal platser. Varje visning leds av en guide. En besökare kan boka flera platser på en visning, men har högst en bokning per visning. Samma besökare kan boka flera olika visningar. Vi vill kunna se deltagare och antal bokade platser för varje visning, även innan någon har bokat den.

Vi avgränsar bort betalningar, avbokningshistorik och individuella namn på samtliga medföljande. <code>Visitor</code> betecknar här den registrerade bokande besökaren, inte varje person som följer med. Den definitionen förklarar senare varför en bokningsrad kan ange fler än en plats.

**Resonera:** Är ”visning” här ett allmänt programkoncept eller ett tillfälle på en viss tid? Varför påverkar svaret modellen?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

Här betecknar `TourID` ett bestämt visningstillfälle, så två visningar med titeln Textiles kan behöva olika nummer när de hålls vid olika tidpunkter. Om museet också vill förvalta Textiles som ett återkommande programkoncept behöver det begreppet beskrivas separat. Titeln räcker alltså inte för att identifiera det tillfälle som en besökare bokar.
</details>

## 26.2 Beskriv begreppen före SQL-kolumnerna

Verksamhetsbeskrivningen skiljer mellan den som leder en visning, själva visningstillfället och den besökare som bokar platser. Vi använder begreppen `Guide`, `Tour` och `Visitor` för dessa företeelser. Eftersom samma besökare kan boka flera visningar, och samma visning kan ha flera bokande besökare, behöver även deras enskilda bokning beskrivas. Begreppet `Booking` knyter därför ihop en besökare med en visning och bär uppgiften `Seats`, antalet platser som just den besökaren bokat där.

| Utgångspunkt | Verksamhetsregel | Multiplicitet i den riktningen |
| --- | --- | --- |
| En <code>Guide</code> | Kan leda ingen, en eller flera visningar | 0..* <code>Tour</code> |
| En <code>Tour</code> | Leds av exakt en guide | 1..1 <code>Guide</code> |
| En <code>Visitor</code> | Kan göra flera bokningar eller ännu sakna dem | 0..* <code>Booking</code> |
| En <code>Booking</code> | Görs av exakt en registrerad besökare | 1..1 <code>Visitor</code> |
| En <code>Tour</code> | Kan ha flera bokningar eller ännu sakna dem | 0..* <code>Booking</code> |
| En <code>Booking</code> | Avser exakt en visning | 1..1 <code>Tour</code> |

Tabellen är en textuell konceptuell modell. Den beskriver sambanden utan att ännu placera främmande nycklar. En rad för antalet platser på en bokning ska inte förväxlas med visningens kapacitet: bokningen anger ett anspråk, medan kapaciteten gäller hela tillfället.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/museum-conceptual.svg' | relative_url }}" alt="Guide leder noll eller flera Tour. Varje Tour leds av en Guide. Visitor gör noll eller flera Booking. Varje Booking hör till en Visitor och en Tour; Tour kan ha noll eller flera Booking. Booking beskriver antalet Seats." width="900" height="540" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 26.1.</strong> Konceptuell modell av museifallet. ID markerar identifiering på begreppsnivå; främmande nycklar införs först i relationsschemat. <a href="{{ '/assets/images/museum-conceptual.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 26.3 Kontrollera beroendena i den platta listan

Anta att den gamla listan har kolumnerna:

```text
TourID, Title, StartsAt, Capacity, GuideID, GuideName,
VisitorID, VisitorName, Seats
```

En rad gäller en besökares bokning på en visning. Enligt regeln om högst en bokning per besökare och visning identifierar kombinationen <code>TourID</code> + <code>VisitorID</code> raden.

**Fyll i:** Vilka av uppgifterna bestäms av endast <code>TourID</code>? Vilka bestäms av endast <code>VisitorID</code>? Vilken uppgift behöver båda?

<details class="answer" markdown="1">
<summary>Visa beroenden och uppdelning</summary>

Visningens titel, starttid, kapacitet och tilldelade guide bestäms av `TourID`, medan besökarens namn bestäms av `VisitorID`. Antalet bokade platser, `Seats`, behöver däremot båda identifierarna: vi måste veta både vilken visning och vilken bokande besökare som avses.

Guidens namn följer ett annat beroende, `GuideID → GuideName`. Namnet beskriver därför guiden och bör kunna ändras där, utan att samma aktuella namn behöver rättas på varje visning som guiden leder.

För att undvika partiella beroenden flyttas besökaruppgifter och visningsuppgifter från bokningsrelationen. För att undvika det transitiva beroendet via <code>GuideID</code> skiljs guidens namn från visningen. Det ger samma fyra relationer som begreppsanalysen pekade mot.
</details>

Observera hur de två arbetssätten kompletterar varandra. Verksamhetsbeskrivningen förklarar vad begreppen betyder, medan beroendeanalysen visar varför vissa fakta annars skulle upprepas i den platta listan.

## 26.4 Från begrepp till schema

Ett möjligt relationsschema är:

```text
Guide(GuideID, GuideName)
PK: GuideID

Tour(TourID, Title, StartsAt, Capacity, GuideID)
PK: TourID
FK: GuideID -> Guide.GuideID

Visitor(VisitorID, VisitorName)
PK: VisitorID

Booking(TourID, VisitorID, Seats)
PK: TourID + VisitorID
FK: TourID -> Tour.TourID
FK: VisitorID -> Visitor.VisitorID
```

Regeln att varje visning leds av exakt en guide uttrycks genom en obligatorisk hänvisning från `Tour.GuideID` till `Guide`. På motsvarande sätt måste varje bokning hänvisa till både en befintlig visning och en befintlig besökare. När kombinationen av dessa två hänvisningar blir primärnyckel i `Booking` får samma besökare högst en bokning på samma visning, vilket motsvarar verksamhetsregeln. Besökaren kan fortfarande boka en annan visning, eftersom det ger en annan kombination av nyckelvärden.

**Resonera:** Varför placeras inte <code>VisitorID</code> som en ensam kolumn i <code>Tour</code>?

<details class="answer" markdown="1">
<summary>Visa svar</summary>

Eftersom flera besökare kan boka samma visning skulle en ensam besökarkolumn i `Tour` inte räcka. Den skulle antingen begränsa visningen till en bokande besökare eller behöva innehålla en lista vars olika bokningar blev svåra att hålla isär. Med `Booking` får varje kombination av visning och bokande besökare i stället en egen rad, där också antalet platser för just den bokningen kan lagras.
</details>

## 26.5 Starta den körbara övningen

**Pröva i SQLite:** skapa en separat databas, exempelvis `museum.db`, och kör [museum-case.sql]({{ '/assets/sql/museum-case.sql' | relative_url }}). [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}) visar hur. Startfilen kan köras igen för att återställa just dessa fyra tabeller.

Underlaget innehåller följande bokningar:

| <code>TourID</code> | <code>Title</code> | <code>VisitorID</code> | <code>VisitorName</code> | <code>Seats</code> |
| ---: | --- | ---: | --- | ---: |
| 101 | Textiles | 1 | Nora | 2 |
| 101 | Textiles | 2 | Bo | 1 |
| 102 | Silver | 1 | Nora | 2 |

Visning 103, Storage, finns också men saknar bokningar. Besökare 3, Inez, har ännu inte bokat något. Läs gärna <code>CREATE TABLE</code>-delarna i filen och hitta den regel som gör att <code>Seats</code> måste vara större än noll.

## 26.6 Bygg en fråga i tre steg

Vi vill visa visningens titel, besökarens namn och antalet bokade platser. Börja med att köra `SELECT * FROM Booking;` och försäkra dig om att en rad betyder en bokning. Lägg sedan till titeln:

```sql
SELECT b.TourID, t.Title, b.VisitorID, b.Seats
FROM Booking AS b
JOIN Tour AS t ON t.TourID = b.TourID
ORDER BY b.TourID, b.VisitorID;
```

**Fyll i själv:** Lägg till <code>Visitor</code> genom <code>VisitorID</code> och byt det visade besökarnumret mot <code>VisitorName</code>. Förväntningen är fortfarande tre rader, eftersom varje bokning har exakt en besökare.

<details class="answer" markdown="1">
<summary>Visa lösning</summary>

```sql
SELECT t.TourID, t.Title, v.VisitorName, b.Seats
FROM Booking AS b
JOIN Tour AS t ON t.TourID = b.TourID
JOIN Visitor AS v ON v.VisitorID = b.VisitorID
ORDER BY t.TourID, v.VisitorID;
```

Resultatet motsvarar de tre raderna i avsnitt 26.5, med besökarnumret utelämnat. Vill du även visa guidens namn kan du följa `t.GuideID` till <code>Guide</code>. För Textiles är guiden Amina och för Silver Leo. Det är ytterligare samma sorts matchning, ingen ny SQL-operation.
</details>

## 26.7 Sammanfatta och pröva resultatet

Skriv nu en fråga på <code>Booking</code> som visar varje bokad visnings <code>TourID</code> och summan av <code>Seats</code>. Utöka den därefter så att bara summor på minst tre platser visas.

<details class="answer" markdown="1">
<summary>Visa lösning och mellanresultat</summary>

```sql
SELECT TourID, SUM(Seats) AS BookedSeats
FROM Booking
GROUP BY TourID
ORDER BY TourID;
```

Den första frågan ger 3 bokade platser för visning 101 och 2 för visning 102. Om vi lägger `HAVING SUM(Seats) >= 3` mellan `GROUP BY` och `ORDER BY` återstår därför bara visning 101. Visning 103 saknas redan före detta urval, eftersom frågans underlag är `Booking` och den visningen ännu inte har någon bokningsrad att bilda en grupp av.
</details>

En annan fråga gäller antalet **bokningar** för alla visningar, även den obokade. Vilken tabell behöver då stå till vänster, och vilken kolumn kan räknas så att 103 får noll?

<details class="answer" markdown="1">
<summary>Visa lösning</summary>

```sql
SELECT t.TourID, t.Title, COUNT(b.VisitorID) AS BookingCount
FROM Tour AS t
LEFT JOIN Booking AS b ON b.TourID = t.TourID
GROUP BY t.TourID, t.Title
ORDER BY t.TourID;
```

Resultatet blir 101: 2, 102: 1 och 103: 0. På visning 101 finns två bokningsrader, även om den ena omfattar två platser och den andra en. Frågan räknar därför två bokningar, medan `SUM(Seats)` gav tre bokade platser. Visning 103 bevaras av `LEFT JOIN` och får `NULL` i bokningens kolumner; eftersom `COUNT(b.VisitorID)` inte räknar detta värde blir bokningsantalet noll. Både antalet och rubriken behöver alltså följa av vad vi avser att sammanfatta.

</details>

## 26.8 Prova en regel och se dess gräns

Startfilen anger `CHECK (Seats > 0)`. Försök lägga till Inez med noll platser på visning 101:

```sql
-- Avsiktligt regelbrott: ska avvisas.
INSERT INTO Booking (TourID, VisitorID, Seats) VALUES (101, 3, 0);
```

Kontrollera därefter att bokningen inte finns. Om klienten visar ett felmeddelande har villkoret gjort sitt arbete. Men vad händer med kapaciteten om två personer samtidigt försöker boka de sista platserna?

Det enkla <code>CHECK</code>-villkoret jämför inte summan av alla bokningar med visningens kapacitet. Programmet behöver genomföra kapacitetskontroll och registrering som en samordnad operation, med lämplig transaktionskontroll så att två bokningar inte båda räknar på samma kvarvarande utrymme. Här knyts databasens regler till kapitlen om samtidighet: ett korrekt villkor på varje enskild rad räcker inte för alla regler som gäller helheten.

## 26.9 Granska en färdig lösning

Avsluta genom att välja en verksamhetsregel och följa den hela vägen. Regeln ”en bokning avser exakt en visning” blir en association i modellen, en obligatorisk främmande nyckel i schemat och ett villkor som kan prövas med ett obefintligt <code>TourID</code>. På samma sätt behöver en regel som ännu inte upprätthålls av schemat identifieras och få ett tydligt ansvar i systemet.

### Informationskvalitet och ansvar i samma lösning

Anta att en rapport visar tre besökare på visning 101 eftersom den summerar <code>Seats</code>. Stämmer rubriken? Enligt vår avgränsning känner databasen de bokande parterna och antalet bokade platser, men inte vilka personer som faktiskt kommer. Rapporten bör därför säga **tre bokade platser**, inte tre registrerade eller närvarande individer.

| Granskningspunkt | Fråga att besvara innan lösningen används |
| --- | --- |
| Betydelse | Räknar rapporten bokningar, platser eller faktiskt närvarande personer? |
| Aktualitet | Hur hanteras en ändrad starttid efter att besökaren fått en bekräftelse? |
| Ursprung | Vem har bekräftat kapaciteten för lokalen eller visningen? |
| Rättelse | Hur upptäcks och rättas att en bokning kopplats till fel, men befintlig, besökare? |
| Återställning | Vilka godkända bokningar kan återskapas efter ett fel? |

**Resonera:** Välj två punkter och föreslå vilken kontroll eller arbetsrutin som behövs. Du behöver inte lägga till nya SQL-satser.

<details class="answer" markdown="1">
<summary>Exempel på en fortsatt granskning</summary>

Rapportens rubrik och dokumentation kan skilja bokade platser från närvaro, så att summan inte används som belägg för vilka som deltog. Om närvaro behövs måste informationsbehovet och modellen utvidgas.

En ändring av starttiden behöver också en rutin för att informera berörda bokare och kontrollera att rätt tid visas i alla aktuella kanaler. Att <code>Tour</code>.<code>StartsAt</code> har fått rätt värde visar inte att tidigare skickade meddelanden har ändrats.

På motsvarande sätt behöver någon ansvara för kapacitetsuppgiften och en prövad återställningsrutin. Ett bra svar knyter varje åtgärd till den brist den är avsedd att hantera.
</details>

## Kontrollfrågor

1. Vilken betydelseskillnad finns mellan en besökare och en bokning?
2. Varför räcker inte syntaktiskt korrekt SQL för att få en korrekt bokningsfunktion?
3. Hur kan ett oväntat radantal hjälpa dig att granska en <code>JOIN</code>?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Besökaren betecknar den registrerade bokande parten, medan bokningen beskriver partens anspråk på ett antal platser vid ett visst visningstillfälle. Nora kan därför vara en besökare men ha flera bokningar. Att en bokning omfattar två platser betyder inte heller att databasen känner namnet på båda personerna som följer med.

2. Korrekt syntax visar att systemet kan tolka satserna, men de måste också uttrycka rätt verksamhetsregler. En bokning kan exempelvis ha ett positivt antal platser och ändå göra att visningens kapacitet överskrids. Programmet behöver därför kontrollera helheten och samordna kapacitetskontroll med registrering, även när flera bokar samtidigt.

3. Radantalet kan jämföras med vad en resultatrad ska betyda och hur många matchningar modellen tillåter. När varje bokning har exakt en visning och en besökare ska de tre startbokningarna fortfarande ge tre rader efter dessa sammanfogningar. Om resultatet blir större eller mindre behöver vi undersöka villkoren och eventuellt bortfall, inte direkt dölja skillnaden med `DISTINCT`.

</details>

## Sammanfattning

En fungerande databas växer fram ur sammanhängande beslut om begrepp, regler, struktur och användning. Museifallet visar hur samma regel kan följas från en verksamhetsmening till en nyckel, en fråga och en kontroll. Den tekniska lösningen behöver dessutom förvaltas och granskas mot det verkliga informationsbehovet när verksamheten förändras.