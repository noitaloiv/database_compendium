---
layout: default
track: grundspar
prerequisites: "Kapitel 3: läs en tabell rad för rad."
focus: "Följ primärnycklar och främmande nycklar mellan två tabeller."
title: 4. Identifierare och samband
parent: Del I – Modeller och relationer
nav_order: 4
permalink: /docs/del-1-grunder/identifierare-och-samband/
description: Hur nycklar skiljer rader åt och kopplar samman tabeller.
keywords:
  - identifierare
  - identifier
  - primärnyckel
  - primary key
  - främmande nyckel
  - foreign key
  - PK
  - FK
  - referentiell integritet
---

# 4. Identifierare och samband

{% include chapter_guide.html %}

Två kunder kan heta Samir Noor, samtidigt som en och samma kund kan byta
e-postadress och en produkt kan få ett nytt namn när marknadsföringen görs om.
Om databasen enbart förlitade sig på sådana beskrivande uppgifter skulle det
därför vara svårt att veta vilken kund, produkt eller beställning en viss rad
avser. Lösningen är **identifierare**: värden som skiljer en förekomst från alla
andra av samma slag.

## 4.1 Namn är sällan tillräckliga

Anta att en ny kund har samma namn som kund 24. För att pröva hur identifieringen fungerar visar vi dessa två personer i ett separat exempel:

| <code>CustomerID</code> | <code>CustomerName</code> | <code>Email</code> |
| ---: | --- | --- |
| 24 | Samir Noor | samir@example.test |
| 42 | Samir Noor | samir.n@example.test |

Om en beställning bara hänvisade till namnet Samir Noor skulle vi inte veta vilken av de två kunderna som avses. E-postadresserna skiljer visserligen personerna åt i exemplet, men för att använda dem som identifierare måste verksamheten också bestämma att de alltid ska vara unika. Dessutom kan en kund byta adress. `CustomerID` har i stället tilldelats just för att vi ska kunna följa samma kund när sådana beskrivande uppgifter förändras.

För att fungera väl behöver en identifierare vara **unik**, så att två kunder
inte får samma värde, och **obligatorisk**, så att ingen kund lämnas utan
identifierare. Den bör dessutom vara **stabil**, eftersom hänvisningar till
kunden annars måste ändras när identifieraren byts ut.


<figure class="diagram">
<div class="table-wrapper"><table><thead><tr><th scope="col">Kandidat</th><th scope="col">Prövning</th><th scope="col">Konsekvens</th></tr></thead><tbody><tr><td><code>CustomerName</code></td><td>Kan två kunder heta samma sak? Ja.</td><td>Namnet räcker inte ensamt.</td></tr><tr><td><code>Email</code></td><td>Kan adressen ändras eller delas? Reglerna måste bestämmas.</td><td>Unikhet får inte tas för given.</td></tr><tr><td><code>CustomerID</code></td><td>Tilldelas ett unikt värde som inte ändras vid namnbyte.</td><td>Kan identifiera kundposten stabilt.</td></tr></tbody></table></div>
<figcaption><strong>Figur 4.1.</strong> Ett värde kan vara beskrivande utan att vara en lämplig identifierare.</figcaption>
</figure>

{: .mistake }
> ”Unik i våra exempelrader” är inte samma sak som ”ska alltid vara unik”.
> Identifiering grundas i en verksamhetsregel, inte i en tillfällig datamängd.

## 4.2 Primärnyckeln

När en identifierare väljs som tabellens huvudsakliga sätt att skilja rader åt kallas den **primärnyckel**, förkortat `PK`. I kundtabellen väljer vi `CustomerID`, så att varje registrerad kund kan pekas ut med sitt kundnummer:

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID
```

Genom primärnyckeln går det att hänvisa till en bestämd rad även när namn,
adress eller andra egenskaper förändras. Nyckeln fungerar därmed som tabellens
stabila svar på frågan ”vilken förekomst menar vi?”.

Vissa identifierare finns redan i verksamheten, som ett <code>ISBN</code> för en bokutgåva, medan andra skapas av systemet, som `CustomerID`. Ett sådant systemskapat nummer gör det praktiskt att skilja raderna åt, men ersätter inte andra verksamhetsregler. Om varje e-postadress exempelvis bara får tillhöra en kund behöver även den regeln kontrolleras, trots att kunderna redan har olika kundnummer.

## 4.3 Ett samband mellan två tabeller

Nordic Brew lagrar kunder och beställningar i skilda tabeller:

**<code>Customer</code>**

| <code>CustomerID</code> | <code>CustomerName</code> |
| ---: | --- |
| 17 | Mira Ek |
| 24 | Samir Noor |

**<code>SalesOrder</code>**

| <code>OrderID</code> | <code>CustomerID</code> | <code>OrderDate</code> |
| ---: | ---: | --- |
| 1042 | 17 | 2027-01-15 |
| 1043 | 24 | 2027-01-15 |
| 1044 | 17 | 2027-01-17 |

Titta på beställning 1042. Dess `CustomerID` har värdet 17, och genom att leta upp samma värde i `Customer` ser vi att beställningen hör till Mira Ek. Kolumnen i beställningstabellen fungerar alltså som en hänvisning till kundtabellens primärnyckel och kallas en **främmande nyckel**, förkortat `FK`. På det sättet kan flera beställningar höra till Mira utan att hennes namn och kontaktuppgifter behöver kopieras in på varje beställningsrad.

<figure class="figure" id="figur-4-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 4.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/08-frammande-nyckel.svg' | relative_url }}" alt="Order 1042 och 1044 har båda CustomerID 17 och pekar på samma kundrad för Mira Ek." width="1040" height="520" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 4.2.</strong> Två beställningar kan hänvisa till samma kund. Utsnittet visar Miras order 1042 och 1044; övriga order har lämnats utanför bilden. <a href="{{ '/assets/images/08-frammande-nyckel.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Schemat kan skrivas:

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID

SalesOrder(OrderID, CustomerID, OrderDate)
PK: OrderID
FK: CustomerID -> Customer.CustomerID
```

Pilen uttrycker en logisk hänvisning från ett attribut till ett annat; den ska
alltså inte föreställas som en fysisk pil som lagras i databasfilen.

## 4.4 Vad händer om kunden saknas?

Anta att någon försöker registrera följande order:

| <code>OrderID</code> | <code>CustomerID</code> | <code>OrderDate</code> |
| ---: | ---: | --- |
| 1045 | 99 | 2027-01-17 |

Eftersom det inte finns någon kund med `CustomerID = 99` leder hänvisningen
ingenstans. Om den främmande nyckeln kontrolleras ska beställningsraden därför
avvisas. Denna princip kallas **referentiell integritet** och innebär att en
hänvisning måste leda till en befintlig rad, såvida frånvaro inte uttryckligen
är tillåten.

Den främmande nyckeln kontrollerar att hänvisningen leder till en befintlig kund, men kan inte avgöra om användaren valde rätt kund. Om order 1045 av misstag kopplas till kund 24 i stället för kund 17 godkänns hänvisningen därför i båda fallen: båda kunderna finns. För att upptäcka misstaget behövs ett underlag som visar vem som faktiskt gjorde beställningen.

## 4.5 När en identifierare består av flera värden

Eftersom en beställning kan innehålla flera produkter behöver varje orderrad
skiljas från de övriga. Tabellen `OrderLine` kan göra detta genom att använda
kombinationen av order och produkt som identifierare:

| <code>OrderID</code> | <code>ProductID</code> | <code>Quantity</code> |
| ---: | --- | ---: |
| 1042 | 501 | 2 |
| 1042 | 502 | 1 |

```text
OrderLine(OrderID, ProductID, Quantity)
PK: OrderID + ProductID
```

Varken ordernumret eller produktnumret räcker här på egen hand. Order 1042 innehåller två produkter, samtidigt som produkt 501 kan förekomma på många olika order. Tillsammans kan `OrderID` och `ProductID` däremot identifiera en orderrad, under förutsättning att samma produkt förekommer högst en gång i varje order. Detta kallas en **sammansatt nyckel**: enskilda värden får upprepas, men hela kombinationen måste vara unik.

Det går också att ge varje orderrad ett separat `OrderLineID`. Då skiljer det numret raderna åt, men säger ingenting om huruvida samma produkt får finnas på två rader i samma order. Om verksamheten vill behålla regeln om högst en sådan rad behöver kombinationen `OrderID + ProductID` därför fortfarande kontrolleras separat. Nyckelvalet och verksamhetsregeln behöver överensstämma även när vi använder ett systemskapat nummer.

## 4.6 Stanna upp och förutsäg

Tabellen `SalesOrder` innehåller två rader för `CustomerID = 17`.

1. Bryter detta mot att `CustomerID` ska vara unikt i `Customer`?
2. Vilken kolumn måste vara unik i `SalesOrder`?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Nej. <code>Customer.CustomerID</code> är unik i tabellen <code>Customer</code>, men
  samma värde får förekomma i flera beställningsrader eftersom en kund kan göra flera
  beställningar. <code>SalesOrder.OrderID</code> är primärnyckel och måste vara
  unik i <code>SalesOrder</code>.</p>
</details>

## 4.7 Överföringsövning: kursregistrering

Ett universitet vill lagra studenter, kurstillfällen och registreringar.

```text
Student(StudentID, StudentName)
CourseOffering(OfferingID, CourseCode, Semester)
Enrollment(StudentID, OfferingID, RegisteredAt)
```

1. Föreslå primärnyckel för varje tabell.
2. Vilka främmande nycklar behövs i `Enrollment`?
3. Vad bör identifiera en registrering?
4. Vilken felaktig rad ska referentiell integritet kunna stoppa?

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

`StudentID` kan identifiera en student och `OfferingID` ett kurstillfälle. Registreringen behöver hänvisa till båda, så `Enrollment` får en främmande nyckel till vardera tabellen.

Anta nu att en student får registreras högst en gång på samma kurstillfälle. Då kan kombinationen `StudentID + OfferingID` identifiera registreringen: samma student får återkomma på andra kurstillfällen, men samma kombination får inte lagras två gånger. En registrering som hänvisar till en student eller ett tillfälle som saknas ska däremot avvisas av respektive främmande nyckel.

Om verksamheten senare behöver bevara flera registreringsperioder för samma student på samma tillfälle räcker inte den föreslagna kombinationen. Då behöver vi ompröva vad en rad betyder och hur de olika perioderna ska skiljas åt.
</details>

## Innan du går vidare

Följ beställning 1044 till kund 17 och förklara varför kundnumret får upprepas i <code>SalesOrder</code>. Gå tillbaka till exemplet om du blandar ihop beställningens identifierare med kundens.

## Kontrollfrågor

1. Varför är ett personnamn oftast en dålig primärnyckel?
2. Vad är skillnaden mellan primärnyckel och främmande nyckel?
3. Vad innebär referentiell integritet?
4. När kan en sammansatt nyckel vara rimlig?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Flera personer kan ha samma namn, och en person kan byta namn utan att bli en annan kund. Namnet ger därför vanligen varken säker entydighet eller en lämplig beständig hänvisning. Ett särskilt kundnummer kan skilja registreringarna åt, förutsatt att reglerna för hur numret tilldelas och används är tydliga.

2. Primärnyckeln identifierar en rad i den egna tabellen, medan en främmande nyckel hänvisar till en rad i en annan eller samma tabell. I exemplet identifierar `OrderID` beställningen och `CustomerID` på beställningen pekar ut kunden. Samma kundnummer kan därför finnas på flera beställningar utan att beställningarnas egna identiteter blandas ihop.

3. Referentiell integritet innebär att de hänvisningar som uttrycks med främmande nycklar följer sina regler. En beställning ska exempelvis inte kunna ange kundnummer 999 om någon sådan kund saknas. Skyddet kontrollerar att den angivna kunden finns; det avgör inte om just den kunden verkligen gjorde beställningen. Om hänvisningen måste anges behövs även ett krav på ett värde.

4. En sammansatt nyckel är rimlig när en kombination, snarare än en enskild del, identifierar det som raden beskriver. På en orderrad behöver vi både ordernummer och produktnummer om varje produkt får förekomma högst en gång på en viss order. Ordernumret ensamt skiljer inte produkterna åt, och produktnumret ensamt skiljer inte beställningarna åt.

</details>

## Prova senare i SQLite

När SQL har introducerats kan hela Nordic Brew-strukturen skapas med det
körbara underlaget [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}).
Du behöver inte förstå skriptets alla rader ännu; länken finns här för att
kapitlets tabeller och den senare implementationen ska gå att jämföra.

## Sammanfattning

En primärnyckel identifierar raden, medan en främmande nyckel gör det möjligt att hänvisa till en identifierad rad. Därmed kan uppgifter om kunder och beställningar hållas åtskilda utan att sambandet försvinner. Nyckelvalet måste följa verksamhetens regler: ibland räcker ett värde, ibland behövs en kombination.