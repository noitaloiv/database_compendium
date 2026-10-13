---
layout: default
track: grundspar
prerequisites: "Kapitel 12 och 14: <code>SELECT</code>, <code>IN</code> och enkla aggregat."
focus: "Använd ett frågeresultat i en annan fråga eller jämför två resultat."
title: 15. Underfrågor och mängdoperationer
parent: Del II – Frågor och förändring
nav_order: 15
permalink: /docs/del-2-fragor/underfragor-och-mangdoperationer/
description: Använd ett mellanresultat i nästa fråga och jämför mängder med UNION, INTERSECT och EXCEPT.
keywords: [SQL, underfråga, IN, UNION, INTERSECT, EXCEPT, Venn-diagram]
---

# 15. Underfrågor och mängdoperationer

{% include chapter_guide.html %}

Ibland kan en fråga besvaras i två begripliga steg. Om vi vill hitta produkter som är dyrare än genomsnittet kan vi först beräkna genomsnittspriset och sedan jämföra varje pris med det. En **underfråga** låter oss skriva båda stegen i samma SQL-sats, utan att själv kopiera ett mellanresultat.

En annan sorts tvåstegsfråga jämför hela resultat. Vilka böcker förekommer exempelvis både bland lån och bland reservationer? Då kan en mängdoperation vara ett naturligt sätt att uttrycka jämförelsen. Vi behandlar dessa två idéer var för sig innan vi övar på dem.

<aside class="practice-guide" markdown="1">
**Start i SQLite:** använd [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}) till avsnitt 15.1–15.5. Biblioteksövningen använder en separat databas med [transfer-exercises.sql]({{ '/assets/sql/transfer-exercises.sql' | relative_url }}). Kör underfrågan för sig när du vill kontrollera mellanresultatet.
</aside>

## 15.1 Börja med ett enda beräknat värde

Från föregående kapitel känner vi redan denna fråga:

```sql
SELECT AVG(ListPriceOre) FROM Product;
```

Genomsnittsberäkningen ger 11650 öre, så just nu skulle villkoret `WHERE ListPriceOre > 11650` hitta de dyrare produkterna. Det inmatade talet blir emellertid inaktuellt om priserna förändras. Därför låter vi i den färdiga frågan själva beräkningen stå där talet tidigare stod, så att jämförelsegränsen hämtas från de aktuella uppgifterna:

```sql
SELECT ProductID, ProductName, ListPriceOre
FROM Product
WHERE ListPriceOre > (
    SELECT AVG(ListPriceOre) FROM Product
)
ORDER BY ProductID;
```

Den inre frågan ger ett enda värde som den yttre frågan använder som jämförelsegräns. Resultatet innehåller 501 med priset 12900 och 504 med priset 14900. Vi behöver inte föreställa oss hur DBHS utför arbetet internt för att läsa frågan: det räcker att följa vad det inre resultatet betyder.

För denna användning ska underfrågan ge en kolumn och ett värde. Skriv inte en underfråga med flera produktrader efter `>` och hoppas att systemet väljer rätt jämförelse. SQLite kan i vissa sådana fall använda den första raden, medan andra system ger fel; ingetdera motsvarar den genomsnittsberäkning vi avsåg.

## 15.2 En uppsättning värden med <code>IN</code>

Anta i stället att vi vill se produkterna som finns på någon orderrad. Vi kan först hämta produktnumren från `OrderLine`. De är 501, 502, 501 och 503. Den yttre frågan ska behålla en produkt om dess nummer finns bland dessa värden:

```sql
SELECT ProductID, ProductName
FROM Product
WHERE ProductID IN (
    SELECT ProductID FROM OrderLine
)
ORDER BY ProductID;
```

Resultatet innehåller produkt 501, 502 och 503 en gång vardera. Det beror på att `IN` bara prövar om produktnumret *finns* i underlaget; hur många gånger numret förekommer där påverkar inte svaret. De två förekomsterna av 501 i underfrågan leder därför till att produkten väljs, men skapar ingen extra produktrad i det yttre resultatet.

Skillnaden mot `JOIN` i kapitel 13 ligger i vad vi ber frågan att göra. En sammanfogning bildar ett par för varje matchande orderrad, vilket gav produkt 501 två matchningar. Här frågar vi bara om produktnumret förekommer bland de beställda numren. När `IN` har besvarat den frågan behålls eller väljs den befintliga produktraden bort; ytterligare förekomster i underlaget skapar inga nya kopior av raden.

**Fyll i:** Vilken tabell och kolumn ska stå i underfrågan för att hitta kunder som har gjort någon beställning?

<details class="answer" markdown="1">
<summary>Visa lösning</summary>

```sql
SELECT CustomerID, CustomerName
FROM Customer
WHERE CustomerID IN (SELECT CustomerID FROM SalesOrder)
ORDER BY CustomerID;
```

Resultatet är kund 17 och 24. Lo Chen saknas eftersom kundnummer 31 inte finns i <code>SalesOrder</code>.
</details>

## 15.3 Jämför två mängder av produktnummer

Vi återanvänder mängderna från kapitel 10, så att det nya steget blir SQL-formuleringen. Produktnumren och deras överlapp är desamma; det är sättet att ta fram dem ur databasen som vi nu lägger till.

Vi lämnar nu underfrågorna och bildar två separata resultat:

* **A:** produkter vars listpris är minst 12000 öre, alltså {501, 504}.
* **B:** produkter som har beställts, alltså {501, 502, 503} när varje nummer räknas en gång.

<figure class="figure">
<div class="figure-viewport" tabindex="0" role="region" aria-label="Mängddiagram, rulla vid behov i sidled" style="--figure-width: 680px">
<img src="{{ '/assets/images/21-mangder.svg' | relative_url }}" alt="Venn-diagram: 504 finns bara i A, 501 finns i överlappet mellan A och B, och 502 samt 503 finns bara i B." width="680" height="300" loading="lazy" decoding="async">
</div>
<figcaption><strong>Figur 15.1.</strong> A är de dyrare produkterna och B de beställda. Numrens placering visar medlemskap, inte radpar mellan tabeller.</figcaption>
</figure>

Här passar ett Venn-diagram: ett produktnummer ligger i A, i B eller i båda. Tre operationer väljer olika delar av bilden:

| Operation | Vad behålls? | Produktnummer |
| --- | --- | --- |
| <code>UNION</code> | Allt i någon av cirklarna | 501, 502, 503, 504 |
| <code>INTERSECT</code> | Överlappet | 501 |
| A <code>EXCEPT</code> B | Den del av A som ligger utanför B | 504 |

## 15.4 Skriv en operation mellan två <code>SELECT</code>-frågor

Vi skriver först frågan för A och sedan frågan för B, med operationen mellan dem:

```sql
SELECT ProductID FROM Product WHERE ListPriceOre >= 12000
UNION
SELECT ProductID FROM OrderLine
ORDER BY ProductID;
```

`UNION` ger de fyra numren i tabellen ovan. Byt endast ordet <code>UNION</code> mot `INTERSECT` och kör igen: nu återstår 501. Byt till `EXCEPT`: nu återstår 504. På så sätt kan du kontrollera varje markerad del av Venn-diagrammet utan att ändra underlagen.

Vid `EXCEPT` behöver vi särskilt kontrollera vilken fråga som står först, eftersom operationen utgår från dess resultat. Om frågan för B placeras först börjar vi med de beställda produkterna och tar bort dem som också hör till den dyrare gruppen. Då återstår 502 och 503, medan den ursprungliga riktningen gav 504. `EXCEPT` betyder alltså ”ta från det första resultatet bort det som också finns i det andra”, inte ”ta allt som ligger utanför överlappet”.

<code>UNION</code>, <code>INTERSECT</code> och <code>EXCEPT</code> tar bort identiska resultatrader. Om upprepningar ska bevaras när två resultat läggs ihop finns även `UNION ALL`. Den varianten är bra att känna igen, men de tre mängdoperationerna ovan är utgångspunkten här.

## 15.5 Samma sorts uppgift på båda sidor

Mängdoperationer kräver lika många kolumner i båda resultaten. Kolumner i motsvarande positioner behöver också ha förenliga typer och, för att svaret ska bli meningsfullt, beskriva samma slags uppgift.

Anta att vi råkar förena kundnummer och produktnummer. Båda kan lagras som heltal, så systemet behöver inte protestera. Ett nummer i det förenade resultatet skulle emellertid vara svårt att tolka: identifierar det en kund eller en produkt? Precis som vid <code>JOIN</code> måste vi alltså kontrollera betydelsen utöver syntaxen.

När en mängdoperation jämför resultat med flera kolumner ingår alla dessa kolumner i jämförelsen. Två rader med samma produktnummer men olika namn räknas därför som olika rader. I våra första exempel har vi valt att bara ta med produktnumret, så att jämförelsen entydigt handlar om vilka produkter som förekommer.

## 15.6 Öva med böcker, lån och reservationer

**Start:** ladda `transfer-exercises.sql` enligt rutan ovan. Varje <code>BookID</code> betecknar här en registrerad bok i det förenklade biblioteket. Lånen gäller bok 201, 201 och 202; reservationerna gäller bok 202 och 203. Bok 204 förekommer inte i någon av dessa listor.

1. Visa böckernas titlar för boknummer som förekommer i `Loan`, med hjälp av <code>IN</code>.
2. Visa boknummer som förekommer i antingen `Loan` eller `Reservation`.
3. Visa boknummer som förekommer i båda.
4. Visa boknummer som är reserverade men aldrig förekommer bland lånen.

Rita gärna två överlappande cirklar och placera 201, 202 och 203 innan du skriver SQL. Formulera sedan vilken del av bilden varje fråga avser.

<details class="answer" markdown="1">
<summary>Visa SQL och förväntade boknummer</summary>

```sql
SELECT BookID, Title FROM Book
WHERE BookID IN (SELECT BookID FROM Loan)
ORDER BY BookID;
```

Fråga 1 visar böckerna 201 och 202 med deras titlar. Fråga 2 ger 201, 202 och 203:

```sql
SELECT BookID FROM Loan
UNION
SELECT BookID FROM Reservation
ORDER BY BookID;
```

Byt <code>UNION</code> till <code>INTERSECT</code> för fråga 3; då återstår 202. För fråga 4 behöver reservationerna stå först:

```sql
SELECT BookID FROM Reservation
EXCEPT
SELECT BookID FROM Loan
ORDER BY BookID;
```

Svaret är 203: boken finns bland reservationerna men saknas helt bland lånen. Bok 202 tas däremot bort ur reservationernas resultat eftersom den också förekommer i `Loan`. De två låneraderna för bok 201 ändrar inget i denna jämförelse, eftersom mängdoperationen prövar vilka boknummer som förekommer, inte hur många lån varje bok har.

</details>

<details class="extension" markdown="1">
<summary>Fördjupning: fråga om en matchning finns med <code>EXISTS</code></summary>

Byt här tillbaka till Nordic Brew-databasen med `nordicbrew-minimal.sql`. En alternativ formulering för beställda produkter är att för varje produkt fråga om någon orderrad matchar:

```sql
SELECT p.ProductID, p.ProductName
FROM Product AS p
WHERE EXISTS (
    SELECT 1 FROM OrderLine AS ol
    WHERE ol.ProductID = p.ProductID
)
ORDER BY p.ProductID;
```

<code>EXISTS</code> prövar om underfrågan ger minst en rad. `SELECT 1` innebär här att kolumninnehållet inte är det intressanta. Eftersom underfrågan hänvisar till `p.ProductID` från den yttre frågan kallas den korrelerad. Med <code>NOT EXISTS</code> hittar motsvarande fråga produkt 504 som saknar matchning. Den här konstruktionen behövs inte för grundövningarna ovan. Undvik att okritiskt ersätta den med <code>NOT IN</code>: om underfrågan kan innehålla <code>NULL</code> får den senare jämförelsen andra egenskaper.
</details>

## Kontrollfrågor

1. Vad är underfrågans resultat i avsnitt 15.1?
2. Varför får <code>IN</code>-frågan inte två rader för produkt 501?
3. Vilken del av Venn-diagrammet behåller <code>INTERSECT</code>?
4. Varför måste ordningen prövas noggrant vid <code>EXCEPT</code>?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Underfrågan beräknar produkternas genomsnittliga listpris och ger en rad med ett värde: 11650 öre. Den yttre frågan jämför sedan varje produktpris med detta värde och behåller 501 och 504. Genom att låta beräkningen ingå i frågan behöver vi inte skriva in en fast gräns som kan bli inaktuell när priserna ändras.

2. Den yttre frågan utgår från `Product`, där produkt 501 har en egen rad, och `IN` prövar om dess nummer förekommer i underfrågans resultat. Två förekomster av numret ger fortfarande samma svar på medlemskapsfrågan. Till skillnad från en `JOIN` bildas här inte en ny resultatrad för varje matchande orderrad.

3. `INTERSECT` behåller överlappet: de resultatkombinationer som finns på båda sidor. När vi bara visar produktnummer blir svaret 501, eftersom den produkten både kostar minst 120 kronor och har beställts. Om frågorna visar flera kolumner jämför operationen hela rader, inte bara ett särskilt nummer i dem.

4. `A EXCEPT B` kan bara behålla rader som fanns i A från början och tar bort dem som även finns i B. I vårt exempel återstår då 504. Om riktningen byts börjar vi i stället bland de beställda produkterna och får 502 och 503. Att byta ordning innebär alltså att ställa en annan fråga, inte bara att skriva samma operation på ett annat sätt.

</details>

## Sammanfattning

En underfråga kan ta fram ett värde eller en uppsättning värden som en annan fråga behöver. Union, snitt och differens kombinerar däremot förenliga frågeresultat som mängder. I båda fallen blir frågan lättare att förstå när delresultaten granskas var för sig och varje rad behåller en tydlig betydelse.