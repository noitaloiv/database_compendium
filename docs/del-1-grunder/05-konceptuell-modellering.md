---
layout: default
track: grundspar
prerequisites: "Kapitel 1–4: skilj betydelse, företeelse och identifierare."
focus: "Gå från en kort verksamhetsbeskrivning till definierade begrepp."
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

{% include chapter_guide.html %}

I föregående kapitel utgick vi från färdiga tabeller, men innan sådana tabeller
kan skapas måste någon avgöra vad de ska representera. Var hör exempelvis en
leveransadress hemma, och ska ordet kund bara omfatta personer eller även
organisationer? Den typen av frågor kan inte besvaras genom att välja en
SQL-datatyp, eftersom de handlar om verksamhetens begrepp snarare än om teknisk
lagring.

Med **konceptuell modellering** försöker vi reda ut sådana betydelser och beskriva hur de hör ihop. Arbetet börjar i ett avgränsat informationsbehov och hjälper oss att avgöra vad systemet behöver kunna representera. Först därefter väljer vi hur representationen ska genomföras i tabeller och programvara.

## 5.1 En modell är en avsiktlig förenkling

En modell hjälper oss att undersöka något genom att välja ut vissa aspekter och lämna andra utanför. En karta över busslinjer visar exempelvis hållplatser och bytesmöjligheter, eftersom de behövs för att planera en resa, men behöver inte visa varje träd längs vägen. På motsvarande sätt kan en ritning och en utrymningsplan beskriva samma byggnad med olika innehåll: de är avsedda att stödja olika uppgifter.

På samma sätt kan Nordic Brew beskriva kaffe som en produkt som kunder kan
beställa, ett lagersaldo, ett produktionsparti som kan återkallas eller en
råvara med ett visst ursprung och inköpsavtal. Beskrivningarna motsäger inte
varandra, men framhäver olika delar av verksamheten.

Eftersom ingen enskild beskrivning är fullständig måste modellens innehåll
avgöras utifrån det arbete och de frågor som den är avsedd att stödja.

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

Avgränsningen innebär inte att lager, leveranser och betalningar är oviktiga.
Den gör i stället analysen hanterbar och tydliggör vilka frågor den första
modellen inte är avsedd att besvara. Om syftet senare förändras kan även
avgränsningen behöva omprövas.

<figure class="figure" id="figur-5-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 5.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/09-fran-fraga-till-modell.svg' | relative_url }}" alt="Arbetet går från informationsbehov via syfte, avgränsning och begreppsanalys till en modell som prövas mot exempel. En återkoppling visar att analysen kan behöva revideras." width="1040" height="430" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 5.1.</strong> Diagrammet växer fram ur analysen och prövas sedan mot verksamhetens frågor. <a href="{{ '/assets/images/09-fran-fraga-till-modell.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 5.3 Entitetstyp och entitet

En **entitet** är en individuell förekomst som verksamheten behöver kunna
skilja från andra, såsom beställningen med ordernummer 1042. En
**entitetstyp** samlar i sin tur förekomster som har gemensam betydelse och
gemensamma regler. `SALES_ORDER` är alltså entitetstypen, medan order 1042 är
en enskild entitet av den typen.

Det är informationsbehovet som avgör vad som behöver en egen identitet. Därför kan även händelser som bokningar, betalningar och kursregistreringar vara entiteter. Om två bokningar gäller samma person och rum men olika tidpunkter behöver vi kunna skilja dem åt, trots att ingen ny fysisk sak har uppstått.

Vi namnger entitetstyper i singular och använder engelska identifierare:

```text
CUSTOMER
SALES_ORDER
PRODUCT
```

## 5.4 Attribut och identifierare

Ett **attribut** beskriver en egenskap hos en entitetstyp. För `PRODUCT` kan
exempelvis `ProductName` och `ListPriceOre` fungera som attribut, eftersom båda
värdena beskriver en bestämd produkt.

För att kunna tala om en viss produkt behöver vi dessutom ett sätt att skilja den från andra. En **konceptuell identifierare**, exempelvis `ProductID`, uttrycker hur det görs i modellen. Vi märker den med `ID` för att visa att vi fortfarande beskriver verksamhetens förekomster. Begreppet primärnyckel används senare, när vi bestämmer hur dessa förekomster ska representeras som tabellrader.

```text
PRODUCT
ID ProductID
   ProductName
   ListPriceOre
```

Det är inte alltid självklart om något bör vara ett attribut eller en egen
entitetstyp. Ett förslag kan prövas genom att fråga om värdet beskriver en
förekomst, om flera värden kan förekomma samtidigt, om det behöver en egen
identitet eller egna samband och om historiska värden ska bevaras.

En leveransadress kan mot den bakgrunden fungera som ett attribut i en enkel
modell. Om adresser däremot behöver återanvändas, historiseras eller valideras
med egna regler kan `ADDRESS` behöva bli en egen entitetstyp. Det finns således
inte ett generellt svar som är rätt oberoende av syftet.

## 5.5 Associationer

En **association** beskriver hur entiteter hör samman och namnges lämpligen med
ett verb, så att linjen kan läsas som ett meningsfullt påstående:

```text
CUSTOMER places SALES_ORDER
```

Anta exempelvis att två rutor betecknar anställda och avdelningar. En linje mellan dem säger inte om en anställd *arbetar vid* eller *leder* avdelningen, och de två sambanden kan ha olika regler. Genom att namnge associationen med ett verb får läsaren hjälp att förstå påståendet och att skilja flera samband mellan samma entitetstyper åt.

Till en början räcker det att identifiera sambandet och formulera dess
betydelse. Därefter kan modellen preciseras genom att ange hur många
förekomster som får delta i vardera riktningen.

## 5.6 Ett mindre exempel: bibliotek

Anta att ett bibliotek vill hålla reda på både sina fysiska exemplar och de lån
som har gjorts. Informationsbehovet kan då preciseras genom följande frågor:

- Vilken bokutgåva beskriver ett exemplar?
- Vem har lånat ett visst exemplar?
- När började lånet och när ska exemplaret återlämnas?

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/10-konceptuell-modell-bibliotek.svg' | relative_url }}"
       alt="Konceptuell biblioteksmodell med entitetstyperna BOOK_EDITION, COPY, MEMBER och LOAN samt namngivna associationer."
       width="1120" height="620" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 5.2.</strong> Biblioteket skiljer bokutgåvan från det fysiska exemplaret. Multiplicitet läggs till i nästa kapitel. <a href="{{ '/assets/images/10-konceptuell-modell-bibliotek.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Biblioteket kan äga tre exemplar av samma utgåva. De delar då uppgifter som <code>ISBN</code> och titel, men har olika streckkoder och kan vara utlånade till olika personer. Därför skiljer modellen `BOOK_EDITION` från `COPY`: utgåvan beskriver vad som har publicerats, medan exemplaret är det enskilda föremål som biblioteket kan lämna ut. När ett lån registreras måste det gå att följa just detta exemplar och dess lånehistorik.

## 5.7 Från text till modell: Nordic Brew

Utgå från följande korta text:

> En kund kan göra beställningar. Varje beställning får ett ordernummer och ett
> orderdatum. Beställningen innehåller produkter. För varje beställd produkt
> registreras kvantitet och det pris som avtalades vid köpet.

### Steg 1: hitta möjliga begrepp

Orden kund, beställning och produkt ger oss först kandidaterna `CUSTOMER`, `SALES_ORDER` och `PRODUCT`. Därefter behöver vi undersöka vad kvantitet och avtalat pris beskriver. Produkten kan ju köpas i olika antal och till olika priser vid olika tillfällen. Uppgifterna gäller därför produkten **i en bestämd beställning**, vilket motiverar ett ytterligare begrepp: `ORDER_LINE`.

### Steg 2: formulera associationerna

- `CUSTOMER places SALES_ORDER`;
- `SALES_ORDER contains ORDER_LINE`;
- `ORDER_LINE refers to PRODUCT`.

### Steg 3: placera attributen

`OrderDate` beskriver beställningen som helhet, medan `Quantity` och
`AgreedUnitPriceOre` beskriver en viss orderrad. Produkten kan samtidigt ha ett
`ListPriceOre`, men det aktuella listpriset får inte ersätta det pris som
faktiskt avtalades när en äldre order lades.

| Uppgift | Order 1042, produkt 501 | Order 1043, produkt 501 | Vad beskriver den? |
| --- | ---: | ---: | --- |
| <code>ProductName</code> | Brew coffee 500 g | Brew coffee 500 g | Samma produkt |
| <code>Quantity</code> | 2 | 1 | Produkten i en viss beställning |
| <code>AgreedUnitPriceOre</code> | 12900 | 11900 | Priset som avtalades på respektive orderrad |

Tabellen hjälper oss att pröva placeringen av attributen. Produktnamnet beskriver samma produkt i båda beställningarna, medan antal och avtalat pris kan skilja sig åt. Därför behöver de senare uppgifterna höra till orderraden. Vi har kommit fram till en skillnad i betydelse innan vi har valt några SQL-kolumner eller främmande nycklar.

### Steg 4: pröva med ett scenario

Anta att Nordic Brew höjer listpriset på en produkt efter att en kund redan har
gjort sin beställning. Orderns totalbelopp ska då inte förändras i efterhand,
vilket visar varför `AgreedUnitPriceOre` behöver beskriva orderraden och inte bara
hämtas från produktens nuvarande listpris.

## 5.8 Vanliga tidiga misstag

### Att börja med tabeller

Om analysen börjar med främmande nycklar riskerar tekniska vanor att bestämma
vilka verksamhetsbegrepp som blir synliga. Syfte, frågor och regler behöver
därför etableras innan den tekniska representationen väljs.

### Att göra varje substantiv till en entitetstyp

Ord i en text är kandidater, inte facit. ”Pris” är här ett attribut, medan en
separat prislista med giltighetsperioder kan behöva modelleras som egna
entiteter i ett annat syfte.

### Att blanda individ och typ

`PRODUCT` betecknar entitetstypen och beskriver därför de egenskaper och regler
som är gemensamma för produkterna. Produkten med nummer `501` är däremot en individuell entitet
av denna typ; rutan i modellen beskriver alltså typen och inte just den
enskilda produkten.

## 5.9 Överföringsövning: vårdbokning

> En mottagning bokar patienter till besök hos vårdpersonal. Varje besök har
> en starttid. Ett besök kan senare avbokas. Diagnoser och journalanteckningar
> ingår inte i den första modellen.

1. Formulera modellens syfte och avgränsning.
2. Föreslå entitetstyper och konceptuella identifierare.
3. Föreslå relevanta attribut.
4. Namnge associationerna med verb.
5. Skriv två frågor som modellen ska kunna besvara.

<details class="answer" markdown="1">
<summary>Lösningsförslag steg för steg</summary>

### Börja med vad mottagningen behöver veta

Ett möjligt syfte är att planera besök och kunna se **vilken patient som är bokad hos vilken behandlare, och när**. Modellen behöver därför beskriva patienten, behandlaren och själva besökstillfället. Diagnoser och journalanteckningar lämnas utanför, eftersom uppgiften uttryckligen avgränsar bort dem.

### Skilj personen från besökstillfället

Anta att patient 31 bokar ett besök på måndag och ett återbesök på torsdag. Vi behöver då kunna skilja de två besöken åt, samtidigt som båda gäller samma patient. Därför får patienten en egen identifierare, medan varje besök får en annan identifierare som pekar ut just det tillfället. På motsvarande sätt behöver en behandlare kunna kopplas till flera besök utan att registreras som en ny person varje gång. Tabellen visar hur dessa skillnader kan uttryckas i modellen.

| Entitetstyp | Vad en förekomst beskriver | Konceptuell identifierare | Exempel på övriga attribut |
| --- | --- | --- | --- |
| `PATIENT` | En registrerad patient | `PatientID` | `PatientName` |
| `PRACTITIONER` | En behandlare | `PractitionerID` | `PractitionerName` |
| `APPOINTMENT` | Ett bokat besökstillfälle | `AppointmentID` | `StartsAt`, `Status` |

Markeringen `ID` visar vilken egenskap vi använder för att skilja förekomsterna åt. `PatientID` identifierar alltså patienten, medan `AppointmentID` identifierar ett av patientens besök. Vi beskriver fortfarande vad mottagningen behöver hålla reda på och behöver därför ännu inte bestämma tabeller eller främmande nycklar.

### Förbind begreppen och pröva dem

För att kunna följa patienten till de bokade tillfällena använder vi associationen `PATIENT has APPOINTMENT`. Därefter behöver varje besök kunna kopplas till den behandlare som är inbokad, vilket uttrycks med `PRACTITIONER is assigned to APPOINTMENT`. Tillsammans låter sambanden oss gå från ett visst besök till både patienten och behandlaren.

Besökets starttid hör hemma i `StartsAt`, medan `Status` exempelvis kan ange om besöket fortfarande är planerat eller har avbokats. Om patient 31 avbokar måndagens besök ska torsdagens återbesök kunna finnas kvar. Det är därför avbokningen beskriver ett visst besök och inte patienten som helhet.

Med dessa samband kan mottagningen exempelvis fråga:

1. Vilka planerade besök har patient 31, och när börjar de?
2. Vilka besök är behandlare 8 inbokad på under en viss dag?

I förslaget antar vi att ett besök gäller en patient och en behandlare. Det är ett rimligt första antagande, men texten avgör inte om gruppbesök eller flera behandlare kan förekomma. Den frågan behöver därför kontrolleras innan modellen används. Ett välmotiverat modellförslag visar både vad det kan beskriva och vilka antaganden som fortfarande är öppna.
</details>

## Innan du går vidare

Välj en entitetstyp i biblioteksmodellen och ge två enskilda exempel på den. Kontrollera att du kan skilja en bokutgåva från ett fysiskt exemplar utan att börja diskutera SQL.

## Kontrollfrågor

1. Varför måste modellens syfte anges?
2. Vad skiljer entitetstyp från entitet?
3. Varför märks en identifierare `ID` och inte `PK` i denna modell?
4. Varför är `AgreedUnitPriceOre` ett attribut hos `ORDER_LINE`?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Syftet avgör vilka företeelser och skillnader modellen behöver beskriva. Ett bibliotek som lånar ut fysiska böcker måste exempelvis kunna skilja två exemplar av samma utgåva åt. Om syftet lämnas oklart går det inte att avgöra om modellen är tillräcklig, eftersom en förenkling kan vara rimlig för en fråga men otillräcklig för en annan.

2. Entitetstypen beskriver ett slags företeelser och vilka egenskaper som är relevanta för dem. `CUSTOMER` är exempelvis en entitetstyp, medan Mira som en viss registrerad kund är en entitet av den typen. Skillnaden motsvarar att skilja beskrivningen av vad en kund är från en särskild kund som beskrivningen gäller.

3. `ID` markerar här hur en företeelse kan identifieras på begreppsnivå. `PK` betyder primärnyckel och hör till beslutet om hur en rad identifieras i ett relationsschema. Genom att hålla isär markeringarna kan vi diskutera vad som ska identifieras innan vi bestämmer hur identiteten ska representeras i tabeller.

4. Det avtalade styckpriset beskriver produkten på en viss beställning, inte produkten oberoende av köp. Produkt 501 kan exempelvis ha olika avtalade priser på order 1042 och 1043. Därför behöver priset höra till `ORDER_LINE`, där både beställningen och produkten är kända. Produktens aktuella listpris beskriver ett annat faktum.

</details>

## Sammanfattning

Konceptuell modellering börjar med vad verksamheten behöver förstå och hålla reda på. Genom att definiera entitetstyper, attribut och associationer kan vi pröva en gemensam beskrivning innan den blir tabeller. Diagrammets notation hjälper oss att uttrycka besluten, men ersätter inte förklaringen av deras betydelse.