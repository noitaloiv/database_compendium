---
layout: default
track: grundspar
prerequisites: "Kapitel 4 och 7: primärnyckel och relationsschema."
focus: "Avgör vilket attributvärde som bestämmer vilket annat."
title: 8. Funktionella beroenden och redundans
parent: Del I – Modeller och relationer
nav_order: 8
permalink: /docs/del-1-grunder/funktionella-beroenden/
description: Hur upprepade fakta, ändringsproblem och funktionella beroenden används för att granska ett relationsschema.
keywords:
  - funktionellt beroende
  - functional dependency
  - determinant
  - redundans
  - uppdateringsanomali
  - insättningsanomali
  - raderingsanomali
  - kandidatnyckel
---

# 8. Funktionella beroenden och redundans

{% include chapter_guide.html %}

Det går att skapa en enda tabell som innehåller ordernummer, kunduppgifter,
produktuppgifter och kvantitet. Tabellen kan till och med ge rätt svar på flera
frågor. Problemet visar sig först när innehållet förändras: ett produktnamn
måste kanske uppdateras på tjugo ställen, en ny kund kan inte registreras innan
en order finns och borttagningen av en order kan råka radera den enda sparade
uppgiften om kunden.

För att förstå varför problemen uppstår behöver vi undersöka vad varje uppgift beskriver. Kundnamnet hör exempelvis till kunden, medan kvantiteten hör till en viss produkt i en viss order. Med **funktionella beroenden** kan vi uttrycka sådana skillnader mer precist och använda dem för att granska tabellens struktur.

## 8.1 När samma faktum lagras flera gånger

Anta att Nordic Brew exporterar följande platta ordertabell:

| <code>OrderID</code> | <code>OrderDate</code> | <code>CustomerID</code> | <code>CustomerName</code> | <code>ProductID</code> | <code>ProductName</code> | <code>Quantity</code> |
| ---: | --- | ---: | --- | ---: | --- | ---: |
| 1042 | 2027-01-15 | 17 | Mira Ek | 501 | Brew coffee 500 g | 2 |
| 1042 | 2027-01-15 | 17 | Mira Ek | 502 | Espresso blend 250 g | 1 |
| 1043 | 2027-01-15 | 24 | Samir Noor | 501 | Brew coffee 500 g | 1 |
| 1043 | 2027-01-15 | 24 | Samir Noor | 503 | Decaf coffee 250 g | 3 |

Varje rad beskriver en produkt i en order, vilket innebär att kombinationen
`OrderID + ProductID` kan identifiera raden. Samtidigt upprepas orderdatum och
kunduppgifter för varje produkt i samma order, medan produktnamnet upprepas i
varje order där produkten förekommer.

Att ett värde upprepas innebär inte automatiskt att strukturen är problematisk. Produktnumret `501` behöver exempelvis få förekomma på flera orderrader för att visa att samma produkt har beställts flera gånger. Risken uppstår när också uppgiften om produktens aktuella namn lagras i flera redigerbara kopior, eftersom dessa kopior kan börja säga olika saker om *samma självständiga faktum*.

## 8.2 Tre slags ändringsproblem

Föreställ dig att Nordic Brew ändrar namnet på produkten Brew coffee 500 g. I den platta tabellen måste ändringen då göras på varje rad med `ProductID = 501`; om en enda kopia missas får samma produkt två motstridiga namn i databasen. Det är denna risk vid en till synes enkel ändring som kallas en **uppdateringsanomali**.

Samma struktur blir besvärlig när en ny produkt ska registreras innan någon har beställt den. Eftersom varje rad också kräver ett `OrderID` saknar produkten en naturlig plats, trots att produktuppgifterna redan är kända. Om vi därför måste hitta på en order eller lämna ovidkommande uppgifter tomma för att kunna registrera produkten har vi en **insättningsanomali**.

Problemet kan även visa sig när något tas bort. Om order 1043 är Samir Noors enda order och dess sista rad raderas, försvinner också den enda sparade uppgiften om kunden Samir. En borttagning som bara skulle gälla ordern tar därmed med sig ett annat faktum som fortfarande behövs, vilket kallas en **raderingsanomali**.

<figure class="diagram">
<div class="table-wrapper"><table><thead><tr><th scope="col">Ändring</th><th scope="col">Problem i den platta ordertabellen</th></tr></thead><tbody><tr><td>Uppdatera ett produktnamn</td><td>Namnet måste ändras på alla orderrader som beskriver produkten.</td></tr><tr><td>Registrera en produkt före första ordern</td><td>Det finns ingen meningsfull orderrad att placera uppgifterna i.</td></tr><tr><td>Radera kundens sista order</td><td>Kundens enda registrerade namn riskerar att försvinna samtidigt.</td></tr></tbody></table></div>
<figcaption><strong>Figur 8.1.</strong> De tre anomalierna är olika följder av samma grundproblem: flera självständiga fakta har pressats in i samma slags rad.</figcaption>
</figure>

En sådan anomali behöver inte utlösa något felmeddelande. Databashanteringssystemet kan mycket väl tillåta att en produkt förekommer med två olika namn, om inget angivet villkor förbjuder det. Problemet är då att strukturen gör det svårt att hålla ett gemensamt faktum korrekt när data ändras. För att förebygga det behöver vi undersöka var uppgifterna lagras och vilka regler tabellerna uttrycker.

## 8.3 Ett värde bestämmer ett annat

Ett **funktionellt beroende** uttrycker att ett värde, eller en kombination av
värden, entydigt bestämmer ett annat värde. Notationen

```text
CustomerID -> CustomerName
```

läses ”`CustomerID` bestämmer `CustomerName`”. Om två rader har samma
`CustomerID` måste de, enligt den antagna verksamhetsregeln, också ha samma
`CustomerName`. Vänstersidan kallas **determinant**, eftersom den bestämmer
värdet på högersidan.

Börja med produktnummer 501 och jämför de orderrader där numret förekommer. Produktnamnet behöver vara detsamma på båda raderna, eftersom numret enligt modellen betecknar en bestämd produkt. Kvantiteten får däremot vara 2 i den ena beställningen och 1 i den andra. Det är alltså betydelsen av uppgifterna som gör att `ProductID` bestämmer `ProductName` men inte `Quantity`; pilen är vårt sätt att skriva den skillnaden.

**Fyll i:** Om namnet byts på produkt 501, får bara den ena av dess två kopior ändras? Om samma produkt beställs igen, måste antalet vara detsamma som tidigare?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

När namnet beskriver produktens aktuella namn behöver alla kopior överensstämma. Antalet gäller däremot en viss orderrad och får skilja sig mellan beställningarna. Namnbytet visar varför faktumet om produktnamnet bör få en egen plats.
</details>

Med den skillnaden i minnet kan vi formulera beroendena för den platta ordertabellen:

```text
OrderID -> OrderDate, CustomerID
CustomerID -> CustomerName
ProductID -> ProductName
OrderID, ProductID -> Quantity
```

Det sista beroendet säger att kvantiteten hör till kombinationen av en bestämd
order och en bestämd produkt. Varken ordernumret eller produktnumret räcker
ensamt: samma order kan innehålla flera produkter och samma produkt kan ha
olika kvantitet i olika order.

{: .important }
> Funktionella beroenden ska härledas från betydelsen och reglerna, inte bara
> från de rader som råkar finnas just nu. Två kolumner kan sammanfalla i ett
> litet exempel utan att den ena alltid bestämmer den andra.

## 8.4 Nycklar och determinanter

En **kandidatnyckel** är en minimal uppsättning attribut som entydigt bestämmer
alla andra attribut i relationen. Ordet *minimal* betyder att inget attribut kan tas bort utan att identifieringen går förlorad; det kräver inte att alla kandidatnycklar har lika många attribut. I vårt exempel: om `<code>OrderID</code> +
<code>ProductID</code>` räcker för att identifiera en orderrad är även `<code>OrderID</code> + <code>ProductID</code>
+ <code>ProductName</code>` unikt, men det extra attributet behövs inte och kombinationen är
därför ingen kandidatnyckel.

Det kan finnas flera sätt att entydigt identifiera samma rad. Om verksamheten exempelvis kräver både unika kundnummer och unika e-postadresser kan båda vara kandidatnycklar i kundrelationen. När vi väljer kundnumret som primärnyckel upphör inte kravet på unika e-postadresser. Den alternativa kandidatnyckelns regel behöver fortfarande upprätthållas, så att schemat bevarar de antaganden analysen bygger på.

Att ett attribut bestämmer något annat innebär däremot inte att det identifierar hela raden. I den platta ordertabellen räcker `CustomerID` för att bestämma kundnamnet, men samma kund kan ha många order med många produkter. Kundnumret kan därför inte peka ut en viss orderrad. Just den skillnaden hjälper oss att upptäcka att tabellen samlar uppgifter om flera slags företeelser.

## 8.5 Fullständiga, partiella och transitiva beroenden

Utgå återigen från kandidatnyckeln `OrderID + ProductID` och fråga vilka delar som behövs för att bestämma ett värde. För `Quantity` behöver vi båda: att känna till ordern säger inte vilken produktmängd som avses, och att känna till produkten säger inte på vilken order den beställdes. Kvantiteten är därför **fullständigt beroende** av den sammansatta nyckeln.

För produktnamnet ser resonemanget annorlunda ut. Så snart `ProductID` är känt vet vi vilket aktuellt produktnamn som ska visas, oavsett på vilken order produkten förekommer. Eftersom en del av den sammansatta nyckeln räcker kallas detta ett **partiellt beroende**. Orderdatumet har motsvarande egenskap: det bestäms av `OrderID`, medan produktnumret inte tillför något som behövs för att bestämma datumet.

Kundnamnet följer en längre kedja:

```text
OrderID -> CustomerID -> CustomerName
```

När ordernumret är känt kan vi först avgöra vilken kund ordern gäller och därefter vilket namn den kunden har. Kundnamnet bestäms på så sätt genom kundnumret, vilket ger ett **transitivt beroende**. I en relation med en rad per order är `CustomerID` inte nyckel, eftersom samma kund får göra flera order. Det är därför kundens namn kan komma att upprepas på flera orderrader trots att varje order har ett eget nummer.

<figure class="figure" id="figur-8-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 8.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/31-beroenden.svg' | relative_url }}" alt="Produktnumret bestämmer produktnamnet. Ordernumret bestämmer kundnumret och därigenom kundnamnet. Ordernummer tillsammans med produktnummer bestämmer kvantiteten." width="900" height="470" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 8.2.</strong> Pilarna visar beroenden mellan värden, inte främmande nycklar eller en tidsföljd. Kvantiteten behöver hela kombinationen av order och produkt. <a href="{{ '/assets/images/31-beroenden.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Begreppen hjälper oss att diagnostisera strukturen, men de är inte mål i sig.
Det avgörande är att se vilket faktum varje attribut beskriver och var det bör
lagras för att slippa motstridiga kopior.

## 8.6 Historiska värden kan medvetet skilja sig

Anta att `Product` har attributet `ListPriceOre`, medan den platta
ordertabellen även innehåller `AgreedUnitPriceOre`. Det vore lätt att betrakta
de två priserna som onödig dubbellagring, men de beskriver olika fakta.
Listpriset beskriver vad produkten kostar nu, medan det avtalade priset
beskriver vad kunden skulle betala i en bestämd order.

Om listpriset ändras ska äldre order alltså inte skrivas om. Beroendet är

```text
OrderID, ProductID -> AgreedUnitPriceOre
```

snarare än `ProductID -> AgreedUnitPriceOre`. Exemplet visar varför en analys
som enbart letar efter liknande kolumnnamn riskerar att ta bort betydelsefull
historik.

## 8.7 Stanna upp och förutsäg

I den platta ordertabellen råkar varje kund hittills bara ha gjort en order.
Kan vi därför skriva `CustomerID -> OrderID`?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Nej. De aktuella raderna visar bara ett tillfälligt sammanträffande. Om
  verksamhetsregeln tillåter en kund att göra flera order kan samma
  <code>CustomerID</code> senare höra samman med flera <code>OrderID</code>, och
  då gäller inte beroendet.</p>
</details>

## 8.8 Överföringsövning: evenemang och lokaler

En förening har samlat följande uppgifter i en relation:

```text
EventBooking(EventID, EventName, VenueID, VenueName,
             VenueCapacity, BookingDate, OrganizerID, OrganizerName)
```

Anta att varje evenemang har en arrangör och bokas i en lokal, att en lokal kan
användas av flera evenemang och att en arrangör kan ansvara för flera
evenemang.

1. Föreslå en kandidatnyckel.
2. Formulera minst fyra funktionella beroenden.
3. Ge exempel på en uppdateringsanomali.
4. Vilket faktum kan gå förlorat om det sista evenemanget i en lokal tas bort?
5. Identifiera ett transitivt beroende.

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

Om en rad gäller ett evenemangs enda aktuella lokalbokning kan `EventID` vara kandidatnyckel. Med det antagandet får vi följande grundläggande beroenden:

| Bestämmande attribut | Bestämmer |
| --- | --- |
| <code>EventID</code> | <code>EventName</code>, <code>VenueID</code>, <code>BookingDate</code>, <code>OrganizerID</code> |
| <code>VenueID</code> | <code>VenueName</code>, VenueCapacity |
| <code>OrganizerID</code> | <code>OrganizerName</code> |

Lokalens namn och kapacitet beskriver alltså lokalen, även när de upprepas på flera evenemangsrader. Om namnet ändras i bara några av kopiorna blir registreringarna motstridiga, och om lokalens sista evenemang tas bort riskerar också lokaluppgifterna att försvinna. Kedjan `EventID → VenueID → VenueName` visar det transitiva beroendet bakom namnkopiorna.

Slutsatsen bygger på vår definition av raden. Om ett evenemang i stället får ha flera lokalbokningar behöver både radbetydelsen och kandidatnyckeln omprövas.
</details>

## Innan du går vidare

Pröva påståendet <code>ProductID</code> → <code>Quantity</code> genom att tänka dig samma produkt på två olika order. Om antalet får skilja sig är det inte ett giltigt beroende.

## Kontrollfrågor

1. Varför är varje upprepning inte automatiskt problematisk?
2. Vad skiljer en uppdateringsanomali från en raderingsanomali?
3. Varför kan funktionella beroenden inte avgöras enbart från exempeldata?
4. Vad innebär det att ett beroende är partiellt?
5. Varför bestämmer `CustomerID` inte hela den platta orderraden?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. En upprepad främmande nyckel kan vara nödvändig för att flera beställningar ska kunna hänvisa till samma kund. Problemet uppstår när samma aktuella faktum, exempelvis kundens e-postadress, får flera oberoende redigerbara kopior. Då kan en ändring ge motstridiga uppgifter om kopiorna inte hålls samstämmiga. Vi behöver alltså fråga vad som upprepas och varför.

2. Vid en uppdateringsanomali måste samma faktum ändras på flera ställen och riskerar att bli motsägelsefullt, exempelvis när ett produktnamn rättas på bara en orderrad. Vid en raderingsanomali försvinner information vi ville behålla när en annan uppgift tas bort. Om sista orderraden också var enda platsen för produktnamnet kan en radering exempelvis förlora produktens beskrivning.

3. Ett funktionellt beroende ska gälla i alla tillåtna tillstånd, inte bara i de rader vi råkar se. Två kunder kan ha olika namn i dagens data utan att verksamheten förbjuder namnlika kunder. För att hävda att ett värde bestämmer ett annat behöver vi därför stöd i definitionerna och reglerna, och bör pröva om ett tillåtet motexempel finns.

4. Beroendet är partiellt i förhållande till en sammansatt kandidatnyckel när en riktig del av nyckeln räcker för att bestämma attributet. I den platta orderrelationen behövs exempelvis bara `ProductID` för att bestämma `ProductName`, trots att hela raden identifieras av `OrderID` tillsammans med `ProductID`. Namnet beskriver alltså produkten oberoende av ordern.

5. Samma kund kan ha flera beställningar och varje beställning kan innehålla flera produkter. `CustomerID` bestämmer därför kundens uppgifter, men inte vilken order, produkt eller kvantitet en viss rapporterad rad gäller. En determinant behöver inte identifiera hela raden: den kan bestämma enbart vissa av dess attribut.

</details>

## Sammanfattning

Funktionella beroenden beskriver vilka attributvärden som bestämmer andra. Genom att följa dessa beroenden kan vi upptäcka när en tabell blandar fakta om exempelvis kunden, produkten och orderraden. Det problematiska är flera redigerbara kopior av samma självständiga faktum; ett historiskt avtalat pris kan däremot behöva skilja sig från dagens listpris.