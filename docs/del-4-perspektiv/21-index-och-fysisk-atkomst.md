---
layout: default
track: grundspar
prerequisites: "Kapitel 4 och 12: nycklar och sökvillkor."
focus: "Skilj ett index som åtkomstväg från en nyckel som regel."
title: 21. Index och fysisk åtkomst
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 21
permalink: /docs/del-4-perspektiv/index-och-fysisk-atkomst/
description: Förstå ett index som en extra sökväg och resonera om kostnaden för läsning och förändring.
keywords: [index, fysisk databasdesign, sökning, primärnyckel, prestanda]
---

# 21. Index och fysisk åtkomst

{% include chapter_guide.html %}

Med bara tre beställningar är det lätt att leta fram Miras båda order för hand, men om tabellen innehåller flera miljoner beställningar blir det betydligt mer arbete att granska varje rad. Frågan betyder fortfarande samma sak; det som får större praktisk betydelse är hur databashanteringssystemet kan hitta de efterfrågade raderna.

Hittills har vi främst arbetat med databasens logiska struktur: vilka fakta som lagras, hur de identifieras och hur de hör ihop. Nu möter vi ett första val i den **fysiska utformningen**. Ett index erbjuder en extra åtkomstväg till lagrade rader utan att ändra vilka fakta de beskriver.

## 21.1 En innehållsförteckning till vissa värden

Tänk på ett sakregister längst bak i en bok. Om du söker ett visst ord kan registret hänvisa dig till relevanta sidor. Själva resonemanget finns fortfarande på dessa sidor; registret är ett stöd för att hitta dit.

På liknande sätt kan ett index på `SalesOrder.CustomerID` hjälpa systemet att hitta beställningar för en viss kund. Bilden visar idén, inte det exakta interna lagringsformatet:

<figure class="figure" id="figur-21-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 21.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/41-indexvag.svg' | relative_url }}" alt="Sökning på kundnummer 17 leder via en extra åtkomstväg till order 1042 och 1044. Samma kundnummer får förekomma i båda orderraderna." width="900" height="410" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 21.1.</strong> Indexets uppgift är att hjälpa systemet hitta matchande rader. Kundnumret behöver inte vara unikt bland beställningarna. <a href="{{ '/assets/images/41-indexvag.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Utan en användbar åtkomstväg kan systemet behöva gå igenom tabellens rader och pröva kundnumret på varje rad. Med en lämplig indexstruktur kan det i stället begränsa sökarbetet. Den exakta vinsten beror bland annat på tabellens storlek och hur stor del av den som matchar villkoret.

## 21.2 Ett index är inte samma sak som en nyckel

En primärnyckel uttrycker ett krav på identifiering: varje rad ska kunna skiljas från de andra. Ett index handlar om hur rader kan hittas effektivt. Många DBHS använder index för att upprätthålla nyckelregler, vilket förklarar varför begreppen ofta nämns tillsammans, men deras roller är olika.

Eftersom samma kund kan ha flera beställningar kan `CustomerID` inte identifiera en enskild beställning på det sätt som `OrderID` gör. Kundnumret kan ändå vara användbart i ett index, om det hjälper systemet att hitta en kunds samtliga order. Ett vanligt, icke-unikt index tillåter därför att samma kundnummer förekommer på flera rader.

| Fråga | Begrepp som främst hjälper oss |
| --- | --- |
| Hur skiljer vi två beställningar åt? | Primärnyckel |
| Hur garanterar vi att kundnumret hänvisar till en befintlig kund? | Främmande nyckel |
| Hur kan vi hitta en kunds beställningar utan att alltid söka genom alla? | Lämplig fysisk åtkomstväg, exempelvis index |

## 21.3 Snabbare läsning har en kostnad

En ny beställning förändrar inte bara tabellen utan också de index som ska hjälpa systemet att hitta beställningen senare. Om order 1045 registreras för kund 17 behöver ett index på kundnummer därför få med hänvisningen till den nya raden. Den extra sökvägen kräver på så sätt både lagringsutrymme och arbete vid förändringar. Ett index som nästan aldrig används kan därför kosta mer att underhålla än det sparar, även om det vore möjligt att skapa det.

Om personalen nästan alltid söker efter beställningar för en viss kund är `CustomerID` en rimlig indexkandidat, eftersom sökningen ofta behöver en begränsad del av tabellen. När en fråga i stället hämtar nästan alla beställningar kan en extra uppslagning ge mindre nytta. Ett indexval behöver därför grundas i både frågorna och värdenas fördelning; att en kolumn som `Active` förekommer i ett villkor räcker inte i sig som motivering.

Det är databashanteringssystemets frågeplanerare som väljer en åtkomstväg. Att ett index finns garanterar inte att varje fråga använder det, och det vore fel att bedöma nyttan utifrån några få övningsrader som redan går att läsa nästan omedelbart.

## 21.4 Resonera innan du mäter

En bra arbetsgång börjar med en verklig fråga som används ofta eller tar för lång tid. Identifiera dess sökvillkor och sammanfogningar, föreslå en åtkomstväg och jämför sedan beteendet på representativa data. Kontrollera samtidigt hur skrivningar påverkas.

I vår lilla övningsdatabas går det så snabbt att läsa alla rader att en uppmätt tidsskillnad säger mycket lite om nyttan i ett större system. Börja därför med att förklara vilken del av sökarbetet ett index skulle kunna minska och vilken ny kostnad det tillför. En senare mätning behöver sedan göras med en datamängd och användning som liknar den verkliga situationen, så att slutsatsen inte bygger på tillfälliga skillnader mellan några få körningar.

**Resonera:** Ett museum har en stor tabell med föremål. Personalen söker ofta på inventarienummer, ibland på förvärvsår och nästan aldrig på föremålets anteckningstext. Vilka ytterligare frågor skulle du ställa innan du föreslår index?

<details class="answer" markdown="1">
<summary>Visa lösningsförslag</summary>

Undersök först vilka index som redan finns; inventarienumret kan redan skyddas och stödjas av en nyckel. Fråga därefter hur ofta sökningarna används, hur många rader de brukar hitta, hur stor tabellen är och hur ofta data förändras. ”Det går att söka på kolumnen” räcker inte som enda argument för ett nytt index.
</details>

<details class="extension" markdown="1">
<summary>Fördjupning: inspektera en plan i SQLite</summary>

Ladda `nordicbrew-minimal.sql` i övningsdatabasen och kör:

```sql
CREATE INDEX IF NOT EXISTS idx_salesorder_customer
ON SalesOrder(CustomerID);

EXPLAIN QUERY PLAN
SELECT OrderID FROM SalesOrder WHERE CustomerID = 17;
```

<code>EXPLAIN QUERY PLAN</code> visar hur SQLite avser att arbeta, inte frågans vanliga orderrader. På denna fråga kan du ofta se det skapade indexets namn. Formuleringen och valet beror på version, statistik och schema; om resultatet avviker är nästa uppgift att läsa planen, inte att tvinga fram en viss text. Kör den vanliga <code>SELECT</code>-frågan separat: ordernumren ska vara 1042 och 1044 oavsett åtkomstväg. Återladdning av startfilen återskapar tabellerna och tar därmed bort det tillagda indexet.

Fortsatt läsning: [SQLite – Query Planning](https://www.sqlite.org/queryplanner.html).
</details>

## Kontrollfrågor

1. Varför kan ett index vara användbart på en kolumn som inte är unik?
2. Varför är det olämpligt att automatiskt skapa index på alla kolumner?
3. Ändras frågans avsedda resultat när ett index tillkommer?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Ett index kan hjälpa systemet att hitta flera rader som delar ett sökvärde. Kundnummer 17 förekommer exempelvis på både order 1042 och 1044, och en sökning kan behöva båda. Nyttan kräver alltså inte att varje sökvärde är unikt: indexets uppgift är att erbjuda en åtkomstväg till de matchande raderna.

2. Varje index tar plats och behöver hållas aktuellt när berörda data förändras. Om en kolumn nästan aldrig används för sökning kan underhållsarbetet bli större än nyttan. Valet behöver därför bygga på vilka frågor som faktiskt ställs, hur många rader de brukar träffa och hur ofta innehållet ändras.

3. Nej. Ett vanligt, icke-unikt index ändrar åtkomstvägen men inte vilka rader som uppfyller frågans villkor. Miras beställningar är fortfarande 1042 och 1044. Den ordning som råkar visas kan däremot förändras om ingen sortering begärts, så en bestämd presentationsordning kräver fortfarande `ORDER BY`. Ett unikt index inför dessutom en unikhetsregel och är därför ett annat slags beslut.

</details>

## Sammanfattning

Ett index är en extra väg till lagrade rader, medan en nyckel uttrycker en regel om identifiering eller hänvisning. Sökvägen kan minska arbetet vid läsning, men tar plats och behöver underhållas vid förändringar. Ett motiverat indexval börjar därför med de verkliga frågorna och ett representativt underlag.