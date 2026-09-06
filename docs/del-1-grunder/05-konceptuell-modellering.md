---
layout: default
title: 5. Konceptuell modellering
parent: Del I – Modeller och relationer
nav_order: 5
permalink: /docs/del-1-grunder/konceptuell-modellering/
description: Från verksamhetens frågor till en avgränsad konceptuell modell.
keywords:
  - konceptuell modellering
  - informationsmodellering
  - ER
  - ERD
  - entitet
  - entity
  - attribut
  - association
  - relationship
---

# 5. Konceptuell modellering

I föregående kapitel använde vi färdiga tabeller. Men vem bestämmer vilka
tabeller som behövs? Var hör en leveransadress hemma? Är en kund alltid en
person, eller kan en organisation vara kund? Sådana frågor kan inte lösas genom
att välja en SQL-datatyp.

**Konceptuell modellering** används för att beskriva ett avgränsat
informationsbehov innan vi bestämmer tabeller och teknisk implementation.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- formulera syfte och avgränsning för en modell;
- skilja entitetstyp, entitet, attribut, identifierare och association;
- pröva en modell mot konkreta frågor och exempel.
</div>

## 5.1 En modell är en avsiktlig förenkling

En modell tar med det som behövs för ett visst syfte och lämnar annat utanför.
En karta över busslinjer visar hållplatser och byten men inte varje träd längs
vägen. En ritning över ett hus och en utrymningsplan beskriver samma byggnad på
olika sätt eftersom de stödjer olika uppgifter.

På samma sätt kan Nordic Brew beskriva kaffe som:

- en produkt som kunder kan beställa;
- ett lagersaldo;
- ett produktionsparti som kan återkallas;
- en råvara med ursprung och inköpsavtal.

Ingen av beskrivningarna är fullständig. Den relevanta modellen beror på vilket
arbete som ska stödjas.

{: .important }
> Ett korrekt ritat diagram kan fortfarande vara en dålig modell. Symbolerna
> måste uttrycka rätt begrepp och verksamhetsregler för det valda syftet.

## 5.2 Börja med syfte och gräns

Innan vi ritar skriver vi ett kort syfte:

> Modellen ska stödja registrering av kunder och beställningar samt visa vilka
> produkter, kvantiteter och avtalade priser som ingår i varje beställning.

Sedan avgränsar vi:

> Lager, leveranser, betalningar, kampanjer och produktionspartier ingår inte i
> den första modellen.

Avgränsningen är inte ett påstående om att dessa företeelser är oviktiga. Den
gör uppgiften hanterbar och visar vad modellen inte kan besvara.

<figure class="figure">
  <img src="{{ '/assets/images/09-fran-fraga-till-modell.svg' | relative_url }}"
       alt="En modelleringsprocess med verksamhetsfrågor, syfte och avgränsning, begrepp och regler samt en konceptuell modell som prövas mot exempel."
       width="1040" height="430" loading="eager" decoding="async">
  <figcaption><strong>Figur 5.1.</strong> Diagrammet är ett resultat av analysen, inte dess utgångspunkt.</figcaption>
</figure>

## 5.3 Entitetstyp och entitet

En **entitet** är en individuell förekomst som verksamheten behöver kunna
skilja från andra. Beställningen med ordernummer 1042 är en entitet.

En **entitetstyp** samlar förekomster som har gemensam betydelse och regler.
`SALES_ORDER` är en entitetstyp; order 1042 är en entitet av denna typ.

Entitetstyper behöver inte vara fysiska saker. En bokning, betalning eller
kursregistrering kan vara en entitet om individuella förekomster behöver
identifieras och beskrivas.

Vi namnger entitetstyper i singular och använder engelska identifierare:

```text
CUSTOMER
SALES_ORDER
PRODUCT
```

## 5.4 Attribut och identifierare

Ett **attribut** beskriver en egenskap hos en entitetstyp. För `PRODUCT` kan
`ProductName` och `CurrentListPrice` vara attribut.

En **konceptuell identifierare** visar hur verksamheten skiljer en förekomst
från en annan, exempelvis `ProductNumber`. I den konceptuella modellen märker
vi identifieraren `ID`, inte `PK`. Primärnyckel hör till den senare
tabellutformningen.

```text
PRODUCT
ID ProductNumber
   ProductName
   CurrentListPrice
```

Fråga om ett föreslaget attribut:

- beskriver det en förekomst av entitetstypen?
- kan det ha flera värden samtidigt?
- behöver det egen identitet eller egna samband?
- gäller värdet nu, eller ska historik bevaras?

En leveransadress kan vara ett attribut i en enkel modell. Om adresser behöver
återanvändas, historiseras eller valideras med egna regler kan `ADDRESS` i
stället behöva vara en entitetstyp. Modellvalet beror på kraven.

## 5.5 Associationer

En **association** beskriver hur entiteter hör samman. Vi namnger associationen
med ett verb så att den kan läsas som ett påstående:

```text
CUSTOMER places SALES_ORDER
```

Pilar eller linjer utan ett uttalat verb gör betydelsen lätt att misstolka.
Samma två entitetstyper kan dessutom ha flera associationer. En anställd kan
*leda* en avdelning och samtidigt *arbeta vid* en avdelning.

I nästa kapitel lägger vi till hur många förekomster som får delta. Här räcker
det att identifiera att sambandet finns och kunna formulera vad det betyder.

## 5.6 Ett mindre exempel: bibliotek

Ett bibliotek vill veta vilka fysiska exemplar som finns och vilka lån som har
gjorts. Följande frågor ska kunna besvaras:

- Vilken bokutgåva beskriver ett exemplar?
- Vem har lånat ett visst exemplar?
- När började lånet och när ska exemplaret återlämnas?

<figure class="figure">
  <img src="{{ '/assets/images/10-konceptuell-modell-bibliotek.svg' | relative_url }}"
       alt="Konceptuell biblioteksmodell med entity types BookEdition, Copy, Member och Loan samt namngivna associationer."
       width="1120" height="620" loading="lazy" decoding="async">
  <figcaption><strong>Figur 5.2.</strong> Biblioteket skiljer bokutgåvan från det fysiska exemplaret. Multiplicitet läggs till i nästa kapitel.</figcaption>
</figure>

Varför behövs både `BOOK_EDITION` och `COPY`? Tre exemplar kan ha samma ISBN,
titel och författare men olika streckkoder och olika lånehistorik. Om modellen
bara innehöll boken skulle biblioteket inte kunna ange vilket fysiskt exemplar
som lånats.

## 5.7 Från text till modell: Nordic Brew

Utgå från följande korta text:

> En kund kan göra beställningar. Varje beställning får ett ordernummer och ett
> orderdatum. Beställningen innehåller produkter. För varje beställd produkt
> registreras kvantitet och det pris som avtalades vid köpet.

### Steg 1: hitta möjliga begrepp

`CUSTOMER`, `SALES_ORDER` och `PRODUCT` framträder direkt. Men kvantitet och
avtalat pris beskriver inte produkten generellt. De gäller produkten **i en
bestämd beställning**. Därför behövs även begreppet `ORDER_LINE`.

### Steg 2: formulera associationerna

- `CUSTOMER places SALES_ORDER`;
- `SALES_ORDER contains ORDER_LINE`;
- `ORDER_LINE refers to PRODUCT`.

### Steg 3: placera attributen

`OrderDate` beskriver beställningen. `Quantity` och `AgreedUnitPrice`
beskriver orderraden. `CurrentListPrice` kan beskriva produkten, men får inte
ersätta det pris som faktiskt avtalades i en äldre order.

### Steg 4: pröva med ett scenario

Nordic Brew höjer listpriset på en produkt. Ska totalen för en redan gjord
beställning ändras? Nej. Scenariot visar varför `AgreedUnitPrice` hör till
orderraden.

## 5.8 Vanliga tidiga misstag

### Att börja med tabeller

Om analysen börjar med främmande nycklar riskerar tekniska vanor att bestämma
vilka verksamhetsbegrepp som syns. Börja med syfte, frågor och regler.

### Att göra varje substantiv till en entitetstyp

Ord i en text är kandidater, inte facit. ”Pris” är här ett attribut, medan en
separat prislista med giltighetsperioder kan behöva modelleras som egna
entiteter i ett annat syfte.

### Att blanda individ och typ

`PRODUCT` är en entitetstyp. Produkten `COF-250` är en individuell entitet.
Rutan i modellen beskriver typen, inte en enskild produkt.

## 5.9 Överföringsövning: vårdbokning

> En mottagning bokar patienter till besök hos vårdpersonal. Varje besök har
> en starttid. Ett besök kan senare avbokas. Diagnoser och journalanteckningar
> ingår inte i den första modellen.

1. Formulera modellens syfte och avgränsning.
2. Föreslå entitetstyper och konceptuella identifierare.
3. Föreslå relevanta attribut.
4. Namnge associationerna med verb.
5. Skriv två frågor som modellen ska kunna besvara.

## Kontrollfrågor

1. Varför måste modellens syfte anges?
2. Vad skiljer entitetstyp från entitet?
3. Varför märks en identifierare `ID` och inte `PK` i denna modell?
4. Varför är `AgreedUnitPrice` ett attribut hos `ORDER_LINE`?

## Sammanfattning

- Konceptuell modellering beskriver informationsbehov före teknisk design.
- Syfte och avgränsning avgör vad modellen ska innehålla.
- Entitetstyper beskriver slags företeelser; entiteter är individuella förekomster.
- Attribut beskriver egenskaper och associationer beskriver samband.
- Modellen ska prövas mot konkreta frågor och scenarier.