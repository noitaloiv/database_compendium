---
layout: default
track: grundspar
prerequisites: "Kapitel 4 och 7: primärnycklar, främmande nycklar och relationsscheman."
focus: "Bygg en enkel tabell och lägg till en regel i taget."
title: 16. Skapa tabeller och integritetsvillkor
parent: Del II – Frågor och förändring
nav_order: 16
permalink: /docs/del-2-fragor/skapa-tabeller-och-integritetsvillkor/
description: Bygg en tabell med en regel i taget och pröva nycklar, obligatoriska värden och hänvisningar.
keywords: [SQL, DDL, CREATE TABLE, PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK]
---

# 16. Skapa tabeller och integritetsvillkor

{% include chapter_guide.html %}

Hittills har tabellerna redan funnits när vi ställt frågor. Nu ska vi skapa dem och uttrycka de regler som gör att lagrade rader får den avsedda betydelsen. Vi börjar med en kundtabell och lägger sedan till beställningar som hänvisar till kunderna.

Den del av SQL som definierar strukturen kallas ofta *Data Definition Language*, DDL. Du behöver framför allt känna igen vad `CREATE TABLE` gör: satsen beskriver hur framtida rader ska vara uppbyggda. Den lägger inte i sig in några kunduppgifter.

<aside class="practice-guide" markdown="1">
**Pröva i SQLite:** skapa en ny, tom databas enligt [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}). Exempeltabellerna nedan har namn som redan används i Nordic Brew, så kör dem i den nya databasen. <code>CREATE TABLE</code> körs en gång per tabell. Avsnitt 16.12 har en separat, återställningsbar startfil.
</aside>

## 16.1 Börja med kolumner och en nyckel

```sql
CREATE TABLE Customer (
    CustomerID INTEGER PRIMARY KEY,
    CustomerName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE
);
```

Definitionen skapar tabellen `Customer` och beskriver vad en framtida kundrad måste innehålla. `CustomerID` får typen <code>INTEGER</code> och väljs till primärnyckel, så att raden kan identifieras. För namnet väljer vi <code>TEXT</code> och lägger till <code>NOT NULL</code>, eftersom en kund enligt modellen inte ska registreras utan ett namn. E-postadressen får samma krav på ett angivet textvärde, men även <code>UNIQUE</code>: två kunder ska i detta exempel inte dela adress.

Parentesen samlar kolumnerna och deras regler. Kommatecknen skiljer definitionerna åt, medan semikolonet visar var hela SQL-satsen slutar. I de följande avsnitten prövar vi varför varje regel behövs och vad den kan kontrollera.

Efter körningen har kundtabellen skapats, men eftersom vi ännu inte har lagt in någon kund ska `SELECT * FROM Customer;` ge ett tomt resultat. Det visar skillnaden mellan att definiera strukturen och att fylla den med innehåll; tomheten är här helt förväntad.

## 16.2 Välj datatyp utifrån betydelsen

`INTEGER` används här för heltal och `TEXT` för text. Ett antal lämpar sig för heltal, medan ett telefonnummer ofta bör vara text även när det består av siffror. Telefonnumrets inledande nollor och eventuella plustecken är betydelsebärande, och numret ska normalt inte summeras.

Nordic Brews priser lagras som heltal i öre, så 12900 betyder 129 kronor. Datum lagras i övningarna som text i formatet år–månad–dag. <code>TEXT</code> garanterar däremot inte att texten är ett verkligt datum.

SQLite har flexibel typhantering i vanliga tabeller: en deklarerad datatyp fungerar inte alltid som ett strikt förbud mot andra slags värden. Därför fokuserar våra regeltester på uttryckliga nyckel- och integritetsvillkor. Andra DBHS och SQLite-tabeller med strikt typhantering kan kontrollera typer annorlunda. Typvalets betydelse är grundläggande; systemens alla typregler är ett separat fördjupningsområde.

## 16.3 <code>NOT NULL</code> kräver ett värde

Tänk dig att en kundrad ska registreras utan något namn. `NOT NULL` stoppar att den kolumnen lämnas med <code>NULL</code>, eftersom modellens regel kräver ett angivet värde. Men om någon i stället skriver en tom textsträng eller ett felaktigt namn finns fortfarande ett textvärde. Villkoret kan därför vara uppfyllt trots att registreringen inte går att använda som avsett.

För att en namnregistrering ska bli användbar kan ytterligare kontroller behövas, men först behöver vi skilja mellan två frågor: finns ett värde över huvud taget, och är det värdet lämpligt för ändamålet? `NOT NULL` hjälper oss med den första frågan. För den andra måste verksamheten precisera vad som ska godtas och hur det kan kontrolleras.

## 16.4 <code>PRIMARY KEY</code> och <code>UNIQUE</code> uttrycker entydighet

Kundnumret ska identifiera kundraden, så primärnyckeln behöver både ha ett värde och skilja raden från alla andra kunder. För en ensam heltalsnyckel uttrycker vi detta med `INTEGER PRIMARY KEY` i SQLite. När en nyckel består av två kolumner skriver vi i stället uttryckligen `NOT NULL` på båda delarna, så att ingen del av identifieraren får saknas.

E-postadressens <code>UNIQUE</code> är en ytterligare regel, inte en andra primärnyckel. I kombination med <code>NOT NULL</code> skyddar den e-postadressen som alternativ identifierare enligt vår valda verksamhetsregel. Om kunder får dela adress ska just den regeln ändras; en unikhetsregel ska inte införas bara för att dagens adresser råkar vara olika.

## 16.5 <code>CHECK</code> prövar ett villkor

En produkts listpris får inte vara negativt. Vi uttrycker detta nära den berörda kolumnen:

```sql
CREATE TABLE Product (
    ProductID INTEGER PRIMARY KEY,
    ProductName TEXT NOT NULL,
    ListPriceOre INTEGER NOT NULL CHECK (ListPriceOre >= 0)
);
```

För att förstå varför båda villkoren behövs kan vi pröva två olika fel. Ett pris på −100 avvisas av `CHECK (ListPriceOre >= 0)`, eftersom jämförelsen är falsk. Om priset i stället lämnas som `NULL` blir jämförelsen inte falsk utan okänd, vilket inte räcker för att `CHECK` ska avvisa raden. Därför behövs också `NOT NULL`, som uttryckligen kräver att ett pris anges. Tillsammans skyddar villkoren både att uppgiften finns och att den uppfyller prisgränsen. För ett antal som måste vara positivt väljer vi på motsvarande sätt `NOT NULL` tillsammans med `CHECK (Quantity > 0)`.

**Fyll i:** Ska en uthyrnings dygnspris få vara noll men inte negativt, vilket tecken behövs framför noll?

<details class="answer" markdown="1">
<summary>Visa svar</summary>

`>= 0`, alltså större än eller lika med noll. `> 0` skulle även förbjuda kostnadsfria uthyrningar.
</details>

<figure class="figure" id="figur-16-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 16.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/34-prisvillkor.svg' | relative_url }}" alt="Tre testvärden jämförs. NULL avvisas av NOT NULL. Minus 100 avvisas av CHECK. Noll uppfyller båda villkoren." width="900" height="390" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 16.1.</strong> Värdet måste både anges och vara minst noll. Testa därför frånvaro, ett negativt värde och själva gränsen. <a href="{{ '/assets/images/34-prisvillkor.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 16.6 <code>FOREIGN KEY</code> gör hänvisningen kontrollerbar

Varje beställning ska höra till en befintlig kund. I denna första tabell tar vi bara med de två nycklar som behövs för att visa sambandet:

```sql
CREATE TABLE SalesOrder (
    OrderID INTEGER PRIMARY KEY,
    CustomerID INTEGER NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
```

`REFERENCES` anger vilken tabell och kolumn som kundnumret måste motsvara. <code>FOREIGN KEY</code> hindrar en hänvisning till en kund som saknas, medan <code>NOT NULL</code> kräver att varje order alls anger någon kund. Ingen av reglerna hindrar att samma kundnummer förekommer på flera beställningar.

## 16.7 Aktivera kontrollen i SQLite

Våra startfiler aktiverar SQLite-kontrollen av främmande nycklar med följande inställning. Den behöver vara aktiv för varje anslutning och sättas innan en transaktion påbörjas:

```sql
PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;
```

Den sista raden frågar efter inställningen och ska ge 1. Om den ger 0 är kontrollen avstängd i den anslutningen. Om klienten redan har en transaktion öppen behöver den avslutas innan inställningen ändras. <code>PRAGMA</code>-raderna är verktygsinställningar för SQLite, inte ytterligare en typ av verksamhetsregel att modellera.

## 16.8 När två kolumner identifierar tillsammans

Om en produkt får förekomma högst en gång på en viss order kan kombinationen av ordernummer och produktnummer identifiera orderraden:

```sql
CREATE TABLE OrderLine (
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES SalesOrder(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);
```

Eftersom det är två kolumner tillsammans som identifierar orderraden står `PRIMARY KEY` på en egen rad i definitionen. Kombinationen `(1042, 501)` får då bara förekomma en gång, medan `(1042, 502)` är en annan tillåten orderrad på samma beställning. Även `(1043, 501)` är möjlig: samma produkt har då beställts på en annan order. Regeln gäller alltså kombinationen, inte att varje ordernummer eller produktnummer måste vara unikt för sig. Om samma produkt ska få förekomma på flera separata rader inom en och samma order behöver vi välja en annan identifierare.

## 16.9 Skapa i en begriplig ordning

Skapa först <code>Customer</code> och <code>Product</code>, därefter <code>SalesOrder</code> och till sist <code>OrderLine</code>. Då finns de refererade tabellerna redan när vi kommer till hänvisningarna. När övningsstrukturen ska återställas tar ett startskript i stället bort beroende tabeller före dem som de hänvisar till.

`DROP TABLE` tar bort både struktur och innehåll. Våra startfiler använder det för att återskapa kända övningsdata. Kör dem därför bara i den övningsdatabas som instruktionen avser.

## 16.10 Knyt varje villkor till en regel

| Regel | Konstruktion |
| --- | --- |
| Kundnummer identifierar kunden | <code>PRIMARY KEY</code> |
| En e-postadress får bara användas av en kund och måste anges | <code>UNIQUE</code> och <code>NOT NULL</code> |
| Priset ska finnas och får inte vara negativt | <code>NOT NULL</code> och <code>CHECK</code> |
| En order ska hänvisa till en befintlig kund | <code>NOT NULL</code> och <code>FOREIGN KEY</code> |
| En orderrad identifieras av sin order och produkt | Sammansatt <code>PRIMARY KEY</code> |

Tabellen hjälper oss att översätta verksamhetsregler till kod, men alla regler passar inte i en enda kolumndefinition. Om regeln beror på flera rader tillsammans behöver vi först undersöka vad som måste jämföras och därefter avgöra vilka ytterligare kontroller som krävs.

## 16.11 Pröva med både tillåtna och otillåtna värden

Att <code>CREATE TABLE</code> körs utan fel visar att systemet accepterar definitionen. För att undersöka om den upprätthåller vår avsikt behöver vi också pröva innehållet. Ett negativt pris ska avvisas, men ett pris på noll ska accepteras om regeln tillåter det.

Ett test med −1 kan visa att ett negativt pris avvisas, men säger inget om huruvida noll hanteras rätt. Genom att även pröva 0 och 1 ser vi var gränsen faktiskt går och kan upptäcka att `>` råkade väljas när `>=` behövdes. Prövar vi dessutom `NULL` kontrollerar vi om kravet på ett angivet pris verkligen finns. Varje test ska därmed svara på en bestämd fråga om regeln, inte bara ge ett allmänt besked om att tabellen fungerar.

## 16.12 Guidad övning: uthyrning av en utrustning

**Start:** skapa en tom databas med namnet `rental-lab.db` och öppna [rental-starter.sql]({{ '/assets/sql/rental-starter.sql' | relative_url }}) i klientens SQL-editor. Filen innehåller en fungerande första tabell och anvisningar för nästa steg. Kör hela startfilen en gång. Den tar bort tidigare övningstabeller med samma namn.

Vi avgränsar fallet: varje uthyrning gäller **en** utrustning under ett positivt antal dagar. Uppgifter om betalning och kunder lämnas utanför just denna övning.

```text
Equipment(EquipmentID, EquipmentName, DailyPriceOre)
PK: EquipmentID

Rental(RentalID, EquipmentID, Days)
PK: RentalID
FK: EquipmentID -> Equipment.EquipmentID
```

1. I startfilens <code>Equipment</code>, lägg till ett villkor som förbjuder negativa dygnspriser men tillåter noll. Kör startfilen igen.
2. Skapa <code>Rental</code>. Alla tre värden ska finnas, <code>Days</code> ska vara större än noll och <code>EquipmentID</code> ska hänvisa till <code>Equipment</code>. Använd mönstret från <code>SalesOrder</code> ovan.
3. Kör följande två testregistreringar. <code>INSERT</code> förklaras i nästa kapitel; här är satserna färdiga testdata att kopiera.

```sql
INSERT INTO Equipment VALUES (11, 'Camera', 25000);
INSERT INTO Rental VALUES (101, 11, 2);
SELECT * FROM Rental;
```

Du ska se uthyrning 101, utrustning 11 och två dagar. Pröva sedan **en felaktig sats i taget** och förklara vilken regel som stoppar den:

```sql
-- Avsiktliga regelbrott: ska avvisas var för sig.
INSERT INTO Equipment VALUES (12, 'Tripod', -100);
INSERT INTO Rental VALUES (102, 99, 1);
INSERT INTO Rental VALUES (103, 11, 0);
```

Första försöket bryter mot prisregeln, andra hänvisar till utrustning som saknas och tredje anger noll dagar. Kontrollera efteråt att tabellerna fortfarande bara har en rad vardera.

<details class="answer" markdown="1">
<summary>Visa lösning och återställning</summary>

Priskolumnen ska vara `DailyPriceOre INTEGER NOT NULL CHECK (DailyPriceOre >= 0)`. <code>Rental</code> kan skrivas:

```sql
CREATE TABLE Rental (
    RentalID INTEGER PRIMARY KEY,
    EquipmentID INTEGER NOT NULL,
    Days INTEGER NOT NULL CHECK (Days > 0),
    FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);
```

En komplett, återställningsbar lösning med de två godkända testraderna finns i [rental-solution.sql]({{ '/assets/sql/rental-solution.sql' | relative_url }}). Ladda den om du vill börja om från det färdiga underlaget. Om hänvisningen till 99 accepterades behöver du även kontrollera <code>PRAGMA</code>-inställningen enligt avsnitt 16.7.
</details>

## 16.13 Bygg en liten databas från ett eget schema

I normaliseringsövning 9.10 skilde vi kontrollen från utrustningen och kontrollanten. Nu kan du pröva övergången till en faktisk databas. **Pröva i SQLite:** skapa en ny tom fil inspection.db och aktivera främmande nycklar med `PRAGMA foreign_keys = ON;` innan du börjar.

```text
Equipment(EquipmentID, EquipmentName)
Inspector(InspectorID, InspectorName)
Inspection(InspectionID, EquipmentID, InspectorID, InspectedAt, Result)
```

Varje tabell identifieras av sitt ensamma ID-attribut, medan utrustningens och kontrollantens namn ska anges utan att krävas vara unika. En kontrollrad måste sedan hänvisa till en befintlig utrustning och en befintlig kontrollant.

För själva kontrollhändelsen krävs en tidpunkt, som här lagras som text, och ett resultat med värdet `PASS` eller `FAIL`. Däremot ska utrustningsnumret få förekomma på flera kontrollrader, eftersom samma utrustning kan behöva kontrolleras igen.

1. Skriv <code>CREATE TABLE</code> för samtliga tre tabeller och motivera villkoren.
2. Lägg in utrustning (7, Lift A), kontrollant (31, Nora Berg) och kontroll 901 för dem vid tidpunkten `2027-01-12 10:00` med resultatet <code>PASS</code>.
3. Försök, ett fall i taget, registrera kontroll 902 med utrustningsnummer 99, kontroll 903 med resultat <code>UNKNOWN</code> och en andra kontroll med <code>InspectionID</code> 901. Vilken regel ska avvisa respektive försök?
4. Kontrollera med <code>SELECT</code> att enbart den tillåtna kontrollen har lagrats. Lägg därefter till kontroll 904 för samma utrustning och kontrollant den 13 januari klockan 10 med resultatet <code>FAIL</code>. Varför ska den tillåtas?

<details class="answer" markdown="1">
<summary>Visa implementation, testresultat och återställning</summary>

```sql
CREATE TABLE Equipment (
    EquipmentID INTEGER PRIMARY KEY,
    EquipmentName TEXT NOT NULL
);
CREATE TABLE Inspector (
    InspectorID INTEGER PRIMARY KEY,
    InspectorName TEXT NOT NULL
);
CREATE TABLE Inspection (
    InspectionID INTEGER PRIMARY KEY,
    EquipmentID INTEGER NOT NULL REFERENCES Equipment(EquipmentID),
    InspectorID INTEGER NOT NULL REFERENCES Inspector(InspectorID),
    InspectedAt TEXT NOT NULL,
    Result TEXT NOT NULL CHECK (Result IN ('PASS', 'FAIL'))
);
```

En [komplett lösningsfil]({{ '/assets/sql/inspection-solution.sql' | relative_url }}) skapar tabellerna och den första tillåtna kontrollen. Kör den i inspection.db om du vill återställa just detta fall. Den tar bort och återskapar de tre tabellerna.

Försöket med utrustning 99 ska avvisas av FK, <code>UNKNOWN</code> ska avvisas av <code>CHECK</code> och ett upprepat kontrollnummer ska avvisas av PK. Använd i övrigt samma giltiga värden som kontroll 901, så att varje försök prövar en regel i taget. Efter de tre avvisade försöken ska antalet kontroller fortfarande vara ett.

Kontroll 904 har en egen identitet och får gälla samma utrustning igen. Efter insättningen ska 901 med <code>PASS</code> och 904 med <code>FAIL</code> finnas. En FK förbjuder inte att samma utrustning förekommer på flera kontroller. Resultatet beskriver varje kontrollhändelse, inte ett enda tidlöst tillstånd hos utrustningen.
</details>

## Kontrollfrågor

1. Vad finns i en nyskapad tabell före första <code>INSERT</code>?
2. Varför behövs både <code>NOT NULL</code> och <code>FOREIGN KEY</code> för en obligatorisk hänvisning?
3. Vad betyder en sammansatt primärnyckel?
4. Varför bör ett regeltest innehålla både ett tillåtet och ett otillåtet värde?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Den nyskapade tabellen har en struktur med kolumner, typer och angivna regler, men inga registrerade rader. En `SELECT` mot den kan därför ge ett tomt resultat trots att `CREATE TABLE` lyckades. För att få en kund i tabellen behöver vi därefter lägga till kundens värden med `INSERT`.

2. De två villkoren kontrollerar olika saker. `FOREIGN KEY` kräver att ett angivet kundnummer motsvarar en tillåten kund, medan `NOT NULL` hindrar att kundnumret helt lämnas utan värde. Tillsammans kan de uttrycka att varje beställning måste hänvisa till en befintlig kund. Ingen av dem förbjuder flera beställningar för samma kund.

3. Kolumnernas kombination identifierar raden, medan delarna får återkomma var för sig. Nyckeln `(OrderID, ProductID)` tillåter därför både `(1042, 501)` och `(1042, 502)`, men inte två rader med kombinationen `(1042, 501)`. Den uttrycker regeln om en förekomst av produkten per order och måste väljas utifrån att just den regeln gäller.

4. Ett test som bara visar att −1 avvisas säger inte om noll tillåts när det borde göra det. Ett felaktigt villkor som kräver ett strikt positivt pris skulle också avvisa −1. Genom att pröva både tillåtna värden, gränsen och otillåtna värden ser vi därför om regeln avgränsar rätt mängd, inte bara om den kan ge ett felmeddelande.

</details>

## Sammanfattning

<code>CREATE TABLE</code> beskriver strukturen för framtida rader. Primärnycklar, obligatoriska värden, unikhet, kontroller och främmande nycklar uttrycker olika regler som behöver samverka. Pröva därför definitionen med både tillåtna och otillåtna exempel, och skilj det som databasen kontrollerar från den verksamhetsbetydelse som fortfarande måste säkerställas.