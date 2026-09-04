---
layout: default
title: 1. Databaser och informationssystem
parent: Del I – Modeller och relationer
nav_order: 1
permalink: /docs/del-1-grunder/databaser-och-informationssystem/
keywords:
  - databas
  - database
  - DBMS
  - DBHS
  - RDBMS
  - RDBHS
  - databashanteringssystem
  - metadata
  - schema
  - instans
  - informationssystem
---

# 1. Databaser och informationssystem

Nordic Brew är ett fiktivt kafferosteri som säljer till privatpersoner och
företag. Verksamheten började i liten skala och registrerade kunder i en fil,
produkter i en annan och beställningar i en tredje. När en kund bytte adress
ändrades ibland bara en av filerna. Två kunder kunde få samma kundnummer.
Orderrader kunde hänvisa till produkter som hade tagits bort. Ingen visste
heller med säkerhet vilken kopia av filen som var den senaste.

Problemet är inte främst att filerna är små eller att kalkylblad är ”dåliga”.
Problemet är att verksamhetens regler inte upprätthålls på ett gemensamt och
kontrollerat sätt. En databas är ett sätt att möta detta problem – men databasen
är bara en del av informationssystemet.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- skilja mellan data, information och metadata i ett givet sammanhang;
- skilja mellan databas, databasfil, databashanteringssystem och klient;
- placera databasen i ett större informationssystem;
- skilja mellan schema och aktuellt databasinnehåll;
- förklara varför en databas behöver regler, transaktioner, behörigheter och
  återställning;
- motivera när en relationsdatabas är ett rimligt val – och när ett enklare
  verktyg kan vara tillräckligt.
</div>

## 1.1 Från tecken till användbar information

Betrakta följande teckenföljd:

```text
1042,2027-01-15,34900
```

Den är data i den vardagliga betydelsen att den kan lagras, överföras och
bearbetas. Men den säger mycket lite utan ett tolkningssammanhang. Om vi lägger
till kolumnrubriker får den mer struktur:

| Ordernummer | Datum | Belopp |
| ---: | --- | ---: |
| 1042 | 2027-01-15 | 34900 |

Ändå återstår frågor. Är beloppet kronor, ören eller en annan valuta? Är datumet
beställningsdag eller leveransdag? Är ordernumret unikt globalt eller bara inom
ett visst år?

Metadata – data som beskriver andra data – kan göra tolkningen tydligare:

- `Ordernummer` är ett positivt heltal och identifierar en beställning;
- `Datum` är beställningsdatum enligt ISO-formatet `ÅÅÅÅ-MM-DD`;
- `Belopp` anges i öre och får inte vara negativt.

Med kännedom om syftet kan en användare tolka raden som information: *beställning
1042 gjordes den 15 januari 2027 och har värdet 349 kronor*.

### En användbar men inte absolut skillnad

I denna kurs använder vi följande arbetsdefinitioner:

- **data** är representationer som kan lagras och bearbetas;
- **metadata** beskriver representationernas struktur, betydelse eller
  förvaltning;
- **information** uppstår när data tolkas i ett sammanhang och besvarar en
  fråga eller minskar osäkerhet för någon aktör.

Skillnaden är analytisk, inte en naturlag. Samma värde kan vara data i ett
sammanhang och metadata i ett annat. Ett tabellnamn beskriver exempelvis data i
tabellen, men tabellnamnet lagras självt som data i DBMS:ets systemkatalog.

{: .mistake }
> Det går därför inte att avgöra om en teckenföljd ”är information” genom att
> bara titta på dess format. Betydelsen beror på regler, användning och
> sammanhang.

## 1.2 Strukturerad, semistrukturerad och ostrukturerad data

**Strukturerad data** följer ett i förväg definierat schema, exempelvis rader och
kolumner där varje kolumn har en avsedd betydelse. Nordic Brews ordernummer,
orderdatum och kundreferens är typiska exempel.

**Semistrukturerad data** har synliga strukturmarkörer men behöver inte följa
exakt samma fältuppsättning för varje objekt. JSON-dokument är ett vanligt
exempel:

```json
{
  "produktnummer": "BRY-250",
  "namn": "Bryggkaffe 250 g",
  "egenskaper": {
    "rostning": "mellan",
    "ursprung": ["Brasilien", "Colombia"]
  }
}
```

**Ostrukturerad data** saknar den fasta fältindelning som relationsdatabaser
arbetar med, exempelvis ett foto, en inspelning eller en längre fritext. Ordet
”ostrukturerad” betyder inte att innehållet saknar all struktur eller mening;
ett fotografi har uppenbarligen mönster och en text har grammatik. Det betyder
att innehållet inte redan är uppdelat i de fält som den aktuella
databasoperationen behöver.

Kategorierna beskriver alltså hur data organiseras för ett visst syfte. De
utgör inte en rangordning. En produktbild passar bättre som bildfil än som tusen
relationskolumner, medan pris och lagersaldo passar bättre som kontrollerbara
värden än som en mening i ett dokument.

## 1.3 Vad är en databas?

En **databas** är en organiserad och varaktig samling relaterade data som har
utformats för ett bestämt användningsområde. Databasen omfattar inte bara
enskilda värden utan också en beskrivning av hur de är organiserade och vilka
regler som ska gälla.

Definitionen innehåller fyra viktiga ord:

- *organiserad*: data följer en modell och ett schema;
- *varaktig*: innehållet ska finnas kvar efter att ett program har avslutats;
- *relaterad*: olika värden hör samman, exempelvis kund, order och produkt;
- *användningsområde*: urvalet och strukturen motiveras av ett informationsbehov.

En slumpmässig katalog med filer kan innehålla mycket data utan att därför vara
en väl utformad databas. Omvänt kan en liten databas med fyra tabeller vara
värdefull om den uttrycker rätt regler och stöder rätt arbete.

## 1.4 Databasen är inte databashanteringssystemet

Ett **databashanteringssystem** (DBMS, *database management system*) är
programvara som låter användare och andra program definiera, lagra, söka,
förändra, skydda och återställa data i databaser. När systemet specifikt bygger
på relationsmodellen används även **relationsdatabashanteringssystem** (RDBMS;
på svenska ibland RDBHS).

SQLite är kursens DBMS. En fil som `nordicbrew.sqlite` är en databasfil som
SQLite kan öppna. **DB Browser for SQLite** är däremot en grafisk klient som
skickar kommandon till SQLite och visar resultat. Att skilja komponenterna åt
gör fel lättare att diagnostisera:

| Observation | Trolig nivå |
| --- | --- |
| Menyn ser annorlunda ut efter en uppdatering | Klientverktyget |
| En SQL-sats ger syntaxfel | SQL-satsen eller DBMS/dialekt |
| En tabell saknas i just en kopia | Databasfilen eller valt schema |
| En användare får inte läsa löneuppgifter | Behörighet i DBMS/omgivande system |

<figure class="figure">
  <img src="{{ '/assets/images/01-informationssystem.svg' | relative_url }}"
       alt="Informationssystem med användare och andra system, presentations- och applikationslager, DBMS samt databas. DBMS skiljs från databasen." />
  <figcaption><strong>Figur 1.1.</strong> Databasen ingår i ett datalager. Ett DBMS hanterar åtkomsten, medan applikationer och gränssnitt använder data för verksamhetens arbete.</figcaption>
</figure>

### Databasen i informationssystemet

Ett **informationssystem** är ett sociotekniskt arrangemang där människor,
arbetsprocesser, regler och digital teknik samverkar för att hantera
information. Databasen är därför varken användargränssnittet eller hela
informationssystemet.

I en förenklad lagerindelning:

1. **presentationslagret** tar emot och visar information;
2. **applikationslagret** genomför verksamhetslogik, exempelvis beräknar en
   orders totalsumma eller kontrollerar ett arbetsflöde;
3. **datalagret** lagrar och hämtar data genom ett DBMS.

Lagerindelningen är ett sätt att fördela ansvar, inte en regel om att varje
system måste bestå av exakt tre program. I en liten lokal tillämpning kan flera
lager köras i samma process. Den analytiska skillnaden är ändå användbar: en
knapp i ett gränssnitt, en affärsregel i en tjänst och ett
`FOREIGN KEY`-villkor i databasen är olika mekanismer.

## 1.5 Vad gör ett DBMS?

Ett DBMS ger vanligen stöd för att:

- definiera scheman, tabeller, datatyper och integritetsvillkor;
- skapa, läsa, uppdatera och ta bort data;
- hantera samtidiga användare och logiska transaktioner;
- kontrollera identitet och behörighet;
- föra logg och stödja återställning efter fel;
- lagra metadata i en systemkatalog;
- välja fysiska åtkomstvägar, exempelvis index.

Enskilda produkter skiljer sig åt. SQLite har exempelvis ingen inbyggd
användaradministration på samma sätt som ett klient–server-DBMS; åtkomsten
beror i hög grad på filsystem och den omgivande applikationen. Kursens
principer är bredare än en produkt, men varje praktiskt exempel måste vara
ärligt om vilken produkt som används.

## 1.6 Schema och instans

Databasens **schema** beskriver dess relativt stabila struktur: vilka tabeller
och kolumner som finns, avsedda datatyper, nycklar och regler. Databasens
**instans** (eller aktuella tillstånd) är de värden som finns lagrade vid ett
visst tillfälle.

Ett förenklat relationsschema kan skrivas:

```text
KUND(KundID, Namn, Epost)
```

En möjlig instans vid ett visst tillfälle är:

| KundID | Namn | Epost |
| ---: | --- | --- |
| 17 | Mira Ek | mira@example.test |
| 24 | Samir Noor | samir@example.test |

I morgon kan instansen innehålla fler kunder utan att schemat har ändrats. Om
kolumnen `Fakturareferens` läggs till förändras däremot schemat.

<figure class="figure">
  <img src="{{ '/assets/images/02-schema-instans-metadata.svg' | relative_url }}"
       alt="Schema beskriver tillåtna tabeller, kolumner och villkor. Instansen består av aktuella rader. Metadata beskriver bland annat schema och förvaltning." />
  <figcaption><strong>Figur 1.2.</strong> Schemat anger ramarna; instansen är innehållet vid en viss tidpunkt. Metadata gör ramar och förvaltning begripliga.</figcaption>
</figure>

### Dataoberoende som ideal

Ett viktigt mål med ett DBMS är att förändringar på en nivå inte ska tvinga fram
onödiga förändringar överallt. Ett nytt index ska exempelvis normalt inte kräva
att användaren skriver om sin beställningsvy. Detta kallas **dataoberoende**.
Det är ett ideal snarare än magi: om ett kolumnnamn tas bort eller dess betydelse
ändras kan applikationer naturligtvis påverkas.

## 1.7 Tre designnivåer

Under kursen skiljer vi på tre nivåer:

| Nivå | Huvudfråga | Typiskt resultat |
| --- | --- | --- |
| Konceptuell | Vad behöver verksamheten hålla reda på, och hur hänger begreppen samman? | ER-modell och verksamhetsregler |
| Logisk | Hur uttrycks detta i den valda datamodellen? | Relationsscheman, nycklar och funktionella beroenden |
| Fysisk | Hur implementeras och nås strukturen i ett bestämt DBMS? | SQL-DDL, datatyper, index, lagring och konfiguration |

Nivåerna påverkar varandra, och design sker ofta iterativt. Men orden bör inte
blandas. En främmande nyckel är en logisk/implementerad konstruktion; i den
konceptuella modellen uttrycks samma verksamhetssamband som en association.

{: .important }
> Fråga alltid: *Vilken nivå arbetar jag på just nu?* Det gör det lättare att
> välja rätt notation och motivering.

## 1.8 Varför inte bara kalkylblad eller filer?

Ett kalkylblad kan vara helt rätt för en persons begränsade analys. En enkel
textfil kan vara rätt för konfiguration eller datautbyte. Databaser blir
särskilt värdefulla när flera av följande behov finns:

| Behov | Vad ett DBMS kan bidra med |
| --- | --- |
| Samma data används av flera processer | Gemensam, kontrollerad källa |
| Många samtidiga förändringar | Transaktioner och samtidighetskontroll |
| Samband måste förbli giltiga | Nycklar och integritetsvillkor |
| Olika användare har olika rättigheter | Behörighetskontroll |
| Frågorna varierar | Deklarativt frågespråk och optimering |
| Fel måste kunna hanteras | Loggning, backup och återställning |

Ett DBMS eliminerar inte automatiskt dålig kvalitet. Om fel verksamhetsregler
modelleras konsekvent får vi ett konsekvent men felaktigt system. Om
applikationen samlar in missvisande data kan databasen lagra dem perfekt.
Tekniska kontroller behöver därför kopplas till begreppslig förståelse och
ansvar i verksamheten.

## 1.9 Relationsdatabasen och andra modeller

I en **relationsdatabas** uttrycks data som relationer. I praktiska DBMS visas
relationerna som tabeller med rader och kolumner. Samband representeras genom
värden och villkor, inte genom att en rad ”pekar” visuellt på en annan.

Relationsmodellen är kursens kärna eftersom den ger:

- ett precist sätt att resonera om struktur och giltighet;
- ett deklarativt frågespråk i SQL-familjen;
- en tydlig separation mellan logisk representation och fysisk lagring;
- stor praktisk spridning i allt från inbyggda system till centrala
  verksamhetssystem.

Det finns också dokumentdatabaser, grafdatabaser, nyckel–värde-databaser,
kolumnfamiljsdatabaser och specialiserade system för exempelvis tidsserier eller
vektorsökning. Dessa är inte ”databaser utan regler”. De har andra modeller,
styrkor och avvägningar. Ett senare kapitel jämför dem utifrån krav; det här
kompendiet börjar med relationsmodellen.

## 1.10 Genomarbetat exempel: vad behöver Nordic Brew?

Anta att verksamheten vill kunna svara på följande frågor:

- Vilken kund gjorde beställning 1042?
- Vilka produkter och kvantiteter ingår?
- Vilket pris avtalades när ordern lades?
- Är alla angivna produkter giltiga?
- Kan hela ordern avbrytas om lagret inte räcker?

Frågorna antyder olika krav:

1. Kunder, beställningar och produkter behöver kunna identifieras.
2. Sambanden mellan dem behöver uttryckas.
3. Kvantitet och avtalat pris hör till en viss produktrad i en viss order.
4. Databasen bör hindra en orderrad från att hänvisa till en okänd produkt.
5. skapandet av order och förändringen av lager behöver kunna behandlas som en
   logisk enhet.

Redan här ser vi hela kursens båge. Kapitel 2 ger språket för tabeller, nycklar
och villkor. Kapitel 3 modellerar verksamheten utan att besluta om SQL. Senare
kapitel översätter, normaliserar, frågar och hanterar transaktionen.

### Stanna upp och förutsäg

Nordic Brew visar kundens leveransadress i en orderbekräftelse. Var bör adressen
lagras?

- endast hos kunden;
- endast hos beställningen;
- på båda ställena;
- någon annanstans.

Det finns inget korrekt svar utan en verksamhetsregel. Om ordern ska bevara den
adress som faktiskt användes vid köpet behöver beställningen en ögonblicksbild,
även om kunden senare ändrar sin standardadress. Om bara aktuell adress är
relevant kan ett annat beslut vara rimligt. Databasdesign börjar alltså inte med
att rita rutor; den börjar med att precisera betydelse och tid.

## 1.11 Övning: avgränsa ett informationssystem

{: .exercise }
> En studentförening lånar ut utrustning. I dag finns medlemmar i ett kalkylblad,
> utrustning i ett annat och bokningar i en kalender. En medlem kan ha flera
> kontaktvägar. Utrustning kan reserveras i förväg och måste återlämnas innan en
> ny utlåning. Styrelsen vill veta vem som har ett föremål, vilka bokningar som
> krockar och vilka föremål som ofta går sönder.

Besvara utan att rita tabeller:

1. Vilka aktörer och arbetsprocesser ingår i informationssystemet?
2. Ge fem exempel på data och två exempel på metadata.
3. Vilka tre regler bör sannolikt upprätthållas centralt?
4. Vilka delar hör till presentation, applikationslogik respektive datalager?
5. Nämn en fråga där kravet är för otydligt för att modelleras säkert.

<details class="answer">
<summary>Förslag till lösningsprinciper</summary>

Ett rimligt svar nämner åtminstone medlem, materialansvarig och eventuellt
reparatör som aktörer samt bokning, utlämning, återlämning och felrapportering
som processer. Medlemsnummer, föremålsnummer, bokningstid och status är data;
definitionen av statusvärden och uppgift om vem som ansvarar för en datamängd
är metadata. Centrala regler kan vara unik medlem/föremål, förbud mot
överlappande aktiva bokningar och krav på att ett utlån hänvisar till befintlig
medlem och utrustning.

Frågan ”vilka föremål går ofta sönder?” är medvetet oklar. Vad räknas som ett
fel, vilken tidsperiod gäller och ska frekvensen relateras till antalet utlån?
</details>

## 1.12 Kontrollfrågor

Försök svara utan att titta tillbaka.

1. Varför är `nordicbrew.sqlite` inte samma sak som SQLite?
2. Vad är skillnaden mellan schema och instans?
3. Ge ett exempel där samma värde fungerar som metadata i ett sammanhang och
   vanlig data i ett annat.
4. Vilken designnivå besvarar frågan ”ska vi ha ett index på `Orderdatum`?”
5. Varför kan en konsekvent databas ändå innehålla felaktiga uppgifter?
6. Nämn två situationer där ett kalkylblad kan vara ett rimligare val än ett
   fleranvändar-DBMS.

<details class="answer">
<summary>Korta svar</summary>

1. Filen innehåller en viss databas; SQLite är programvaran som hanterar den.
2. Schemat anger struktur och regler, instansen är aktuella lagrade värden.
3. Exempelvis ett kolumnnamn beskriver tabellens data men lagras självt i
   systemkatalogen.
4. Fysisk design.
5. Databasen kan upprätthålla en felaktigt formulerad regel eller få korrekta
   värdetyper men osanna värden.
6. Exempelvis en tillfällig personlig beräkning eller en liten fristående lista
   utan samtidiga ändringar och komplexa samband.
</details>

## 1.13 Sammanfattning

- Data blir tolkningsbar genom struktur, metadata och ett användningssammanhang.
- Databasen är en organiserad och varaktig samling relaterade data; DBMS:et är
  programvaran som hanterar databaser.
- En klient, ett DBMS och en databasfil är skilda komponenter.
- Informationssystemet omfattar också människor, processer, regler,
  applikationer och gränssnitt.
- Schemat beskriver struktur och villkor; instansen är innehållet vid en viss
  tidpunkt.
- Konceptuell, logisk och fysisk design besvarar olika frågor.
- Relationsdatabasen är kursens huvudmodell, men valet av datalösning ska alltid
  motiveras av behov.

## Vidare läsning

- Uppsala universitet, [kursplan för
  2IS007](https://www.uu.se/utbildning/kursplan?query=d21c4f3c-a296-11f0-af30-479161e74134).
- SQLite, [About SQLite](https://www.sqlite.org/about.html).
- ISO/IEC 11179-1:2023, *Metadata registries – Framework* (för ett mer formellt
  metadataperspektiv; inte kurskrav).
