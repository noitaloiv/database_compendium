---
layout: default
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

Två kunder kan heta Samir Noor. En kund kan byta e-postadress. Ett produktnamn
kan ändras när marknadsföringen görs om. Hur kan databasen ändå veta vilken
kund, produkt eller beställning en rad beskriver?

Vi behöver **identifierare**: värden som skiljer en förekomst från alla andra
av samma slag.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- bedöma om ett värde fungerar som stabil identifierare;
- förklara primärnyckel och främmande nyckel;
- visa hur nyckelvärden skapar samband mellan tabeller.
</div>

## 4.1 Namn är sällan tillräckliga

Anta att tabellen innehåller följande kunder:

| CustomerID | CustomerName | Email |
| ---: | --- | --- |
| 17 | Samir Noor | samir.noor@example.test |
| 24 | Samir Noor | samir.n@example.test |

Namnet är inte unikt. E-postadressen är unik i just detta exempel, men kan
ändras. `CustomerID` har däremot skapats för att identifiera kunden i
databasen.

En användbar identifierare ska vara:

- **unik** – två kunder får inte ha samma värde;
- **obligatorisk** – varje kund måste ha ett värde;
- **stabil** – värdet bör inte behöva ändras när andra egenskaper ändras.

<figure class="figure">
  <img src="{{ '/assets/images/07-vad-identifierar-kunden.svg' | relative_url }}"
       alt="Tre möjliga sätt att känna igen en kund jämförs: namn är inte unikt, e-post kan ändras och CustomerID är unikt och stabilt."
       width="1040" height="480" loading="eager" decoding="async">
  <figcaption><strong>Figur 4.1.</strong> Ett värde kan vara beskrivande utan att vara en lämplig identifierare.</figcaption>
</figure>

{: .mistake }
> ”Unik i våra exempelrader” är inte samma sak som ”ska alltid vara unik”.
> Identifiering grundas i en verksamhetsregel, inte i en tillfällig datamängd.

## 4.2 Primärnyckeln

I en tabell väljs en identifierare till **primärnyckel**, förkortat `PK`.

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID
```

Primärnyckeln gör det möjligt att hänvisa till en bestämd rad även om namn,
adress eller andra egenskaper förändras.

Vissa identifierare finns redan i verksamheten, exempelvis ett ISBN för en
bokutgåva. Andra skapas av systemet, exempelvis `CustomerID`. Ett systemskapat
nummer är praktiskt, men det löser inte alla problem. Om verksamheten kräver
att varje e-postadress bara får tillhöra en kund måste även den regeln
kontrolleras.

## 4.3 Ett samband mellan två tabeller

Nordic Brew lagrar kunder och beställningar i skilda tabeller:

**Customer**

| CustomerID | CustomerName |
| ---: | --- |
| 17 | Mira Ek |
| 24 | Samir Noor |

**SalesOrder**

| OrderID | CustomerID | OrderDate |
| ---: | ---: | --- |
| 1042 | 17 | 2027-01-15 |
| 1043 | 17 | 2027-01-16 |
| 1044 | 24 | 2027-01-16 |

`CustomerID` i `SalesOrder` talar om vilken kund som gjorde beställningen.
Kolumnen är en **främmande nyckel**, förkortat `FK`, eftersom värdet hänvisar
till primärnyckeln i en annan tabell.

<figure class="figure">
  <img src="{{ '/assets/images/08-frammande-nyckel.svg' | relative_url }}"
       alt="Tabellerna Customer och SalesOrder där värdet 17 i SalesOrder.CustomerID kopplas till kunden med Customer.CustomerID 17."
       width="1040" height="520" loading="lazy" decoding="async">
  <figcaption><strong>Figur 4.2.</strong> Sambandet skapas av matchande nyckelvärden, inte av tabellernas placering på skärmen.</figcaption>
</figure>

Schemat kan skrivas:

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID

SalesOrder(OrderID, CustomerID, OrderDate)
PK: OrderID
FK: CustomerID -> Customer.CustomerID
```

Pilen betyder en logisk hänvisning. Den är inte en fysisk pil i databasfilen.

## 4.4 Vad händer om kunden saknas?

Anta att någon försöker registrera följande order:

| OrderID | CustomerID | OrderDate |
| ---: | ---: | --- |
| 1045 | 99 | 2027-01-17 |

Det finns ingen kund med `CustomerID = 99`. Om främmande nyckeln kontrolleras
ska raden avvisas. Regeln kallas **referentiell integritet**: en hänvisning ska
leda till en befintlig rad, om inte frånvaro uttryckligen är tillåten.

Regeln skyddar inte mot alla fel. Om order 1045 av misstag kopplas till kund 24
i stället för kund 17 finns båda nyckelvärdena och den tekniska kontrollen är
nöjd. Databasen kan upprätthålla uttryckta regler, men den kan inte gissa
användarens avsikt.

## 4.5 När en identifierare består av flera värden

En beställning kan innehålla flera produkter. Tabellen `OrderLine` kan använda
kombinationen av order och produkt som identifierare:

| OrderID | ProductID | Quantity |
| ---: | --- | ---: |
| 1042 | 501 | 2 |
| 1042 | 502 | 1 |

```text
OrderLine(OrderID, ProductID, Quantity)
PK: OrderID + ProductID
```

Detta är en **sammansatt nyckel**. Kombinationen måste vara unik, även om varje
värde kan upprepas var för sig. Konstruktionen uttrycker samtidigt regeln att
samma produkt förekommer högst en gång i en viss beställning.

Ett annat system kan ge varje orderrad ett separat `OrderLineID`. Det är också
möjligt, men då behövs fortfarande en separat regel om kombinationen
`OrderID + ProductID` ska vara unik.

## 4.6 Stanna upp och förutsäg

Tabellen `SalesOrder` innehåller tre rader för `CustomerID = 17`.

1. Bryter detta mot att `CustomerID` ska vara unikt i `Customer`?
2. Vilken kolumn måste vara unik i `SalesOrder`?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Nej. <code>Customer.CustomerID</code> är unik i tabellen Customer, men
  samma värde får förekomma i flera orderrader eftersom en kund kan göra flera
  beställningar. <code>SalesOrder.OrderID</code> är primärnyckel och måste vara
  unik i SalesOrder.</p>
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

## Kontrollfrågor

1. Varför är ett personnamn oftast en dålig primärnyckel?
2. Vad är skillnaden mellan primärnyckel och främmande nyckel?
3. Vad innebär referentiell integritet?
4. När kan en sammansatt nyckel vara rimlig?

## Prova senare i SQLite

När SQL har introducerats kan hela Nordic Brew-strukturen skapas med det
körbara underlaget [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}).
Du behöver inte förstå skriptets alla rader ännu; länken finns här för att
kapitlets tabeller och den senare implementationen ska gå att jämföra.

## Sammanfattning

- En identifierare ska vara unik, obligatorisk och helst stabil.
- Primärnyckeln identifierar en rad i den egna tabellen.
- En främmande nyckel hänvisar till en identifierad rad i en annan tabell.
- Referentiell integritet förhindrar hänvisningar till rader som saknas.
- En nyckel kan bestå av flera kolumner.