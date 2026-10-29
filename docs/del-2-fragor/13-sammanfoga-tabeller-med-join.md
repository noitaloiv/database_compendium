---
layout: default
track: grundspar
prerequisites: "Kapitel 4 och 12: nycklar, <code>SELECT</code> och <code>WHERE</code>."
focus: "Följ ett matchande radpar i taget innan du kombinerar flera tabeller."
title: 13. Sammanfoga tabeller med JOIN
parent: Del II – Frågor och förändring
nav_order: 13
permalink: /docs/del-2-fragor/sammanfoga-tabeller-med-join/
description: Följ matchande radpar och se hur INNER JOIN och LEFT JOIN bygger ett resultat.
keywords: [SQL, JOIN, INNER JOIN, LEFT JOIN, matchning, kartesisk produkt]
---

# 13. Sammanfoga tabeller med <code>JOIN</code>

{% include chapter_guide.html %}

När kunduppgifterna skildes från beställningarna slapp vi skriva kundens namn på varje beställning. Samtidigt hamnade namnet och beställningsnumret i olika tabeller, så för att visa dem tillsammans behöver vi nu följa hänvisningen från beställningen till kunden. En `JOIN` låter oss göra just detta utan att återinföra de redigerbara kopior som normaliseringen skulle undvika.

Vi börjar med tre kunder och tre beställningar. Arbeta gärna med tabellerna på papper innan du kör frågorna: om du kan peka ut vilka rader som hör ihop blir SQL-koden ett sätt att uttrycka ett samband som du redan förstår.

<aside class="practice-guide" markdown="1">
**Pröva i SQLite:** följ [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}) och återställ [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}). Frågorna i avsnitt 13.1–13.6 läser data och kan köras i valfri ordning. Överföringsövningen använder sitt eget underlag. **Resonera:** tabellerna nedan räcker för de första övningarna.
</aside>

## 13.1 Vilka rader hör ihop?

Vi visar bara de kolumner som behövs just nu. Varje rad i `Customer` beskriver en kund, medan varje rad i `SalesOrder` beskriver en beställning.

| <code>CustomerID</code> | <code>CustomerName</code> |
| ---: | --- |
| 17 | Mira Ek |
| 24 | Samir Noor |
| 31 | Lo Chen |

| <code>OrderID</code> | <code>CustomerID</code> |
| ---: | ---: |
| 1042 | 17 |
| 1043 | 24 |
| 1044 | 17 |

Beställning 1042 innehåller kundnumret 17. När vi söker upp samma nummer i `Customer` hittar vi Mira Ek, och kan därför bilda ett radpar av beställningen och Miras kundrad. Beställning 1044 pekar på samma kund, så Miras rad behövs även i ett andra par. Lo Chen har däremot ingen beställning att paras ihop med.

<figure class="diagram">
<div class="table-wrapper"><table class="match-grid">
<caption>Pröva ett kundnummer mot ett ordernummer i taget</caption>
<thead><tr><th scope="col">Kundrad</th><th scope="col">Order 1042<br>kund 17</th><th scope="col">Order 1043<br>kund 24</th><th scope="col">Order 1044<br>kund 17</th></tr></thead>
<tbody><tr><th scope="row">17 · Mira</th><td class="match-yes">Matchning</td><td>Ingen matchning</td><td class="match-yes">Matchning</td></tr>
<tr><th scope="row">24 · Samir</th><td>Ingen matchning</td><td class="match-yes">Matchning</td><td>Ingen matchning</td></tr>
<tr><th scope="row">31 · Lo</th><td>Ingen matchning</td><td>Ingen matchning</td><td>Ingen matchning</td></tr></tbody>
</table></div>
<figcaption><strong>Figur 13.1.</strong> Tre av de nio möjliga radparen har samma kundnummer. Varje matchning blir en egen resultatrad i en <code>INNER JOIN</code>. Markeringen kompletteras med text så att färgen inte behöver tolkas.</figcaption>
</figure>

## 13.2 Skriv matchningen i SQL

Vi uttrycker nu samma jämförelse i ett `ON`-villkor:

```sql
SELECT Customer.CustomerName, SalesOrder.OrderID
FROM Customer
INNER JOIN SalesOrder
    ON Customer.CustomerID = SalesOrder.CustomerID
ORDER BY SalesOrder.OrderID;
```

Läs först `FROM Customer INNER JOIN SalesOrder`: underlaget kommer från de två tabellerna. Läs sedan `ON`: ett radpar får vara med när kundnumren är lika. Till sist anger `SELECT` vilka uppgifter ur varje par som ska visas.

| <code>CustomerName</code> | <code>OrderID</code> |
| --- | ---: |
| Mira Ek | 1042 |
| Samir Noor | 1043 |
| Mira Ek | 1044 |

Punkten i `Customer.CustomerID` betyder ”kolumnen <code>CustomerID</code> i tabellen <code>Customer</code>”. Eftersom båda tabellerna innehåller ett kundnummer behöver vi kunna skilja dem åt. Längre fram kortar vi tabellnamnen med alias, men låter dem först stå utskrivna för att sambandet ska vara lätt att följa.

`INNER JOIN`, eller bara `JOIN` i detta exempel, behåller de **matchande radparen** i resultatet. Frågan sammanställer därmed uppgifterna vi bad om, medan innehållet i de två ursprungliga tabellerna är oförändrat.

## 13.3 Varför visas Mira två gånger?

När vi läser resultatet rad för rad ser vi först Mira tillsammans med beställning 1042 och sedan Mira tillsammans med beställning 1044. Namnet upprepas alltså, men raderna som helhet är olika eftersom de beskriver två olika beställningar. Det är precis vad vi behöver när varje resultatrad ska betyda ”en beställning tillsammans med kundens namn”. Antalet rader följer då antalet matchande beställningar, inte antalet olika kundnamn.

Det är frestande att lägga till `DISTINCT` så snart ett namn upprepas. Innan vi gör det behöver vi emellertid fråga oss vad resultatet ska beskriva. Om uppgiften är att visa beställningar ska båda raderna finnas kvar. Om uppgiften i stället är att visa vilka kunder som har beställt räcker en rad per kund, och då kan vi välja kundnummer och namn med `SELECT DISTINCT`.

**Fyll i:** Hur många rader får resultatet om Mira gör ytterligare en beställning? Hur många gånger visas hennes namn?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

Resultatet får fyra rader, varav tre gäller Mira och en gäller Samir. Miras nya beställning innehåller samma kundnummer som hennes tidigare beställningar och bildar därför ett tredje par med hennes befintliga kundrad. Vi har alltså fortfarande bara en lagrad kundrad för Mira; det är när frågan kombinerar kunden med var och en av hennes beställningar som namnet visas flera gånger.

</details>

## 13.4 <code>LEFT JOIN</code> tar även med den som saknar matchning

Anta nu att vi vill visa alla kunder, även den som ännu inte har beställt. De tre matchningarna behövs fortfarande, men vi behöver dessutom behålla Lo. Byt därför `INNER JOIN` mot `LEFT JOIN`:

```sql
SELECT Customer.CustomerName, SalesOrder.OrderID
FROM Customer
LEFT JOIN SalesOrder
    ON Customer.CustomerID = SalesOrder.CustomerID
ORDER BY Customer.CustomerID, SalesOrder.OrderID;
```

| <code>CustomerName</code> | <code>OrderID</code> |
| --- | ---: |
| Mira Ek | 1042 |
| Mira Ek | 1044 |
| Samir Noor | 1043 |
| Lo Chen | `NULL` |

Vänster sida är tabellen före `LEFT JOIN`, i det här fallet `Customer`. För en vänsterrad utan matchning fyller LEFT JOIN högerns resultatkolumner med NULL. När Lo visas med `NULL` i `OrderID` betyder det därför att frågan inte hittade någon matchande beställning. Det är ingen beställning med nummer noll och ingen ny lagrad orderrad. Däremot visar inte `NULL` i vilken högerkolumn som helst att en matchning saknas: en matchad rad kan redan innehålla `NULL` i en kolumn där det är tillåtet. Ett normalt obligatoriskt ordernummer är därför ett tydligare tecken på utebliven matchning.

<figure class="diagram">
<div class="diagram-grid">
<section class="diagram-card"><h4><code>INNER JOIN</code></h4><p>Mira + 1042<br>Mira + 1044<br>Samir + 1043</p><p>Endast matchande par.</p></section>
<section class="diagram-card"><h4><code>LEFT JOIN</code></h4><p>Mira + 1042<br>Mira + 1044<br>Samir + 1043<br><strong>Lo + <code>NULL</code></strong></p><p>Matchningarna och varje vänsterrad som saknar matchning.</p></section>
</div>
<figcaption><strong>Figur 13.2.</strong> <code>LEFT JOIN</code> gör samma matchningar som <code>INNER JOIN</code> och bevarar dessutom Lo. Mira får fortfarande två rader.</figcaption>
</figure>

Cirklar som överlappar kan påminna om att två underlag har något gemensamt. De visar däremot inte tydligt att en kund kan bilda flera radpar eller hur `NULL` fyller den saknade sidan. Därför följer figurerna här själva raderna. I kapitel 10 använde vi Venn-diagram för mängdoperationer, där jämförelsen faktiskt gäller medlemskap i två mängder.

## 13.5 Kontrollera villkoret innan du lägger till fler tabeller

Om varje kund kombineras med varje beställning uppstår 3 × 3 = 9 par. En sådan **kartesisk produkt** innehåller bland annat Lo tillsammans med Miras beställning. SQL kan uttrycka den avsiktligt med `CROSS JOIN`, men den svarar inte på frågan om vem som gjorde beställningen.

Matchningsvillkoret är alltså avgörande. `Customer.CustomerID = SalesOrder.OrderID` är inte ett meningsfullt alternativ: kundnummer och ordernummer identifierar olika slags företeelser, även om båda skrivs som heltal. Följ i stället den främmande nyckeln från `SalesOrder.CustomerID` till `Customer.CustomerID`.

## 13.6 Lägg till en tabell i taget

För att visa varje beställnings produkter behöver vi även `OrderLine` och `Product`. Vi börjar med de två tabeller vars rader beskriver själva innehållet:

```sql
SELECT ol.OrderID, p.ProductName, ol.Quantity
FROM OrderLine AS ol
JOIN Product AS p ON p.ProductID = ol.ProductID
ORDER BY ol.OrderID, p.ProductID;
```

Med `AS ol` och `AS p` ger vi tabellerna kortare namn som gäller inom just den här frågan. När de fyra orderraderna matchas mot sina produkter får vi fyra resultatrader, eftersom varje orderrad hänvisar till exakt en produkt. Att produkt 501 syns två gånger är därför väntat: den ingår i två olika beställningar och bildar ett radpar för vardera orderraden.

Behöver vi kundnamnet följer vi sedan två ytterligare hänvisningar: från orderraden till beställningen och därifrån till kunden. Resultatets radbetydelse förblir en orderrad med beskrivande uppgifter.

```sql
SELECT ol.OrderID, c.CustomerName, p.ProductName, ol.Quantity
FROM OrderLine AS ol
JOIN Product AS p ON p.ProductID = ol.ProductID
JOIN SalesOrder AS so ON so.OrderID = ol.OrderID
JOIN Customer AS c ON c.CustomerID = so.CustomerID
ORDER BY ol.OrderID, p.ProductID;
```

| <code>OrderID</code> | <code>CustomerName</code> | <code>ProductName</code> | <code>Quantity</code> |
| ---: | --- | --- | ---: |
| 1042 | Mira Ek | Brew coffee 500 g | 2 |
| 1042 | Mira Ek | Espresso blend 250 g | 1 |
| 1043 | Samir Noor | Brew coffee 500 g | 1 |
| 1043 | Samir Noor | Decaf coffee 250 g | 3 |

Order 1044 saknar orderrader och kommer därför inte med. Kontrollera gärna vägen för bara den första raden innan du försöker läsa hela frågan: orderradens produktnummer ger kaffets namn, och dess ordernummer ger tillgång till beställningens kundnummer.

<details class="extension" markdown="1">
<summary>Fördjupning: ett <code>WHERE</code>-villkor efter <code>LEFT JOIN</code></summary>

Om vi efter en `LEFT JOIN` på kunder och beställningar lägger till `WHERE SalesOrder.OrderID = 1042`, behålls bara Miras matchning med just den beställningen. Los rad försvinner eftersom hennes `NULL` inte uppfyller jämförelsen. Om avsikten är att behålla alla kunder med en eventuell matchning på order 1042 ska begränsningen i stället höra till `ON`-villkoret:

```sql
SELECT c.CustomerName, so.OrderID
FROM Customer AS c
LEFT JOIN SalesOrder AS so
    ON so.CustomerID = c.CustomerID AND so.OrderID = 1042
ORDER BY c.CustomerID;
```

Här visas Mira med 1042 samt Samir och Lo med `NULL`. Att flytta ett villkor kan alltså ändra frågans betydelse.
</details>

<figure class="figure" id="figur-13-3">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 13.3, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/17-joinvagar-nordic-brew.svg' | relative_url }}" alt="Customer nås från SalesOrder med CustomerID. OrderLine hänvisar till SalesOrder med OrderID och till Product med ProductID." width="1040" height="520" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 13.3.</strong> Vägen mellan tabellerna visar vilka nyckelvärden som ska jämföras. Varje sammanfogning behöver ett eget motiverat villkor. <a href="{{ '/assets/images/17-joinvagar-nordic-brew.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 13.7 Öva med ett konferensprogram

**Start:** skapa en separat övningsdatabas och kör [transfer-exercises.sql]({{ '/assets/sql/transfer-exercises.sql' | relative_url }}). `ConferenceSession` beskriver programpunkter, `Speaker` talare och `SessionSpeaker` vem som talar på vilken programpunkt.

Börja med att förutsäga resultatet av denna halvfärdiga fråga. Ersätt `???` med rätt jämförelse och kör sedan frågan.

```text
SELECT cs.SessionTitle, ss.SpeakerID
FROM ConferenceSession AS cs
JOIN SessionSpeaker AS ss ON ???
ORDER BY cs.SessionID, ss.SpeakerID;
```

<details class="answer" markdown="1">
<summary>Visa villkor och förväntat resultat</summary>

Villkoret är `cs.SessionID = ss.SessionID`, eftersom båda kolumnerna hänvisar till samma slags företeelse: en programpunkt. I `SessionSpeaker` finns två kopplingar för `Data with meaning`, en till talare 1 och en till talare 2, så den programpunkten ger två matchningar. `Reliable systems` har en koppling till talare 1 och ger ytterligare en rad. Resultatet innehåller därför tre rader, även om det bara är två programpunkter som har matchat. `Closing discussion` saknar en koppling och kommer inte med i denna `INNER JOIN`.

</details>

Byt därefter till `LEFT JOIN`. Förklara den nya raden innan du kör koden. När du kan följa den skillnaden, utöka den ursprungliga innerjoin-frågan med `Speaker` så att talarnas namn visas i stället för deras nummer.

<details class="answer" markdown="1">
<summary>Visa lösning och kontroll</summary>

Med `LEFT JOIN` tillkommer `Closing discussion` med `NULL` i `SpeakerID`. Med talarnas namn och endast matchningar kan frågan skrivas:

```sql
SELECT cs.SessionTitle, s.SpeakerName
FROM ConferenceSession AS cs
JOIN SessionSpeaker AS ss ON ss.SessionID = cs.SessionID
JOIN Speaker AS s ON s.SpeakerID = ss.SpeakerID
ORDER BY cs.SessionID, s.SpeakerID;
```

De tre raderna blir `Data with meaning`–Amina Said, `Data with meaning`–Leo Borg och `Reliable systems`–Amina Said.
</details>

## Kontrollfrågor

1. Vad motsvarar en markerad matchning i figur 13.1?
2. Varför får Mira två rader i båda join-varianterna?
3. Vilken tabell ska stå till vänster om alla produkter ska visas, även obeställda?
4. Vad betyder ett `NULL` som tillkommer på höger sida i en <code>LEFT JOIN</code>?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Markeringen visar ett par av en kundrad och en orderrad som uppfyller `ON`-villkoret. Kund 17 matchar exempelvis order 1042 eftersom båda anger kundnummer 17. Varje sådan matchning bidrar med en rad till resultatet, vilket gör att vi kan räkna markeringarna för att förutsäga hur många rader en `INNER JOIN` får.

2. Mira har två beställningar som matchar hennes kundnummer. Både `INNER JOIN` och `LEFT JOIN` behåller dessa två matchningar och ger därför två rader med hennes namn. Skillnaden mellan varianterna gäller de kunder som saknar matchning, såsom Lo; en `LEFT JOIN` slår inte ihop redan matchande beställningar.

3. `Product` ska vara vänsterunderlaget, eftersom det är dess rader som måste bevaras även när ingen orderrad matchar. Vi kan sedan använda `LEFT JOIN OrderLine` med samma `ProductID` som villkor. Den obeställda produkten får då finnas kvar med `NULL` i orderradens kolumner i stället för att försvinna ur resultatet.

4. För en vänsterrad utan matchning fyller `LEFT JOIN` högerns resultatkolumner med `NULL`. När Lo visas med `NULL` i `OrderID` betyder det därför att frågan inte hittade någon matchande beställning. Det är ingen beställning med nummer noll och ingen ny lagrad orderrad. Observera också att ett högerattribut som redan tillåter `NULL` kan vara tomt även i en matchande rad; ett annars obligatoriskt ordernummer är tydligare för att känna igen utebliven matchning.

</details>

## Sammanfattning

Med `JOIN` kan vi följa hänvisningar mellan tabeller och sammanställa uppgifter som har lagrats var för sig. Varje radpar som uppfyller villkoret bidrar till resultatet, så en kund med två beställningar ger två matchningar. En kund utan beställning saknar däremot ett sådant par och behöver bevaras genom exempelvis `LEFT JOIN` om även den kunden ska visas. Genom att först följa en enskild matchning och därefter räkna alla matchningar blir det lättare att förstå både resultatets innehåll och antalet rader.