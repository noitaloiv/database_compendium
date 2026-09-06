---
layout: default
title: 3. Tabeller, rader och kolumner
parent: Del I – Modeller och relationer
nav_order: 3
permalink: /docs/del-1-grunder/tabeller-rader-kolumner/
description: Hur en relationell databas organiserar data i tabeller.
keywords:
  - tabell
  - table
  - rad
  - row
  - kolumn
  - column
  - schema
  - datatyp
  - relationsdatabas
---

# 3. Tabeller, rader och kolumner

En relationsdatabas organiserar data i **tabeller**. Det kan först likna ett
kalkylblad, men en databastabell har en uttalad struktur: varje rad beskriver
en förekomst av samma slags sak och varje kolumn har en bestämd betydelse.

Vi börjar med den praktiska tabellbilden. De mer formella orden *relation*,
*tupel* och *domän* kan introduceras senare, när de hjälper oss att resonera mer
precist.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- förklara vad tabell, rad, kolumn och schema betyder;
- granska om en tabell har en tydlig betydelse;
- skilja tabellens struktur från dess aktuella innehåll.
</div>

## 3.1 En tabell beskriver ett slags företeelse

Nordic Brew behöver hålla reda på kunder. En första tabell kan se ut så här:

| CustomerID | CustomerName | Email |
| ---: | --- | --- |
| 17 | Mira Ek | mira@example.test |
| 24 | Samir Noor | samir@example.test |
| 31 | Lo Chen | lo@example.test |

Tabellen heter `Customer`.

- Varje **rad** beskriver en kund.
- Varje **kolumn** beskriver samma egenskap för alla kunder.
- Varje cell innehåller ett värde som hör till radens kund och kolumnens
  betydelse.

<figure class="figure">
  <img src="{{ '/assets/images/05-tabellens-delar.svg' | relative_url }}"
       alt="Tabellen Customer med tabellnamn, tre kolumner och tre rader. En rad och en kolumn är markerade."
       width="1040" height="500" loading="eager" decoding="async">
  <figcaption><strong>Figur 3.1.</strong> Tabellnamnet anger vad raderna representerar; kolumnnamnen anger vilka egenskaper som registreras.</figcaption>
</figure>

Det räcker inte att värden råkar ligga i ett rutnät. Följande tabell blandar
olika slags rader:

| Name | Value |
| --- | --- |
| Mira Ek | Kund |
| Nordic Dark | Produkt |
| 2027-01-15 | Orderdatum |

Den är svår att använda eftersom en rad inte har en stabil betydelse. En bättre
utgångspunkt är separata tabeller för kunder, produkter och beställningar.

## 3.2 Kolumnens namn är ett löfte

Kolumnen `Email` lovar att varje registrerat värde ska tolkas som en
e-postadress till den kund som raden beskriver. Kolumnnamnet `Information`
skulle inte ge samma vägledning.

Bra kolumnnamn är:

- specifika nog att förstå, exempelvis `OrderDate` i stället för `Date`;
- konsekventa mellan tabeller;
- fria från tillfälliga presentationer som `BlueColumn`;
- skrivna på det språk och i den stil som projektet har valt.

I kompendiets modeller och kod använder vi engelska identifierare. Därför
skriver vi `Customer`, `OrderDate` och `ProductName`. Förklaringarna förblir
svenska.

## 3.3 En cell bör innehålla ett värde

Betrakta kolumnen `PhoneNumbers`:

| CustomerID | PhoneNumbers |
| ---: | --- |
| 17 | `070-1111111; 018-222222` |

Två telefonnummer har lagrats som en text. Det blir svårt att söka efter ett
visst nummer, kontrollera format eller ange vilket som är primärt. Om
telefonnummer behöver hanteras var för sig bör de registreras var för sig,
exempelvis i en separat tabell.

Detta betyder inte att all text måste delas upp. Om Nordic Brew aldrig behöver
behandla gatunamn och husnummer separat kan en leveransadress ibland hanteras
som ett sammanhållet värde. Strukturen ska följa de frågor och regler som
verksamheten faktiskt har.

## 3.4 Struktur och aktuellt innehåll

Tabellens **schema** beskriver den relativt stabila strukturen: tabellnamn,
kolumnnamn och regler för tillåtna värden. Raderna är tabellens aktuella
innehåll.

I dag kan `Customer` innehålla tre rader och i morgon fyra. Innehållet har då
ändrats, men strukturen är densamma. Om kolumnen `InvoiceReference` läggs till
har strukturen ändrats.

<figure class="figure">
  <img src="{{ '/assets/images/06-schema-och-innehall.svg' | relative_url }}"
       alt="Ett stabilt schema för Customer jämförs med tabellinnehåll vid två tidpunkter där en ny kund har lagts till."
       width="1040" height="470" loading="lazy" decoding="async">
  <figcaption><strong>Figur 3.2.</strong> Schemat anger formen; innehållet kan förändras utan att formen gör det.</figcaption>
</figure>

Ett förenklat schema kan skrivas:

```text
Customer(CustomerID, CustomerName, Email)
```

Notationen säger ännu inget om exakt SQL-syntax. Den ger oss bara ett kompakt
sätt att beskriva tabellens namn och kolumner.

## 3.5 Vilka värden får förekomma?

En kolumn behöver regler för vilka värden som är rimliga. `Quantity` kan
exempelvis vara ett heltal större än noll. `OrderDate` ska innehålla datum och
`Email` text som verksamheten behandlar som en e-postadress.

En **datatyp** anger en teknisk kategori, exempelvis heltal eller text. Men
datatypen uttrycker inte hela betydelsen. Både `CustomerID` och `Quantity` kan
vara heltal, trots att det inte är meningsfullt att addera dem.

| Kolumn | Teknisk typ | Ytterligare verksamhetsregel |
| --- | --- | --- |
| `Quantity` | Heltal | Större än noll |
| `Email` | Text | En adress per kund i detta exempel |
| `OrderDate` | Datumrepresentation | Dagen då ordern registrerades |

Detaljerna om hur sådana regler skrivs i SQL kommer senare. Här är poängen att
en tabell behöver både struktur och betydelse.

## 3.6 Radordningen är inte betydelse

I ett kalkylblad kan ”raden ovanför” kännas som en stabil referens. I en
databastabell ska rader i stället kunna kännas igen genom sina värden.

DBMS:et kan visa samma rader i en annan ordning nästa gång. Om ett resultat ska
sorteras efter namn eller datum måste frågan uttryckligen begära det. Vi får
alltså inte låta radens skärmposition betyda vilken kund eller order den är.

Nästa kapitel visar hur **identifierare** gör det möjligt att skilja rader åt
och koppla samman tabeller.

## 3.7 Överföringsövning: ett bibliotek

Granska följande förslag:

| Book | Details | Borrower |
| --- | --- | --- |
| Databaser | 2023; 412 sidor | Mira, Samir |
| Python | 2025; 350 sidor | Lo |

1. Vad verkar varje rad representera?
2. Vilka celler innehåller flera uppgifter?
3. Föreslå tydligare kolumner.
4. Vilka data bör kanske ligga i andra tabeller?

## Kontrollfrågor

1. Vad ska en rad i tabellen `Customer` representera?
2. Vad skiljer schema från aktuellt innehåll?
3. Varför är `Information` ett svagt kolumnnamn?
4. Varför ska vi inte hänvisa till ”raden ovanför”?

<details class="answer">
  <summary>Korta svar</summary>
  <ol>
    <li>En enskild kund.</li>
    <li>Schemat anger strukturen; innehållet är de rader som finns just nu.</li>
    <li>Namnet säger inte vilken egenskap eller betydelse värdena har.</li>
    <li>Visningsordningen är inte en stabil identifiering av raden.</li>
  </ol>
</details>

## Sammanfattning

- En tabell beskriver ett slags företeelse.
- Varje rad beskriver en förekomst och varje kolumn en bestämd egenskap.
- Schemat är strukturen; raderna är det föränderliga innehållet.
- Datatyper hjälper, men verksamhetsregler behövs för att uttrycka betydelsen.