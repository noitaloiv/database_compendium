---
layout: default
track: fordjupning
prerequisites: "Kapitel 3–13: relationsmodellen och grundläggande SQL."
focus: "Jämför alternativa sätt att organisera data utifrån samma behov."
title: 25. Andra sätt att organisera data
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 25
permalink: /docs/del-4-perspektiv/andra-satt-att-organisera-data/
description: En valbar orientering om dokument, nyckel–värde, grafer och vektorsökning utifrån bekanta informationsbehov.
keywords: [fördjupning, dokumentdatabas, JSON, nyckel-värde, grafdatabas, relationsdatabas, vektor, embedding, likhetssökning, vektordatabas]
---

# 25. Andra sätt att organisera data

{% include chapter_guide.html %}

Relationsmodellen är ett sätt att organisera och fråga efter data, men olika användningsbehov har också lett till andra sätt att representera innehållet. För att kunna jämföra dem behöver vi börja i frågor som redan är bekanta: vilka fakta hör ihop, vilka samband måste skyddas och vad behöver användarna kunna göra? Med dessa frågor som utgångspunkt kan vi undersöka alternativen utan att förutsätta att det senaste produktnamnet också ger den lämpligaste lösningen.

Detta kapitel är en **fristående fördjupning**. Du kan gå direkt vidare till kapitel 26 utan att lära dig en ny produkt eller ett nytt frågespråk. Syftet här är att känna igen några andra organisationsprinciper och undvika föreställningen att ett enda tekniskt val passar alla behov.

## 25.1 Samla uppgifter i ett dokument

En order visas ofta som en sammanhängande helhet: ordernummer, kund och en lista med orderrader. Ett dokument kan lagra en sådan samling direkt. Ett vanligt textformat för att uttrycka den är **JSON**. Vi kan börja med den lilla delen `"OrderID": 1042`, som anger ett namn och dess värde med ett kolon emellan. Citattecknen markerar text, medan 1042 är ett tal. Klammerparenteserna samlar sådana namn–värde-par till ett objekt, och hakparenteserna runt `Lines` samlar flera orderradsobjekt till en lista.

```json
{
  "OrderID": 1042,
  "CustomerID": 17,
  "Lines": [
    {"ProductID": 501, "Quantity": 2},
    {"ProductID": 502, "Quantity": 1}
  ]
}
```

Exemplet kan läsas som att ”order 1042 hör till kund 17 och innehåller två rader”. JSON ger oss ett format för att skriva denna struktur, men formatet tillhandahåller inte i sig en databas. För att lagra dokumenten över tid och kunna hitta eller förändra dem behövs också programvara, exempelvis en dokumentdatabas med sådana funktioner.

Att orderraderna ligger tillsammans kan passa när hela ordern ofta hämtas som en enhet. Samtidigt kvarstår frågor om exempelvis produktnamn: ska de kopieras in i varje dokument eller hämtas genom en hänvisning? Om de kopieras behöver vi bestämma om de är historiska uppgifter om köpet eller kopior som ska ändras när produktnamnet ändras. Begreppsarbetet försvinner alltså inte med tabellerna.

<figure class="figure" id="figur-25-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 25.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/44-order-som-dokument.svg' | relative_url }}" alt="Relationsformen har en orderrad i SalesOrder och två hänvisande rader i OrderLine. Dokumentformen samlar samma två orderrader inuti orderns Lines-lista." width="900" height="465" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 25.1.</strong> Bilden jämför var uppgifterna placeras. Den avgör inte vilka integritets- eller transaktionsgarantier en viss databasprodukt erbjuder. <a href="{{ '/assets/images/44-order-som-dokument.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 25.2 Ett värde under en nyckel

I en **nyckel–värde-modell** använder programmet en bestämd nyckel för att hämta det värde som lagrats under den. Om kund 17 har en tillfällig varukorg kan exempelvis nyckeln `cart:17` peka ut hela varukorgens innehåll. Programmet behöver då inte först söka efter kunden genom att jämföra flera egenskaper, utan känner redan den nyckel som uppslagningen ska använda. Ordet nyckel beskriver här kopplingen till ett lagrat värde; det innebär inte att vi därmed har beskrivit ett relationsschema med primärnycklar och främmande nycklar.

Detta kan passa när programmet redan känner nyckeln och oftast behöver hämta just den samlingen. Om frågan i stället gäller alla kunder som har en viss kombination av produkter kan andra åtkomstvägar behövas. En enkel uppslagning och en fri analys över många poster är olika informationsbehov.

## 25.3 Låt sambanden stå i centrum

I en **grafmodell** representeras företeelser som noder och deras samband som kanter mellan noderna. I ett transportnät kan stationerna vara noder, medan en kant anger att det finns en direkt förbindelse mellan två stationer. För att hitta en resväg från en station till en annan behöver vi då följa en eller flera sådana förbindelser. Modellen gör därmed själva vägarna genom nätet till en tydlig del av frågan.

Även en relationsdatabas kan beskriva stationer och förbindelser. Skillnaden ligger därför inte i att bara grafer kan innehålla relationer, utan i hur data representeras och vilka operationer systemet är utformat för. För uppgifter där många varierande vägar behöver följas kan grafens form vara ett naturligt sätt att uttrycka problemet.

## 25.4 Sök efter likhet med vektorer

Nordic Brew vill kanske låta en kund skriva ”ett milt kaffe med fruktig smak” och hitta produkter vars beskrivningar passar önskemålet. Det är en annan uppgift än att slå upp `ProductID = 501`. Någon exakt nyckel är inte känd, och orden i frågan behöver inte förekomma ordagrant i produktbeskrivningen.

En möjlig metod är att representera innehåll som **vektorer**, ordnade följder av tal, och söka efter vektorer som ligger nära varandra enligt ett valt likhetsmått. Börja med ett handgjort exempel för att se principen. Anta att varje kaffe får två värden, syrlighet och fyllighet på en skala från 1 till 5:

| Produkt | Vektor: (syrlighet, fyllighet) | Jämförelse med önskemålet (3, 4) |
| --- | --- | --- |
| 501 | (2, 4) | Ett skalsteg lägre syrlighet |
| 502 | (1, 5) | Två steg lägre syrlighet och ett steg högre fyllighet |
| 503 | (3, 3) | Ett skalsteg lägre fyllighet |

Med vanligt geometriskt avstånd och lika vikt för dimensionerna ligger 501 och 503 lika nära önskemålet, medan 502 ligger längre bort. När kundens prioriteringar eller måttet förändras kan även rangordningen förändras. Siffrorna är påhittade för att visa idén; de ingår inte i bokens produktdata och säger inget om kaffets faktiska egenskaper.

<figure class="figure" id="figur-25-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 25.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/45-vektoravstand.svg' | relative_url }}" alt="Punkterna visar syrlighet och fyllighet. 501 och 503 ligger ett steg från önskemålet 3,4, medan 502 ligger längre bort." width="900" height="495" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 25.2.</strong> I det handgjorda exemplet kan vi se vad varje dimension betyder. En embedding för text har vanligen inte lika lättolkade dimensioner. <a href="{{ '/assets/images/45-vektoravstand.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

När metoden används för text skapas vektorerna ofta av en modell, och representationen brukar då kallas en **embedding**. Till skillnad från våra handgjorda kaffeegenskaper kan den innehålla många dimensioner som saknar en enkel, namngiven tolkning. För att jämförelsen ändå ska bli meningsfull behöver frågan och produktbeskrivningarna representeras på förenliga sätt; annars säger ett litet avstånd inte det vi hoppas att det ska säga.

En **vektordatabas** eller en databas med stöd för vektorsökning kan lagra dessa representationer och hitta närliggande kandidater. Kandidaterna behöver fortfarande bedömas mot informationsbehovet. En språkligt liknande produkt kan vara slut i lager, innehålla fel ingredienser eller bygga på en gammal beskrivning. Likhet är därför varken en sanningsgaranti eller en ersättning för exakta villkor.

| Del av ett sökbehov | Lämplig kontrollfråga |
| --- | --- |
| Texten ska likna önskemålet | Hur skapas och jämförs representationerna? |
| Produkten ska vara aktiv | Finns ett aktuellt, uttryckligt värde för <code>Active</code>? |
| Priset ska understiga 120 kronor | Vilket pris och vilken enhet ska villkoret använda? |
| Träffen ska gå att granska | Kan vi läsa ursprungstexten och se dess källa? |

Det här är funktioner som kan kombineras. [pgvector](https://github.com/pgvector/pgvector) är exempelvis ett tillägg som ger vektorsökning i PostgreSQL, där vanliga tabeller, SQL och transaktioner fortfarande finns kvar. Gränserna mellan produktkategorierna är alltså inte absoluta.

<details class="extension" markdown="1">
<summary>Fördjupning: snabbt sökta kandidater behöver utvärderas</summary>

En exakt närmaste-granne-sökning kan jämföra avstånd enligt det valda måttet. För stora samlingar kan en approximativ metod i stället hitta nära kandidater snabbare, med risken att några av de allra närmaste missas. Detta är en avvägning mellan sökkostnad och återfunna kandidater, inte mellan sant och falskt innehåll: även en exakt närmaste träff kan vara irrelevant om representationen eller frågan är olämplig.

En begriplig utvärdering börjar därför med exempel på vad användaren söker och vilka resultat som faktiskt är användbara. Indexalgoritmer och modellträning ligger utanför denna orientering.
</details>

## 25.5 Jämför behov, inte slagord

| Behov att undersöka | Fråga inför valet |
| --- | --- |
| Registrera en order | Vilka förändringar måste lyckas tillsammans? |
| Uppdatera en produkt | På hur många ställen finns aktuella fakta om den? |
| Analysera försäljning | Vilka kombinationer och sammanställningar behöver kunna göras? |
| Följa ett transportnät | Hur långa och varierande vägar ska undersökas? |
| Hitta liknande produktbeskrivningar | Hur bedöms relevans, aktualitet och obligatoriska villkor? |
| Förvalta systemet | Vilka verktyg, kunskaper och återställningsmöjligheter finns? |

Benämningar som ”NoSQL” omfattar flera olika slags system och säger inte ensamma vilka transaktionsgarantier eller regler en produkt har. Det är missvisande att anta att alla dokumentdatabaser saknar transaktioner eller att alla relationsdatabaser har samma egenskaper. Jämför de faktiska kraven med det konkreta systemet.

## 25.6 Överföringsövning: resenärens tre frågor

**Arbetssätt:** resonera utan att installera nya databasprodukter. Ett reseföretag vill besvara tre frågor:

1. Vilken bokning har bokningsnummer 742?
2. Vilka resvägar förbinder två stationer med högst två byten?
3. Vilka resebeskrivningar liknar önskemålet ”en lugn helg nära vatten”?

Förklara vilken sorts sökning varje fråga kräver. Betyder svaren att företaget måste installera tre olika databaser?

<details class="answer" markdown="1">
<summary>Ett möjligt resonemang</summary>

I den första frågan känner vi till en identifierare och vill hitta exakt den företeelse den betecknar. Den andra frågan kräver i stället att flera samband följs och att möjliga vägar begränsas, vilket gör grafperspektivet användbart. Den tredje handlar om likhet mellan beskrivningar och kan därför motivera text- eller vektorsökning, men då behöver vi också bedöma om de liknande träffarna är användbara för ändamålet.

Frågorna bestämmer inte antalet databasprodukter. En produkt kan stödja flera åtkomstsätt, och en enkel lösning kan räcka för ett litet underlag. Krav på transaktioner, aktualitet, kompetens och förvaltning behöver också vägas in innan system delas upp.
</details>

## Kontrollfrågor – fördjupning

1. Varför är JSON inte synonymt med dokumentdatabas?
2. Försvinner risken för motstridiga produktnamn när order lagras som dokument?
3. Vilket informationsbehov kan göra en grafmodell naturlig?
4. Varför är närmaste vektor inte nödvändigtvis det bästa svaret?
5. Måste vektorsökning ersätta en relationsdatabas?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. JSON är ett textformat för att uttrycka exempelvis objekt, listor och namn–värde-par. En dokumentdatabas är däremot programvara som erbjuder lagring och operationer på dokumenten. Att skriva ordern som JSON säger därför hur innehållet representeras, men inte i sig hur det lagras varaktigt, kontrolleras eller görs sökbart.

2. Nej. Om varje orderdokument innehåller en kopia av produktens aktuella namn kan en namnändring fortfarande behöva göras på flera ställen. Om namnet i stället avser hur produkten benämndes vid köpet kan det vara en avsiktlig historisk uppgift som ska bevaras. Vi behöver alltså klargöra betydelsen innan vi avgör om upprepningen är ett problem.

3. En grafmodell kan vara naturlig när frågan gäller att följa flera samband efter varandra, exempelvis möjliga resvägar genom ett nät av stationer. Noder och kanter gör då vägarna tydliga. Även andra modeller kan lagra samma fakta, så ett praktiskt systemval behöver dessutom ta hänsyn till övriga frågor, regler och förvaltningsbehov.

4. Närheten bestäms av hur innehållet har representerats och vilket avstånds- eller likhetsmått som används. En produktbeskrivning kan ligga nära kundens önskemål men ändå gälla en vara som är slut i lager eller bryter mot ett obligatoriskt krav. Likhet ger därför kandidater som behöver kontrolleras, inte en garanti för det bästa eller ens ett användbart svar.

5. Nej. Vektorsökning kan erbjudas som en funktion i ett system som också hanterar relationer, SQL och transaktioner. Behovet av likhetssökning avgör därför inte ensamt om en separat databas behövs. Det är viktigare att undersöka vilka funktioner och garantier hela lösningen behöver än att utgå från produktkategoriernas namn.

</details>

## Sammanfattning

Dokument, nyckel–värde, grafer och vektorer framhäver olika sätt att organisera och hitta data. De tar inte bort behovet av tydliga begrepp, transaktioner, informationskvalitet eller ansvar. Börja därför med frågan och de garantier som behövs, och undersök därefter vilka funktioner ett konkret system erbjuder.