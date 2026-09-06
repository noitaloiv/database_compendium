---
layout: default
title: 6. Multiplicitet och verksamhetsregler
parent: Del I – Modeller och relationer
nav_order: 6
permalink: /docs/del-1-grunder/multiplicitet/
description: Hur minsta och största deltagande uttrycker verksamhetsregler.
keywords:
  - multiplicitet
  - kardinalitet
  - cardinality
  - modalitet
  - min max
  - one to many
  - crow's foot
  - associationsklass
---

# 6. Multiplicitet och verksamhetsregler

Att `CUSTOMER` hör samman med `SALES_ORDER` berättar inte hur sambandet får se
ut. Kan en kund finnas utan beställning? Kan en beställning tillhöra två
kunder? För att svara behöver vi uttrycka associationens **multiplicitet**.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- läsa och skriva minsta och största deltagande som `min..max`;
- skilja reglerna en-till-en, en-till-många och många-till-många;
- upptäcka när ett samband behöver bli en egen entitetstyp.
</div>

## 6.1 Två frågor vid varje associationsände

För varje sida av en association frågar vi:

1. Vad är det minsta antalet förekomster som får delta?
2. Vad är det största antalet förekomster som får delta?

Vi använder fyra vanliga uttryck:

| Notation | Betydelse |
| --- | --- |
| `0..1` | ingen eller en |
| `1..1` | exakt en |
| `0..*` | ingen, en eller flera |
| `1..*` | minst en, möjligen flera |

Stjärnan betyder ”många” utan att ange en bestämd övre gräns.

## 6.2 Läs från en förekomst i taget

Betrakta regeln:

```text
CUSTOMER places SALES_ORDER
```

Nordic Brew har bestämt:

- varje beställning görs av exakt en kund;
- en kund kan finnas utan beställningar och kan senare göra flera.

<figure class="figure">
  <img src="{{ '/assets/images/11-lasa-multiplicitet.svg' | relative_url }}"
       alt="Associationen Customer places SalesOrder. Från en order läses exakt en customer och från en customer läses noll eller flera orders."
       width="1040" height="510" loading="eager" decoding="async">
  <figcaption><strong>Figur 6.1.</strong> Läs alltid en associationsände i taget och formulera resultatet som en mening.</figcaption>
</figure>

Det säkraste arbetssättet är:

1. välj en beställning;
2. fråga hur många kunder den får höra till;
3. välj därefter en kund;
4. fråga hur många beställningar kunden får ha.

Ordningen på symbolerna i ett visst ritverktyg är mindre viktig än att du kan
skriva de två verksamhetsmeningarna.

{: .mistake }
> Multiplicitet ska inte härledas från dagens rader. Att alla befintliga kunder
> råkar ha en order bevisar inte att varje framtida kund måste ha en order.

## 6.3 Minimum uttrycker om deltagande är obligatoriskt

Minimum är ofta den svåraste delen. Fråga efter randfall:

- Får en ny kund registreras före första beställningen?
- Får en kurs finnas innan någon student har registrerats?
- Får en order sparas utan en enda orderrad?
- Får en anställd sakna tilldelad avdelning under sin första arbetsdag?

Svaren är verksamhetsbeslut. De kan skilja sig mellan organisationer och över
tid.

### Exempel: kurs och student

En kurs kan erbjudas även om ingen student ännu är registrerad. En student kan
registreras på flera kurstillfällen.

```text
En COURSE_OFFERING har 0..* ENROLLMENT.
En ENROLLMENT gäller 1..1 COURSE_OFFERING.
```

Om universitetet kräver att ett kurstillfälle bara skapas efter första
registreringen skulle minimum ändras. Modellen måste dokumentera den valda
regeln, inte en förmodad naturlag.

## 6.4 Tre vanliga former

### En-till-en

En person kan ha högst ett aktuellt skåp och ett skåp kan vara tilldelat högst
en person. Båda maximum är ett. Minimum kan fortfarande vara noll på en eller
båda sidor.

### En-till-många

En kund kan göra flera beställningar, medan varje beställning görs av en kund.
Detta är den vanligaste formen i våra första exempel.

### Många-till-många

En student kan delta i flera kurstillfällen och ett kurstillfälle kan ha flera
studenter. Båda maximum är många.

I en konceptuell modell kan många-till-många vara korrekt. När sambandet har
egna egenskaper behöver det ofta beskrivas som en egen entitetstyp. Registrering
kan exempelvis ha `RegisteredAt` och `Grade`, vilka varken beskriver studenten
ensam eller kurstillfället ensamt.

## 6.5 Sambandet som egen entitetstyp

Nordic Brew behöver registrera `Quantity` och `AgreedUnitPrice` för varje
produkt i varje order. Därför modelleras `ORDER_LINE` mellan `SALES_ORDER` och
`PRODUCT`.

<figure class="figure">
  <img src="{{ '/assets/images/12-konceptuell-modell-nordicbrew.svg' | relative_url }}"
       alt="Konceptuell Nordic Brew-modell med Customer, SalesOrder, OrderLine och Product. Alla associationsändar visar min och max."
       width="1160" height="700" loading="lazy" decoding="async">
  <figcaption><strong>Figur 6.2.</strong> `ORDER_LINE` gör det möjligt att beskriva själva sambandet mellan en beställning och en produkt.</figcaption>
</figure>

Modellen uttrycker bland annat:

- varje `SALES_ORDER` görs av exakt en `CUSTOMER`;
- en `CUSTOMER` kan göra noll eller flera `SALES_ORDER`;
- varje `SALES_ORDER` innehåller minst en `ORDER_LINE`;
- varje `ORDER_LINE` avser exakt en `PRODUCT`;
- en `PRODUCT` kan finnas utan att ännu ha beställts.

Notera att `CustomerID` inte ritas in i `SALES_ORDER`. Det skulle vara en
främmande nyckel i en senare tabellmodell. Här uttrycks verksamhetssambandet med
associationen `places`.

## 6.6 Crow's Foot som alternativ syntax

Olika verktyg kan visa samma regler med Crow's Foot-symboler i stället för
`0..*` och `1..1`. Syntaxen förändrar inte verksamhetsregeln. Studenten ska
kunna läsa båda formerna, men kompendiets huvudnotation skriver `min..max`
explicit eftersom den gör minimum och maximum lätta att diskutera separat.

När du möter en obekant notation:

1. hitta symbolen för minimum;
2. hitta symbolen för maximum;
3. skriv regeln som två meningar;
4. pröva meningarna med ett tomt fall och ett fall med flera förekomster.

## 6.7 Modellkritik: två rimliga alternativ

Anta att en beställning får skapas som utkast innan produkter har lagts till.
Då kan sambandet mellan `SALES_ORDER` och `ORDER_LINE` behöva minimum noll:

```text
Utkast: en SALES_ORDER innehåller 0..* ORDER_LINE.
Bekräftad order: en SALES_ORDER innehåller 1..* ORDER_LINE.
```

Ett enda statiskt diagram kan inte alltid uttrycka att regeln beror på orderns
status. Två lösningar är möjliga:

- tillåt `0..*` i modellen och dokumentera att bekräftelse kräver minst en rad;
- modellera utkast och bekräftad order som tydligare skilda tillstånd eller
  begrepp senare i analysen.

Detta är inte ett notationsfel utan en fråga om modellens ambitionsnivå.

## 6.8 Överföringsövning: evenemangsbokning

En kulturförening arrangerar evenemang. Ett evenemang kan publiceras innan
någon bokat. En person kan göra flera bokningar. Varje bokning gäller ett
evenemang och kan omfatta flera biljetter av olika biljettyper.

1. Föreslå entitetstyper och namngivna associationer.
2. Ange `min..max` i båda riktningarna för varje association.
3. Identifiera ett samband som kan behöva egna attribut.
4. Skriv minst fyra verksamhetsmeningar som modellen uttrycker.
5. Beskriv en alternativ regel som skulle förändra multipliciteten.

## Kontrollfrågor

1. Vad skiljer minimum från maximum?
2. Varför läses en association i två riktningar?
3. Varför kan `ORDER_LINE` inte ersättas av ett attribut hos `PRODUCT`?
4. Vad är risken med att härleda multiplicitet från dagens data?

<details class="answer">
  <summary>Korta svar</summary>
  <ol>
    <li>Minimum anger om deltagande är obligatoriskt; maximum anger hur många som högst får delta.</li>
    <li>Regeln kan vara olika i de två riktningarna.</li>
    <li>Kvantitet och avtalat pris gäller produkten i en bestämd order.</li>
    <li>Dagens exempel kanske inte innehåller alla tillåtna randfall.</li>
  </ol>
</details>

## Sammanfattning

- Multiplicitet uttrycker minsta och största deltagande.
- Varje association ska kunna läsas som två verksamhetsmeningar.
- Minimum kräver frågor om tomma och valfria fall.
- Samband med egna egenskaper kan behöva modelleras som entitetstyper.
- Notationen är ett språk för reglerna; verksamhetsbetydelsen är det centrala.