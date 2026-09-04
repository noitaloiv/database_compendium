---
layout: default
title: 2. Relationsmodellen
parent: Del I – Modeller och relationer
nav_order: 2
permalink: /docs/del-1-grunder/relationsmodellen/
keywords:
  - relationsmodell
  - relational model
  - relation
  - tabell
  - tupel
  - tuple
  - rad
  - attribut
  - kolumn
  - domän
  - primärnyckel
  - primary key
  - främmande nyckel
  - foreign key
  - PK
  - FK
  - NULL
---

# 2. Relationsmodellen

I föregående kapitel såg vi att Nordic Brew behöver hålla reda på kunder,
beställningar och produkter. Det är frestande att omedelbart öppna ett verktyg
och skapa tabeller. Men en tabell i ett gränssnitt är bara en visuell form. För
att kunna bedöma om strukturen är korrekt behöver vi en modell som talar om vad
rader, kolumner, nycklar och samband betyder.

**Relationsmodellen** ger ett sådant språk. Den beskriver data som relationer
och definierar hur giltighet och härledning kan uttryckas oberoende av hur
värdena råkar ligga på disk.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- förklara relation, attribut, tupel, domän, relationsschema och relationsinstans;
- skilja relationsmodellens begrepp från SQL:s praktiska tabeller;
- identifiera supernycklar, kandidatnycklar, primärnyckel och alternativnycklar;
- förklara främmande nycklar och referentiell integritet;
- resonera om `NULL` utan att behandla det som noll eller tom text;
- granska en liten relationsstruktur och avgöra vilka rader som är giltiga;
- beskriva relevanta skillnader mellan den logiska modellen och SQLite.
</div>

## 2.1 Relationer, tupler och attribut

En **relation** kan informellt förstås som en tabell, men den formella idén är
mer precis. Relationen har:

- ett namn;
- en uppsättning namngivna **attribut**;
- en **domän** för varje attribut, alltså vilka slags värden attributet kan anta;
- en mängd **tupler**, där varje tupel har ett värde för varje attribut.

I ett DBMS visas attribut normalt som kolumner och tupler som rader.

| KundID | Namn | Epost |
| ---: | --- | --- |
| 17 | Mira Ek | mira@example.test |
| 24 | Samir Noor | samir@example.test |
| 31 | Lo Chen | lo@example.test |

Tabellen ovan kan beskriva en relation med namnet `KUND`. Attributen är
`KundID`, `Namn` och `Epost`; varje rad representerar en tupel.

Ett **relationsschema** anger relationens namn och attribut samt tillhörande
regler. Vi använder följande tydliga textnotation:

```text
KUND(KundID, Namn, Epost)
PK: KundID
AK: Epost
```

`PK` markerar vald primärnyckel och `AK` en alternativ kandidatnyckel. Den
aktuella mängden tupler kallas relationens **instans**.

<figure class="figure">
  <img src="{{ '/assets/images/03-relationens-delar.svg' | relative_url }}"
       alt="Tabellen Kund med relationens namn, attributen KundID, Namn och Epost, en markerad tupel samt domäner för varje attribut." />
  <figcaption><strong>Figur 2.1.</strong> En praktisk tabellrepresentation av relationen KUND. Domänerna begränsar vilka värden som har avsedd betydelse.</figcaption>
</figure>

### Ordningen bär inte betydelsen

I den formella relationsmodellen är en relation en mängd. Därför gäller:

- tuplerna har ingen inneboende första eller sista position;
- attribut identifieras med namn, inte med visuell kolumnposition;
- samma tupel förekommer inte flera gånger i samma relation.

SQL är inspirerat av men inte identiskt med den formella modellen. Ett
SQL-resultat kan innehålla dubletter om `DISTINCT` inte används, och ett
praktiskt DBMS visar ofta rader i en tillfällig fysisk ordning. Om ordningen i
ett SQL-resultat spelar roll måste den anges med `ORDER BY`.

{: .mistake }
> ”Raden ovanför” är inte ett stabilt relationsbegrepp. En order ska hänvisa
> till sin kund med ett identifierande värde, inte genom att ligga nära kunden
> i en fil eller på skärmen.

## 2.2 Domäner: mer än en lagringstyp

En **domän** är den mängd tillåtna värden som har samma avsedda slag och kan
behandlas på ett meningsfullt sätt. `KundID` och `Antal` kan båda lagras som
heltal, men de tillhör inte därför samma begreppsliga domän. Det är meningsfullt
att jämföra två kundidentifierare för likhet, men inte att addera ett kund-ID
till en orderkvantitet.

Domänen för `Antal` kan exempelvis beskrivas som:

```text
heltal där Antal > 0
```

En SQL-datatyp uttrycker en del av domänen, men sällan hela betydelsen. För
`Antal` behövs både typ och ett villkor. För `Epost` kan korrekt syntax
kontrolleras delvis, medan frågan om adressen faktiskt tillhör kunden kräver en
annan process.

### Atomära värden

Varje attributvärde ska vara ett värde ur sin domän, inte en dold lista med
värden som databasen förväntas dela upp i efterhand. Följande kolumn gör det
svårt att kontrollera och söka telefonnummer:

| KundID | Telefoner |
| ---: | --- |
| 17 | `070-1111111; 018-222222` |

Om verksamheten behöver behandla numren var för sig bör de modelleras var för
sig. ”Atomär” är dock beroende av användningen. En postadress kan vara ett enda
textvärde om ingen del någonsin hanteras separat, men bör delas eller modelleras
som ett eget objekt om postnummer, land och adresshistorik har egna regler.

## 2.3 Nycklar och identifiering

En **supernyckel** är en uppsättning attribut vars kombinerade värden unikt
identifierar varje tupel i en relation. Om `KundID` är unikt är både
`{KundID}` och `{KundID, Namn}` supernycklar.

En **kandidatnyckel** är en minimal supernyckel. Minimal betyder att inget
attribut kan tas bort och ändå bevara unikheten. `{KundID, Namn}` är därför
inte en kandidatnyckel om `{KundID}` redan är unikt.

En kandidatnyckel väljs till **primärnyckel**. Övriga kandidatnycklar kallas
**alternativnycklar**. Valet av primärnyckel gör inte de andra kandidaterna
mindre unika; de behöver fortfarande ett unikhetsvillkor om regeln ska
upprätthållas.

### Naturlig eller artificiell nyckel

En **naturlig nyckel** har betydelse i verksamheten, exempelvis ett etablerat
produktnummer. En **artificiell nyckel** (surrogatnyckel) införs främst för
identifiering i systemet, exempelvis ett genererat heltal.

Ett artificiellt ID löser inte alla identifieringsfrågor. Om två kundrader inte
får ha samma e-postadress måste `Epost` fortfarande vara unikt, även om
`KundID` är primärnyckel. Samtidigt är e-post ofta en dålig primärnyckel: den
kan ändras, innehåller personuppgifter och kan vara svår att hantera i alla
sammanhang.

Bedöm en nyckelkandidat utifrån:

- unikhet i hela den relevanta populationen;
- minimalitet;
- stabilitet över tid;
- om ett värde alltid finns när objektet skapas;
- lämplighet att sprida till andra relationer och system.

### Sammansatta nycklar

I en order får samma produkt normalt förekomma högst en gång. Då kan paret
`{OrderID, ProduktID}` identifiera en orderrad:

```text
ORDERRAD(OrderID, ProduktID, Antal, AvtalatStyckprisOre)
PK: (OrderID, ProduktID)
```

Varken `OrderID` eller `ProduktID` räcker ensamt, men kombinationen gör det.

## 2.4 Främmande nycklar och samband

En **främmande nyckel** är ett eller flera attribut i en relation vars värde ska
motsvara en kandidatnyckel i en refererad relation – eller vara `NULL` om
sambandet är valfritt och kolumnen tillåter det.

Anta schemana:

```text
KUND(KundID, Namn, Epost)
PK: KundID

BESTALLNING(OrderID, Orderdatum, KundID)
PK: OrderID
FK: KundID → KUND.KundID
```

Värdet `BESTALLNING.KundID = 17` representerar att beställningen hör till den
kund vars `KundID` är 17. Det är lika värden och ett deklarerat villkor som
skapar den logiska kopplingen.

<figure class="figure">
  <img src="{{ '/assets/images/04-relationsstruktur-nordicbrew.svg' | relative_url }}"
       alt="Fyra tabeller: Kund, Beställning, Orderrad och Produkt. Pilar visar främmande nycklar från Beställning till Kund och från Orderrad till Beställning respektive Produkt." />
  <figcaption><strong>Figur 2.2.</strong> En liten relationsstruktur. Pilarna visar referenser från främmande nyckel till refererad nyckel, inte fysisk lagring.</figcaption>
</figure>

### Referentiell integritet

**Referentiell integritet** innebär här att varje icke-tomt kund-ID i
`BESTALLNING` måste finnas i `KUND`. Följande rad är därför ogiltig om kund 99
saknas:

| OrderID | Orderdatum | KundID |
| ---: | --- | ---: |
| 1048 | 2027-01-17 | 99 |

När en refererad rad tas bort måste databasen följa en uttalad policy, till
exempel:

- vägra borttagningen (`RESTRICT`/`NO ACTION`);
- ta bort beroende rader (`CASCADE`);
- sätta referensen till `NULL` om det är tillåtet (`SET NULL`).

Ingen policy är generellt bäst. Att kaskadradera från en kund till historiska
beställningar kan vara katastrofalt, medan kaskad från en testorder till dess
  orderrader kan vara rimlig. Policyn ska följa betydelse och ansvar.

## 2.5 Fyra grupper av integritetsvillkor

Ett **integritetsvillkor** avgränsar tillåtna databastillstånd. En användbar
indelning är:

| Grupp | Fråga | Exempel |
| --- | --- | --- |
| Domänintegritet | Är värdet av rätt slag och inom tillåtet område? | `Antal > 0` |
| Nyckel-/entitetsintegritet | Kan varje rad identifieras entydigt? | unik och icke-tom primärnyckel |
| Referentiell integritet | Hänvisar värdet till en tillåten rad? | varje `ProduktID` i orderrad finns i produkt |
| Verksamhetsregel | Är tillståndet giltigt för just verksamheten? | leveransdatum får inte ligga före orderdatum |

Alla regler kan inte eller bör inte uttryckas med ett enkelt kolumnvillkor. En
regel som spänner över många rader, tid eller externa händelser kan behöva
applikationslogik, transaktioner eller andra mekanismer. Målet är inte att
trycka in varje regel i en `CHECK`, utan att göra ansvaret explicit.

## 2.6 `NULL`: frånvaro av ett känt värde

`NULL` är SQL:s markör för att ett vanligt värde saknas. Det kan bero på att
värdet är okänt, ännu inte registrerat eller inte tillämpligt. Dessa orsaker är
inte alltid likvärdiga, vilket är ett skäl att använda `NULL` med eftertanke.

`NULL` är inte:

- talet noll;
- en tom text `''`;
- ordet `'NULL'`;
- ett värde som är lika med ett annat `NULL`.

Jämförelsen `Leveransdatum = NULL` ger därför inte `TRUE`. I SQL används:

```sql
WHERE Leveransdatum IS NULL
```

### Trevärd logik

När ett jämförelseled saknas kan resultatet bli `UNKNOWN` utöver `TRUE` och
`FALSE`. En `WHERE`-sats behåller bara rader där villkoret blir `TRUE`.

Om `RabattProcent` är `NULL` blir uttrycket
`RabattProcent > 0` alltså `UNKNOWN`, och raden väljs inte. Samma rad väljs inte
heller av `NOT (RabattProcent > 0)`, eftersom `NOT UNKNOWN` fortfarande är
`UNKNOWN`.

{: .mistake }
> Formuleringen ”`NULL` betyder okänd” är en förenkling. I en viss kolumn kan
> det betyda ”inte tillämpligt” eller ”ännu inte registrerat”. Om skillnaden är
> viktig behöver modellen uttrycka den, exempelvis med en status eller en annan
> struktur.

## 2.7 Relationsmodell och SQL är inte samma sak

Relationsmodellen är en abstrakt modell. SQL är en språkfamilj som realiserar
många av dess idéer men också innehåller praktiska utvidgningar.

| Relationsmodell | SQL/DBMS i praktiken |
| --- | --- |
| Relation är en mängd utan dubletter | Frågeresultat kan vara en ”bag” med dubletter |
| Ingen inneboende radordning | Visningsordning kan variera; `ORDER BY` krävs |
| Attributvärden kommer ur domäner | SQL-typer och villkor approximerar domäner |
| Klassisk modell använder vanliga domänvärden | SQL använder `NULL` och trevärd logik |
| Logisk struktur är oberoende av lagring | DBMS väljer filer, sidor, index och planer |

Skillnaderna gör inte SQL ”fel”. De gör det viktigt att säga om ett resonemang
gäller den formella modellen, SQL-standarden eller en viss produkt.

## 2.8 SQLite: kursverktyg med egna regler

SQLite är litet, distribuerbart och mycket användbart i undervisning, men det
ska inte presenteras som om allt beteende gäller varje relations-DBMS.

### Dynamisk typning och `STRICT`

I vanlig SQLite är typen i hög grad knuten till det lagrade värdet. Kolumnens
deklaration ger en **type affinity** – en rekommenderad konvertering – snarare
än samma rigida kontroll som i många andra DBMS. Från SQLite 3.37 kan en tabell
deklareras `STRICT`, vilket ger striktare typkontroll.

Kursens exempelschema använder `STRICT` när det är möjligt:

```sql
CREATE TABLE Kund (
    KundID INTEGER PRIMARY KEY,
    Namn TEXT NOT NULL,
    Epost TEXT NOT NULL UNIQUE
) STRICT;
```

Detta gör fel synligare för nybörjaren utan att låtsas att `TEXT` ensam uttrycker
hela domänen.

### Främmande nycklar måste aktiveras

I SQLite ska främmande nyckelkontroll aktiveras för varje anslutning:

```sql
PRAGMA foreign_keys = ON;
```

Kontrollera inställningen med:

```sql
PRAGMA foreign_keys;
```

Om resultatet är `1` är kontrollen aktiv för anslutningen. Ett schema som
deklarerar främmande nycklar men körs med kontrollen avstängd ger ett farligt
intryck av säkerhet.

### Datum är en representation

SQLite har ingen separat inbyggd lagringsklass för datum. I materialet lagras
datum som ISO-formaterad text, exempelvis `2027-01-17`, tillsammans med
kontroller och en dokumenterad tolkning. Andra DBMS har egna `DATE`-typer.

Se det fullständiga, körbara skriptet
[`nordicbrew-minimal.sql`]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}).

## 2.9 Genomarbetat exempel: fyra relationer

Vi använder följande scheman:

```text
KUND(KundID, Namn, Epost)
PK: KundID
AK: Epost

PRODUKT(ProduktID, Produktnamn, ListprisOre, Aktiv)
PK: ProduktID
AK: Produktnamn

BESTALLNING(OrderID, Orderdatum, KundID, Status)
PK: OrderID
FK: KundID → KUND.KundID

ORDERRAD(OrderID, ProduktID, Antal, AvtalatStyckprisOre)
PK: (OrderID, ProduktID)
FK: OrderID → BESTALLNING.OrderID
FK: ProduktID → PRODUKT.ProduktID
```

Observera att orderraden lagrar **avtalat** pris. Produktens aktuella listpris
kan ändras utan att historiska ordervärden ska ändras.

### Bedöm fem föreslagna rader

Anta att kund 17, order 1042 och produkt 501 finns. `ORDERRAD` innehåller redan
`(1042, 501, 2, 12900)`.

| Förslag | Giltigt? | Skäl |
| --- | --- | --- |
| `(1042, 502, 1, 8900)` | Ja, om produkt 502 finns | Ny sammansatt nyckel och giltiga referenser |
| `(1042, 501, 3, 12900)` | Nej som ny rad | Primärnyckeln `(1042, 501)` finns redan |
| `(1042, 999, 1, 5000)` | Nej, om produkt 999 saknas | Bryter referentiell integritet |
| `(1042, 502, 0, 8900)` | Nej | Bryter domänvillkoret `Antal > 0` |
| `(1042, 502, 1, NULL)` | Nej | Avtalat pris är obligatoriskt |

Notera formuleringen ”om produkt 502 finns”. Giltighet avgörs inte av raden
isolerad; vissa villkor beror på databasens övriga instans.

### Från samband till fråga

För att hitta kundens namn för order 1042 behöver DBMS:et kombinera de rader
där `BESTALLNING.KundID` och `KUND.KundID` har samma värde. I SQL:

```sql
SELECT b.OrderID, k.Namn
FROM Bestallning AS b
JOIN Kund AS k ON k.KundID = b.KundID
WHERE b.OrderID = 1042;
```

Detta är en förhandsblick. Kapitel 6–7 förklarar operatorerna och hur resultat
kan härledas. Här är huvudpoängen att en främmande nyckel både upprätthåller ett
samband och ger de matchande värden som en join kan använda.

## 2.10 Vanliga missuppfattningar

### ”Varje tabell har bara en möjlig nyckel”

Nej. En relation kan ha flera kandidatnycklar. En väljs till primärnyckel; de
andra behöver fortfarande skyddas om deras unikhet är en verksamhetsregel.

### ”Ett artificiellt ID gör dubletter omöjliga”

Nej. Två rader kan ha olika `KundID` men beskriva samma kund. Artificiella ID:n
gör rader tekniskt identifierbara; de avgör inte automatiskt när två
verksamhetsobjekt är samma.

### ”En främmande nyckel ligger alltid på många-sidan”

Det är en användbar regel vid översättning av enkla 1:N-associationer, men inte
definitionen av främmande nyckel. 1:1, sammansatta nycklar, associationstabeller
och rekursiva samband kräver ett mer noggrant resonemang, vilket kommer i
kapitel 4.

### ”`NULL` kan ersättas med noll”

Noll är ett känt numeriskt värde. Ett okänt lagersaldo är inte samma sak som att
lagret är tomt. Ersättningen kan skapa falsk information.

## 2.11 Övning: granska ett bokningsschema

En verkstad använder följande relationer:

```text
MEDLEM(MedlemsID, Epost, Namn)
MASKIN(MaskinID, Beteckning, Aktiv)
BOKNING(MedlemsID, MaskinID, Starttid, Sluttid, Andamal)
```

Verksamhetsregler:

- varje medlem har ett unikt medlems-ID och en unik e-postadress;
- varje maskin har ett unikt maskin-ID;
- en medlem kan boka samma maskin flera gånger, men inte med samma starttid;
- starttid ska ligga före sluttid;
- en bokning måste hänvisa till en befintlig medlem och maskin.

{: .exercise }
> 1. Ange kandidatnycklar för `MEDLEM`.
> 2. Välj och motivera primärnyckel för `BOKNING`.
> 3. Ange alla främmande nycklar.
> 4. Klassificera varje regel som nyckel-, referens-, domän- eller annan
>    verksamhetsregel.
> 5. Förklarar de givna reglerna om överlappande bokningar är tillåtna? Om inte,
>    formulera den saknade regeln.
> 6. Får `Andamal` vara `NULL`? Beskriv två olika verksamhetsbetydelser och hur
>    de påverkar beslutet.

<details class="answer">
<summary>Lösningsprinciper</summary>

`MedlemsID` och `Epost` är kandidatnycklar om båda alltid finns och är unika;
`MedlemsID` är ett rimligt primärnyckelval. En sammansatt nyckel
`(MedlemsID, MaskinID, Starttid)` uppfyller den uttalade regeln för `BOKNING`,
men en artificiell `BokningID` plus ett separat unikhetsvillkor är också ett
möjligt designval. `MedlemsID` och `MaskinID` i `BOKNING` är främmande nycklar.

Regeln `Starttid < Sluttid` är ett radbaserat domän-/verksamhetsvillkor. De
givna reglerna förbjuder inte att två olika medlemmar bokar samma maskin under
överlappande tider; om det inte är tillåtet måste detta uttryckas särskilt. Om
ändamål är frivillig kommentar kan `NULL` vara rimligt. Om ett ändamål krävs
för säkerhetsbedömning bör det vara obligatoriskt eller modelleras med en
kontrollerad kategori.
</details>

## 2.12 Kontrollfrågor

1. Varför är `{KundID, Namn}` en supernyckel men inte nödvändigtvis en
   kandidatnyckel?
2. Kan en relation ha två kandidatnycklar? Ge ett exempel.
3. Vad garanterar en främmande nyckel – och vad garanterar den inte?
4. Varför krävs `ORDER BY` när resultatordningen betyder något?
5. Vad händer i en `WHERE`-sats när ett villkor blir `UNKNOWN`?
6. Varför är SQL-typen `INTEGER` inte en fullständig domändefinition för
   `Antal`?
7. Vilka två SQLite-inställningar/egenskaper behöver kursens nybörjare särskilt
   känna till?

<details class="answer">
<summary>Korta svar</summary>

1. Kombinationen är unik om `KundID` är unik, men `Namn` kan tas bort utan att
   unikheten försvinner; nyckeln är inte minimal.
2. Ja, exempelvis `KundID` och `Epost` om båda är unika, obligatoriska och
   stabila nog för relationens identifiering.
3. Den garanterar att en icke-tom referens motsvarar en tillåten refererad
   nyckel. Den garanterar inte att verksamhetssambandet är sant i verkligheten
   eller att alla andra regler är uppfyllda.
4. Relationer har ingen inneboende radordning och DBMS får välja åtkomstplan.
5. Raden behålls inte; endast `TRUE` passerar filtret.
6. Den säger inget om exempelvis positivitet, enhet eller högsta tillåtna antal.
7. Bland annat dynamisk typning/type affinity och att främmande nyckelkontroll
   måste aktiveras per anslutning; `STRICT` och datumrepresentation är också
   viktiga.
</details>

## 2.13 Sammanfattning

- En relation har namngivna attribut, domäner och en mängd tupler.
- Ett relationsschema beskriver struktur och regler; en instans är aktuella
  tupler.
- Rad- och kolumnordning bär inte logisk betydelse.
- Kandidatnycklar är minimala unika attributuppsättningar; en väljs till
  primärnyckel.
- Främmande nycklar och referentiell integritet gör samband explicita och
  kontrollerbara.
- `NULL` är en markör för saknat vanligt värde och ger trevärd logik.
- Relationsmodellen, SQL och SQLite måste hållas isär när deras regler skiljer
  sig.
- SQLite är ett bra kursverktyg, men `PRAGMA foreign_keys = ON`, typaffinitet,
  `STRICT` och datumrepresentation ska behandlas uttryckligen.

## Vidare läsning

- SQLite, [Datatypes in SQLite](https://www.sqlite.org/datatype3.html).
- SQLite, [STRICT Tables](https://www.sqlite.org/stricttables.html).
- SQLite, [Foreign Key Support](https://www.sqlite.org/foreignkeys.html).
- Codd, E. F. (1970), ”A Relational Model of Data for Large Shared Data Banks”
  (historisk fördjupning; inte kurskrav).
