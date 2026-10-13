---
layout: default
track: grundspar
prerequisites: "Kapitel 5: entitetstyper och associationer."
focus: "Bestäm minimum och maximum i två riktningar."
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

{% include chapter_guide.html %}

Att `CUSTOMER` hör samman med `SALES_ORDER` berättar ännu inte vilka
kombinationer som är tillåtna. En kund kanske får finnas utan någon
beställning, medan en beställning kanske måste höra till exakt en kund. För att
göra sådana skillnader synliga kompletteras associationen med
**multiplicitet**.

## 6.1 Två frågor vid varje associationsände

För att precisera en association väljer vi en enda förekomst som utgångspunkt, exempelvis en kund, och undersöker vilka beställningar som får höra till den. Vi frågar först hur många som minst måste finnas och sedan hur många som högst får finnas. Ett minimum på noll tillåter en kund utan beställningar, medan ett maximum på ett skulle begränsa kunden till en enda beställning. Båda gränserna behövs för att regeln ska bli tydlig.

Vi använder fyra vanliga uttryck:

| Notation | Betydelse |
| --- | --- |
| `0..1` | ingen eller en |
| `1..1` | exakt en |
| `0..*` | ingen, en eller flera |
| `1..*` | minst en, möjligen flera |

I de två sista uttrycken betyder stjärnan ”många” utan att ange en bestämd övre
gräns. Notationen ska alltså läsas som ett sammanhängande intervall, där talet
före de två punkterna är minimum och tecknet efter dem är maximum.

## 6.2 Läs från en förekomst i taget

Betrakta regeln:

```text
CUSTOMER places SALES_ORDER
```

Nordic Brew har bestämt:

- varje beställning görs av exakt en kund;
- en kund kan finnas utan beställningar och kan senare göra flera.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/11-lasa-multiplicitet.svg' | relative_url }}"
       alt="Associationen Customer places SalesOrder. Från en order läses exakt en customer och från en customer läses noll eller flera orders."
       width="1040" height="510" loading="eager" decoding="async">
  </div>
  <figcaption><strong>Figur 6.1.</strong> Läs alltid en associationsände i taget och formulera resultatet som en mening. <a href="{{ '/assets/images/11-lasa-multiplicitet.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Ett tillförlitligt sätt att läsa modellen är att först välja en enda
beställning och fråga hur många kunder den får höra till. Därefter byter man
utgångspunkt, väljer en enda kund och frågar hur många beställningar kunden får
ha. Associationen blir på så sätt två sammanhängande verksamhetsmeningar, en i
vardera riktningen.

{: .mistake }
> Multiplicitet ska inte härledas från dagens rader. Att alla befintliga kunder
> råkar ha en order bevisar inte att varje framtida kund måste ha en order.

## 6.3 Minimum uttrycker om deltagande är obligatoriskt

När vi tittar på befintliga registreringar ser vi vad som finns, men inte alltid vad som får saknas. Om alla kunder i ett litet exempel har en order kan vi därför ändå inte avgöra om en ny kund måste beställa direkt. För att bestämma minimum behöver vi aktivt undersöka situationer som ännu inte syns i underlaget:

- Får en ny kund registreras före första beställningen?
- Får en kurs finnas innan någon student har registrerats?
- Får en order sparas utan en enda orderrad?
- Får en anställd sakna tilldelad avdelning under sin första arbetsdag?

Svaren är verksamhetsbeslut snarare än egenskaper som kan avläsas direkt ur
verkligheten. Två organisationer kan därför modellera liknande företeelser på
olika sätt, och samma organisation kan behöva ändra regeln när arbetssättet
förändras.

### Exempel: kurs och student

Ett kurstillfälle kan erbjudas redan innan någon student har registrerats,
samtidigt som en student kan registreras på flera olika kurstillfällen.

```text
En COURSE_OFFERING har 0..* ENROLLMENT.
En ENROLLMENT gäller 1..1 COURSE_OFFERING.
```

Om universitetet i stället skulle kräva att ett kurstillfälle skapas först när
den första registreringen görs, skulle minimum behöva ändras. Modellen
dokumenterar alltså en vald verksamhetsregel, inte en förmodad naturlag.

## 6.4 Tre vanliga former

### En-till-en

Ponera exempelvis att en anställd får tilldelas högst ett skåp i ett
omklädningsrum och att varje skåp i sin tur bara får vara tilldelat en anställd
åt gången. Den maximala multipliciteten är då ett i båda riktningarna, medan
minimum fortfarande kan vara noll eller ett beroende på om en anställd måste
ha ett skåp och om varje skåp måste vara tilldelat.

### En-till-många

Nordic Brews kunder kan göra flera beställningar, samtidigt som varje
beställning görs av exakt en kund. Den ena riktningen har därför maximum många
och den andra maximum ett, vilket ger ett en-till-många-samband.

### Många-till-många

En student kan på motsvarande sätt delta i flera kurstillfällen, samtidigt som
ett kurstillfälle kan omfatta flera studenter. Eftersom maximum är många i båda
riktningarna är sambandet många-till-många.

När vi beskriver verksamheten kan ett många-till-många-samband vara precis det som behövs. Men om vi även vill registrera när en student anmälde sig och vilket betyg studenten fick måste de uppgifterna få ett tydligt sammanhang. `RegisteredAt` och `Grade` beskriver varken studenten i allmänhet eller kurstillfället i allmänhet, utan **den studentens deltagande på det kurstillfället**. Därför kan deltagandet behöva beskrivas som en egen entitetstyp, exempelvis `ENROLLMENT`.

## 6.5 Sambandet som egen entitetstyp

Samma resonemang hjälper oss att förstå Nordic Brews orderrader. Att en order innehåller en viss produkt säger ännu inte hur många förpackningar kunden beställde eller vilket pris som avtalades. Genom att placera `ORDER_LINE` mellan `SALES_ORDER` och `PRODUCT` får varje kombination ett sammanhang där `Quantity` och `AgreedUnitPriceOre` kan beskrivas utan att blandas ihop med produktens allmänna egenskaper.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/12-konceptuell-modell-nordicbrew.svg' | relative_url }}"
       alt="Konceptuell Nordic Brew-modell med Customer, SalesOrder, OrderLine och Product. Alla associationsändar visar min och max."
       width="1160" height="700" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 6.2.</strong> <code>ORDER_LINE</code> gör det möjligt att beskriva själva sambandet mellan en beställning och en produkt. <a href="{{ '/assets/images/12-konceptuell-modell-nordicbrew.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Vi kan läsa modellen genom att följa en beställning från kund till produkt. Beställningen görs av exakt en `CUSTOMER`, men kunden kan ha funnits i registret redan innan någon order lades. En `SALES_ORDER` får också finnas som utkast utan produkter och kan därför innehålla noll eller flera `ORDER_LINE`. När en orderrad väl skapas hör den till exakt en order och avser exakt en `PRODUCT`. Produkten kan i sin tur finnas i sortimentet även om ingen ännu har beställt den.

`CustomerID` ritas inte in i `SALES_ORDER` i denna modell, eftersom det är en
teknisk lösning som blir aktuell först när modellen översätts till tabeller. På
den konceptuella nivån uttrycks verksamhetssambandet i stället direkt genom
associationen `places`.

## 6.6 Samma multiplicitet med Crow's Foot

Crow's Foot uttrycker samma fyra intervall med grafiska ändmarkörer där en cirkel betyder noll, ett kort tvärstreck betyder ett och den tregrenade ”foten” betyder många. Vid en associationsände kombineras sedan två symboler: den inre symbolen, närmast linjens mitt, anger minimum/deltagande, medan symbolen närmast entitetstypen anger
maximum/kardinalitet.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/15-crows-foot-symboler.svg' | relative_url }}"
       alt="Crow's Foot-legend som jämför 0..1, 1..1, 0..* och 1..* med motsvarande grafiska ändmarkörer samt visar Customer och SalesOrder i en en-till-många-association."
       width="1120" height="720" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 6.3.</strong> Cirkeln eller strecket närmast linjens mitt anger minimum; strecket eller den tregrenade foten närmast entitetstypen anger maximum. <a href="{{ '/assets/images/15-crows-foot-symboler.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Utgå exempelvis från en kund i figur 6.3 och följ associationen till ordersidan. Där betyder cirkeln att kunden kan sakna order, medan foten anger att flera order är tillåtna; tillsammans motsvarar symbolerna `0..*`. När vi i stället börjar i en order och följer linjen till kunden möter vi två streck, alltså `1..1`. På det sättet kan vi läsa samma verksamhetsregler med båda notationerna utan att gissa utifrån vilken sida av sidan symbolerna står på.

Det finns mindre variationer mellan ritverktyg, bland annat i linjestil och
placering av associationsnamn. En legend bör därför alltid följas när ett
diagram använder fler symboler än de fyra som visas här. Oavsett grafisk
variant kan regeln kontrolleras genom att uttryckas i två meningar och prövas
med både ett tomt fall och ett fall med flera förekomster.

## 6.7 Modellkritik: två rimliga alternativ

Modellen ovan tillåter utkast före första orderraden. Om vi i stället avgränsar modellen till bekräftade beställningar kan minimum höjas till ett:

```text
Utkast: en SALES_ORDER innehåller 0..* ORDER_LINE.
Bekräftad order: en SALES_ORDER innehåller 1..* ORDER_LINE.
```

Ett enda statiskt diagram kan inte alltid uttrycka att regeln beror på orderns
status. Två vanliga sätt att hantera begränsningen är:

- tillåt `0..*` i modellen och dokumentera att bekräftelse kräver minst en rad;
- modellera utkast och bekräftad order som tydligare skilda tillstånd eller
  begrepp senare i analysen.

Detta är inte ett notationsfel utan en fråga om modellens ambitionsnivå.

## 6.8 Överföringsövning: evenemangsbokning

En kulturförening arrangerar evenemang som får publiceras innan någon har
bokat. En person kan göra flera bokningar, och varje bokning gäller ett
bestämt evenemang men kan samtidigt omfatta flera biljetter av olika typer.

1. Föreslå entitetstyper och namngivna associationer.
2. Ange `min..max` i båda riktningarna för varje association.
3. Identifiera ett samband som kan behöva egna attribut.
4. Skriv minst fyra verksamhetsmeningar som modellen uttrycker.
5. Beskriv en alternativ regel som skulle förändra multipliciteten.

<details class="answer" markdown="1">
<summary>Lösningsförslag steg för steg</summary>

### 1. Skilj bokningen från det som bokas

Ett förslag är att skilja personen som bokar, `PERSON`, från själva bokningen, `BOOKING`, och evenemanget den gäller, `EVENT`. Samma person kan ju boka igen, samtidigt som flera personer kan boka till samma evenemang. Vi behöver också beskriva **valet av en viss biljettyp i just en bokning**, eftersom bokningen kan innehålla olika typer av biljetter. Därför inför vi `TICKET_TYPE` för biljettypen och `BOOKING_LINE` för dess förekomst i bokningen.

Anta exempelvis att Nora bokar två standardbiljetter och en studentbiljett till samma konsert. Då finns en bokning med två bokningsrader: en rad för standardbiljetterna med `Quantity = 2` och en för studentbiljetten med `Quantity = 1`. Tre biljetter behöver alltså inte betyda tre bokningsrader.

### 2. Ange antagandena innan du skriver multipliciteten

I lösningen nedan gäller varje bokning en person och ett evenemang. En färdig bokning måste innehålla minst en bokningsrad, och en viss biljettyp förekommer högst en gång i samma bokning. Vi använder ett gemensamt register över biljettyper, exempelvis Standard och Student; regler om vilka typer ett visst evenemang får erbjuda ligger utanför detta första förslag.

| Association | Läs från en förekomst till vänster | Läs från en förekomst till höger |
| --- | --- | --- |
| `PERSON makes BOOKING` | En person har `0..*` bokningar. | En bokning görs av `1..1` person. |
| `BOOKING concerns EVENT` | En bokning gäller `1..1` evenemang. | Ett evenemang har `0..*` bokningar. |
| `BOOKING contains BOOKING_LINE` | En färdig bokning har `1..*` bokningsrader. | En bokningsrad hör till `1..1` bokning. |
| `BOOKING_LINE selects TICKET_TYPE` | En bokningsrad gäller `1..1` biljettyp. | En biljettyp förekommer på `0..*` bokningsrader. |

För att läsa tabellen kan vi börja med raden `BOOKING concerns EVENT`. Från en bokning frågar vi vilket evenemang den gäller och får svaret exakt ett, alltså `1..1`. Byter vi utgångspunkt och frågar hur många bokningar ett evenemang får ha blir svaret `0..*`: evenemanget får publiceras utan bokningar och kan senare få flera. De två kolumnerna uttrycker därmed olika verksamhetsregler för samma association. Läs de återstående raderna på motsvarande sätt, med en bestämd förekomst som utgångspunkt varje gång.

### 3. Placera egenskapen där dess betydelse hör hemma

I Noras exempel är `Quantity = 2` antalet standardbiljetter i just hennes bokning. Vid nästa bokning kan hon välja fem standardbiljetter, vilket visar varför antalet varken är en allmän egenskap hos biljettypen eller hos personen. Genom att placera `Quantity` på bokningsraden knyter vi i stället ihop antalet med både rätt bokning och rätt biljettyp. Vi kan då bevara båda bokningarna utan att det ena antalet skriver över det andra.

### 4. Pröva en ändrad regel

Om föreningen vill spara ofärdiga bokningar innan några biljetter har valts ändras antalet tillåtna bokningsrader per bokning från `1..*` till `0..*`. Varje befintlig bokningsrad hör fortfarande till exakt en bokning. Det är alltså en bestämd verksamhetsregel som ändras, inte alla multiplicitetstal i modellen.
</details>

## Innan du går vidare

Utgå först från en kund och sedan från en order. Skriv en hel mening i varje riktning och ringa in orden som avgör minimum respektive maximum.

## Kontrollfrågor

1. Vad skiljer minimum från maximum?
2. Varför läses en association i två riktningar?
3. Varför kan `ORDER_LINE` inte ersättas av ett attribut hos `PRODUCT`?
4. Vad är risken med att härleda multiplicitet från dagens data?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Minimum anger om deltagande krävs, medan maximum anger hur många kopplingar som är tillåtna. I `0..*` får antalet vara noll, men det finns ingen bestämd övre gräns i modellen. I `1..1` måste kopplingen finnas och det får bara finnas en. Att känna maximum räcker därför inte för att veta om deltagandet är obligatoriskt.

2. Associationen behöver besvara två skilda frågor: hur många beställningar får en kund ha, och hur många kunder får en beställning höra till? Den första kan ge `0..*`, medan den andra ger `1..1`. Om vi bara läser åt ett håll saknas alltså en del av regeln, och vi kan inte avgöra hur hela sambandet ska fungera.

3. En orderrad beskriver en bestämd produkts förekomst på en bestämd order. Antalet kan vara två på en order och fem på en annan, så ett enda antal hos `PRODUCT` skulle inte visa vilken beställning det hör till. Genom att beskriva `ORDER_LINE` bevarar vi kombinationen och kan placera dess antal och avtalade pris där.

4. Exempeldata visar vad som råkar ha registrerats hittills, inte allt som ska vara tillåtet. Om varje kund just nu har en beställning bevisar det därför inte att en andra är förbjuden. Multipliciteten behöver följa verksamhetsreglerna och prövas även mot nya, tillåtna situationer.

</details>

## Sammanfattning

Multiplicitet beskriver hur få och hur många förekomster som får höra samman. Varje association behöver läsas i båda riktningarna och prövas mot verksamhetens regler, även med tomma fall. Om sambandet har egna egenskaper, som antalet av en produkt i en beställning, kan det behöva få en egen entitetstyp.