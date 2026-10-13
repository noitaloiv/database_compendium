---
layout: default
track: grundspar
prerequisites: "Kapitel 2: en databas är en organiserad datasamling."
focus: "Läs vad en rad, kolumn och cell betyder."
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

{% include chapter_guide.html %}

När många uppgifter ska registreras behöver de få en form som går att använda även efter att fler rader har tillkommit. I en **relationsdatabas** organiseras uppgifterna i tabeller, där varje kolumn har en bestämd betydelse och varje rad följer samma struktur. Likheten med ett kalkylblad ger en första ingång, men det centrala är vilka företeelser raderna beskriver och vilka regler som ska gälla för dem.

Hos Nordic Brew behöver kundernas namn och kontaktuppgifter få en sådan gemensam form. Genom att följa några kundrader ska vi se hur tabellens struktur hjälper oss att förstå ett enskilt värde och varför samma struktur behöver gälla när fler kunder tillkommer.

## 3.1 En tabell beskriver ett slags företeelse

För att Nordic Brew ska kunna hålla reda på sina kunder kan varje kund
representeras av en rad i en tabell som inledningsvis ser ut så här:

| <code>CustomerID</code> | <code>CustomerName</code> | <code>Email</code> |
| ---: | --- | --- |
| 17 | Mira Ek | mira@example.test |
| 24 | Samir Noor | samir@example.test |
| 31 | Lo Chen | lo@example.test |

Tabellen heter `Customer`, och namnet anger vilket slags företeelse raderna
beskriver. Varje **rad** motsvarar i detta fall en kund, medan varje **kolumn**
beskriver samma egenskap för samtliga kunder. En cell får därmed sin betydelse
genom mötet mellan raden och kolumnen: värdet `Mira Ek` hör både till kunden med
`CustomerID` 17 och till egenskapen `CustomerName`.

<figure class="figure" id="figur-3-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 3.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/05-tabellens-delar.svg' | relative_url }}" alt="Kundtabellen visar tre kunder. En rad markerar Samir Noor, medan en kolumn samlar kundernas e-postadresser." width="1040" height="500" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 3.1.</strong> En rad samlar uppgifter om en kund, medan en kolumn beskriver samma egenskap för alla kunder. <a href="{{ '/assets/images/05-tabellens-delar.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Att värden råkar ligga i ett rutnät är däremot inte tillräckligt för att de ska
bilda en väl utformad tabell. Problemet syns om olika slags rader blandas i
samma struktur:

| <code>Name</code> | <code>Value</code> |
| --- | --- |
| Mira Ek | Kund |
| Nordic Dark | Produkt |
| 2027-01-15 | Orderdatum |

Som kundregister är tabellen svår att använda eftersom en rad saknar en stabil betydelse. Den
första raden tycks beskriva en kund, den andra en produkt och den tredje ett
datum, vilket innebär att samma kolumn byter betydelse mellan raderna. Separata
tabeller för kunder, produkter och beställningar ger därför en tydligare
utgångspunkt.

## 3.2 Kolumnens namn är ett löfte

Om vi läser en kunds värde i kolumnen `Email` förväntar vi oss en e-postadress som hör till den kunden. Kolumnnamnet hjälper oss därmed att tolka värdet även om vi inte var med när det registrerades. Om samma kolumn i stället hette `Information` skulle vi behöva ytterligare förklaringar för att veta vad som hör hemma där.

Ett bra kolumnnamn behöver vara tillräckligt specifikt för att vägleda läsaren.
`OrderDate` är exempelvis tydligare än `Date`, eftersom namnet anger vilken
händelse datumet hör till. Namngivningen bör dessutom vara konsekvent mellan
tabeller, följa projektets valda språk och undvika tillfälliga
presentationsnamn som `BlueColumn`.

Modellerna och kodexemplen nedan använder därför engelska identifierare som
`Customer`, `OrderDate` och `ProductName`, medan förklaringarna är skrivna på
svenska.

## 3.3 En cell bör innehålla ett värde

Betrakta kolumnen `PhoneNumbers`:

| <code>CustomerID</code> | <code>PhoneNumbers</code> |
| ---: | --- |
| 17 | `070-1111111; 018-222222` |

Här har två telefonnummer lagrats som ett enda textvärde. Det gör det svårt att
söka efter ett visst nummer, kontrollera varje nummers format eller ange vilket
som är det primära. Om telefonnumren behöver hanteras var för sig bör
registreringen därför också skilja dem åt, exempelvis genom en separat tabell.

Detta betyder inte att all text måste delas upp. Om Nordic Brew aldrig behöver
behandla gatunamn och husnummer separat kan en leveransadress ibland hanteras
som ett sammanhållet värde. Strukturen ska följa de frågor och regler som
verksamheten faktiskt har.

## 3.4 Struktur och aktuellt innehåll

Vi behöver också skilja tabellens form från de uppgifter som råkar finnas i den just nu. Tabellens **schema** beskriver formen, bland annat dess namn, kolumner och regler för tillåtna värden. De registrerade raderna utgör däremot det aktuella innehållet. Den skillnaden gör det möjligt att lägga till en kund utan att varje gång behöva konstruera en ny sorts tabell.

Anta att `Customer` innehåller de tre kunderna från avsnitt 3.1. När Ada Lind registreras som kund 42 får tabellen en fjärde rad, men den har fortfarande samma kolumner och regler. Det är alltså innehållet som har förändrats. Om företaget i stället lägger till kolumnen `InvoiceReference`, så att en ny egenskap kan registreras för kunderna, ändras även schemat.

<figure class="figure" id="figur-3-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 3.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/06-schema-och-innehall.svg' | relative_url }}" alt="Customer har samma tre kolumner på måndag och tisdag. På tisdagen har en fjärde kund, Ada Lind, tillkommit." width="1040" height="470" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 3.2.</strong> En ny kund tillför en rad utan att tabellens schema behöver ändras. <a href="{{ '/assets/images/06-schema-och-innehall.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Ett förenklat schema kan skrivas:

```text
Customer(CustomerID, CustomerName, Email)
```

Notationen är inte färdig SQL, utan fungerar som ett kompakt sätt att beskriva
tabellens namn och kolumner innan implementationens detaljer läggs till.

## 3.5 Vilka värden får förekomma?

För att innehållet i en kolumn ska kunna tolkas konsekvent behöver det finnas regler för vilka värden som får lagras där. Om `Quantity` beskriver antalet beställda förpackningar är ett heltal större än noll en rimlig regel, medan `OrderDate` behöver representera ett datum. För `Email` behövs i stället text som verksamheten behandlar som en e-postadress. Reglerna skiljer sig alltså åt därför att kolumnerna beskriver olika slags uppgifter.

De tekniska kategorierna för värden kallas **datatyper**. Exempelvis kan både kundnummer och antal förpackningar lagras som heltal, men den gemensamma datatypen gör dem inte till samma slags uppgift. Vi kan meningsfullt summera antalet förpackningar i flera beställningar; att summera kundnumren skulle däremot inte ge motsvarande verksamhetsinformation. Datatypen behöver därför läsas tillsammans med kolumnens betydelse och övriga regler.

| Kolumn | Teknisk typ | Ytterligare verksamhetsregel |
| --- | --- | --- |
| `Quantity` | Heltal | Större än noll |
| `Email` | Text | En adress per kund i detta exempel |
| `OrderDate` | Datumrepresentation | Dagen då ordern registrerades |

Hur reglerna skrivs i SQL behandlas först när tabellerna ska implementeras. I
detta skede är poängen att datatypen bara utgör en del av strukturen och måste
kompletteras med den betydelse som verksamheten har gett kolumnen.

### När ett värde saknas

Tänk dig att Nordic Brew också vill registrera ett frivilligt telefonnummer. En kund kan då vara känd även om numret saknas. I SQL kan frånvaron markeras med `NULL`, som varken är siffran noll eller texten ”<code>NULL</code>”. Tabellen nedan visar hur ett sådant tillägg skulle kunna se ut; telefonkolumnen ingår inte i våra senare startfiler.

| <code>CustomerID</code> | <code>Phone</code> | Tolkning |
| ---: | --- | --- |
| 17 | 070-1111111 | Ett nummer finns registrerat |
| 24 | <code>NULL</code> | Något nummer har inte registrerats |

Att Samirs telefonnummer saknas berättar ännu inte varför det saknas. Han kanske inte har något nummer, kanske inte vill lämna ut det eller kanske ännu inte har blivit tillfrågad. Vilka av dessa orsaker systemet behöver skilja åt beror på vad registret ska användas till, men ingen av dem motiverar att vi hittar på ett nummer för att fylla cellen. När SQL introduceras återkommer vi till hur sådana saknade uppgifter kan sökas fram.

## 3.6 Radordningen är inte betydelse

När rader visas i ett kalkylblad är det lätt att använda deras positioner som referenser, exempelvis ”raden ovanför”. I en databas behöver vi kunna känna igen samma kund även om visningen sorteras om. Vi måste därför utgå från uppgifterna i raden och inte från dess nuvarande placering på skärmen.

Den ordning som visas på skärmen är inte en egenskap hos kunden eller beställningen. DBHS:et kan nämligen visa samma rader i en annan ordning nästa gång, om frågan inte uttryckligen begär sortering efter exempelvis namn eller datum. Därför behöver en rad kunna kännas igen oberoende av sin skärmposition.

Nästa kapitel visar hur **identifierare** gör det möjligt att skilja rader åt
och koppla samman tabeller.

## 3.7 Överföringsövning: ett bibliotek

Granska följande förslag:

| <code>Book</code> | <code>Details</code> | <code>Borrower</code> |
| --- | --- | --- |
| Databaser | 2023; 412 sidor | Mira, Samir |
| Python | 2025; 350 sidor | Lo |

1. Vad verkar varje rad representera?
2. Vilka celler innehåller flera uppgifter?
3. Föreslå tydligare kolumner.
4. Vilka data bör kanske ligga i andra tabeller?

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

Det första problemet är att ordet ”bok” inte har en bestämd betydelse i tabellen: det kan avse en titel, en utgåva eller ett fysiskt exemplar. Innan fler kolumner skapas behöver biblioteket därför bestämma vad en rad ska representera.

Därefter kan de blandade uppgifterna skiljas åt. Eftersom `Details` innehåller både utgivningsår och sidantal kan dessa få var sin kolumn, exempelvis `PublicationYear` och `PageCount`. På motsvarande sätt behöver listan i `Borrower` undersökas: om olika utlåningar ska kunna följas över tid behöver lånet och låntagaren beskrivas så att varje händelse och person går att identifiera. Ett bra första svar förklarar dessa skillnader; en fullständig tabellkonstruktion kan vänta tills betydelsen är klar.
</details>

## Innan du går vidare

Peka ut en rad och en kolumn i <code>Customer</code>. Formulera därefter skillnaden mellan att lägga till en kundrad och att lägga till en ny kolumn för telefonnummer.

## Kontrollfrågor

1. Vad ska en rad i tabellen `Customer` representera?
2. Vad skiljer schema från aktuellt innehåll?
3. Varför är `Information` ett svagt kolumnnamn?
4. Varför ska vi inte hänvisa till ”raden ovanför”?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. En rad ska representera en kund enligt den definition som används i just modellen. Kolumnerna beskriver då olika egenskaper hos samma kund, exempelvis kundnummer, namn och e-postadress. Om en rad i stället ibland beskriver en beställning och ibland en kund blir den svår att tolka, eftersom kolumnvärdena inte längre bildar samma slags påstående.

2. Schemat beskriver vilka kolumner tabellen har och hur raderna ska vara uppbyggda. Det aktuella innehållet är de rader som finns lagrade vid ett visst tillfälle. När Mira registreras tillkommer en kundrad utan att schemat behöver ändras; om alla kunder i stället ska kunna få en ny sorts uppgift kan själva strukturen behöva utvidgas.

3. Namnet `Information` säger inte vilket slags uppgift kolumnen ska innehålla. En användare kan skriva en adress och en annan en kommentar, vilket gör både tolkning och kontroll svårare. Ett namn som `Email` ger en tydligare förväntan, men behöver fortfarande kompletteras med en definition av vad adressen ska användas till.

4. Raderna har ingen beständig betydelse genom sin plats i en visad tabell. En annan sortering eller hämtning kan flytta det som nyss visades ovanför. För att hänvisa till samma kund behöver vi därför en identifierare som hör till kunden, inte en position som råkar gälla i ett visst gränssnitt.

</details>

## Sammanfattning

En tabells struktur gör det möjligt att tolka varje värde som en egenskap hos det som raden beskriver. Schemat anger formen, medan raderna kan förändras inom den. Tydliga kolumner och datatyper hjälper oss att hålla ordning på innehållet, men vi behöver också ange vad värdena betyder och hur saknade uppgifter ska förstås.