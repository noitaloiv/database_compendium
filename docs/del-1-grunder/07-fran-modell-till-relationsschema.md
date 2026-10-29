---
layout: default
track: grundspar
prerequisites: "Kapitel 4 och 6: nycklar och multiplicitet."
focus: "Översätt ett samband till tabeller utan listor i cellerna."
title: 7. Från modell till relationsschema
parent: Del I – Modeller och relationer
nav_order: 7
permalink: /docs/del-1-grunder/fran-modell-till-relationsschema/
description: Hur en konceptuell modell stegvis översätts till tabeller, primärnycklar och främmande nycklar.
keywords:
  - relationsschema
  - logisk modell
  - transformation
  - primärnyckel
  - främmande nyckel
  - ett till många
  - många till många
  - ett till ett
---

# 7. Från modell till relationsschema

{% include chapter_guide.html %}

En konceptuell modell kan visa att en kund gör beställningar och att varje
beställning innehåller orderrader. Ett databashanteringssystem behöver däremot
veta vilka tabeller och kolumner som ska skapas, vilken kolumn som identifierar
varje rad och var hänvisningar mellan tabellerna ska placeras. Modellen behöver
med andra ord översättas från verksamhetsbegrepp till en struktur som kan
implementeras i en relationsdatabas.

När vi gör översättningen behöver vi hela tiden kontrollera att verksamhetens betydelser finns kvar. Om modellen tillåter flera beställningar för samma kund måste också tabellerna kunna lagra dem, och om varje beställning kräver en kund måste den regeln följas med in i schemat. Varje nyckel och hänvisning ska därför kunna motiveras med ett konkret behov eller en regel från modellen.

## 7.1 Samma verksamhet på två nivåer

Den konceptuella modellen beskriver *vilka företeelser som är betydelsefulla*
och *vilka regler som förbinder dem*. Ett logiskt relationsschema beskriver i
stället hur samma betydelse organiseras som relationer, nycklar och
hänvisningar. Ordet *logisk* markerar att vi fortfarande bortser från detaljer
som filplacering, index och lagringsformat.

| Fråga | Konceptuell modell | Logiskt relationsschema |
| --- | --- | --- |
| Vad beskrivs? | Entitetstyper och associationer | Relationer och attribut |
| Hur identifieras något? | Konceptuell identifierare, märkt `ID` | Kandidat till primärnyckel, märkt `PK` |
| Hur uttrycks samband? | Namngiven association med multiplicitet | Främmande nyckel och integritetsvillkor |
| Vad visas inte ännu? | Tabeller, SQL-typer och främmande nycklar | Index, filstruktur och andra lagringsdetaljer |

Nivåerna konkurrerar alltså inte med varandra. Den logiska modellen bygger
vidare på den konceptuella och gör dess regler möjliga att realisera i en
relationsdatabas.

### Tre nivåer, med möjlighet att gå tillbaka

En konceptuell fråga kan vara om ett registrerat besök är samma företeelse som en bokning eller om skillnaden behöver bevaras. Den logiska frågan gäller sedan vilka relationer och hänvisningar som kan representera beslutet. När schemat implementeras tillkommer val av SQL-typer och villkor i ett bestämt DBHS, och vid fysisk utformning även exempelvis index och åtkomstvägar.

Dessa nivåer ger en användbar arbetsordning, men bildar inte en enkelriktad kedja där ett tidigare beslut blir orörligt. Om testdata visar att en kund kan ha två roller som modellen blandar ihop behöver vi återvända till begreppen, även om tabellerna redan har skapats.

## 7.2 Entitetstypen blir en relation

En första arbetsregel är att låta varje entitetstyp få en egen relation. Egenskaperna följer då med som attribut, och den identifierare vi redan har valt hjälper oss att bestämma en primärnyckel. För en produkt innebär detta att samma uppgifter som stod i den konceptuella rutan nu skrivs som ett relationsschema, vilket senare kan implementeras som en tabell med kolumner.

Den konceptuella beskrivningen

```text
PRODUCT
ID ProductID
   ProductName
   ListPriceOre
```

kan därmed få följande logiska form:

```text
Product(ProductID, ProductName, ListPriceOre)
PK: ProductID
```

Transformationen innebär inte att betydelsen får lämnas bakom. Kolumnen
`ListPriceOre` behöver fortfarande definieras som produktens nuvarande
listpris uttryckt i öre. Ett korrekt tabellnamn och en korrekt datatyp kan inte
ersätta en sådan verksamhetsdefinition.

## 7.3 En-till-många: nyckeln placeras på många-sidan

Anta att varje `SALES_ORDER` görs av exakt en `CUSTOMER`, medan en kund kan
göra noll eller flera beställningar. I relationsschemat behöver varje beställningsrad
därför kunna peka ut sin kund. Det åstadkoms genom att kundens identifierare
läggs som främmande nyckel i `SalesOrder`:

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID

SalesOrder(OrderID, OrderDate, Status, CustomerID)
PK: OrderID
FK: CustomerID -> Customer.CustomerID
```

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/27-modell-till-schema-ett-manga.svg' | relative_url }}" alt="Konceptuell kund–order-modell ovanför motsvarande relationsschema. CustomerID placeras som främmande nyckel på ordersidan." width="1000" height="610" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 7.1.</strong> Samma samband visas först som konceptuell modell och sedan som relationsschema. Följ <code>CustomerID</code>: identifieraren blir PK i <code>Customer</code> och en obligatorisk FK i <code>SalesOrder</code>. <a href="{{ '/assets/images/27-modell-till-schema-ett-manga.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Följ exempelvis order 1042, som hör till kund 17. Orderraden behöver bara ett kundnummer för att visa detta, och en annan order kan använda samma kundnummer utan problem. Om vi i stället försökte samla ordernumren på kundens rad skulle Mira behöva ett nytt värde i en växande lista varje gång hon beställde något. Genom att lägga `CustomerID` på ordersidan kan varje ny beställning i stället få en egen rad med en enda tydlig kundhänvisning.

Minimum får också en konkret följd i schemat. Eftersom varje order måste ha en kund får `SalesOrder.CustomerID` inte sakna värde. En kund som ännu inte har beställt något behöver däremot ingen särskild ”tom order”. Kundraden kan helt enkelt finnas utan att någon rad i `SalesOrder` hänvisar till den. Samma frånvaro uttrycks alltså på olika sätt beroende på vilken sida av associationen vi utgår från.

{: .important }
> Multipliciteten kopieras inte mekaniskt till en siffra i tabellen. Den
> avgör både var den främmande nyckeln placeras och vilka regler som behöver
> gälla för dess värden.

## 7.4 Många-till-många behöver en mellanliggande relation

Ett direkt många-till-många-samband kan inte representeras med en enda
främmande nyckel. Om en student deltar i flera kurstillfällen och varje
kurstillfälle har flera studenter skulle en främmande nyckel i `Student` bara
kunna peka ut ett kurstillfälle, medan en främmande nyckel i `CourseOffering`
bara skulle kunna peka ut en student.

Lösningen är en mellanliggande relation som innehåller identifierarna från båda
sidor:

```text
Student(StudentID, StudentName)
PK: StudentID

CourseOffering(OfferingID, CourseCode, Semester)
PK: OfferingID

Enrollment(StudentID, OfferingID, RegisteredAt, Grade)
PK: StudentID + OfferingID
FK: StudentID -> Student.StudentID
FK: OfferingID -> CourseOffering.OfferingID
```

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/28-modell-till-schema-manga-manga.svg' | relative_url }}" alt="Student och kurstillfälle med många-till-många-association, följt av relationsschemat Student, Enrollment och CourseOffering." width="1100" height="710" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 7.2.</strong> Den konceptuella associationen får en mellanliggande relation. De två markerade PK-delarna bildar tillsammans en primärnyckel; de är inte två separata primärnycklar. <a href="{{ '/assets/images/28-modell-till-schema-manga-manga.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Varje rad i `Enrollment` betyder att en bestämd student deltar i ett bestämt
kurstillfälle. Kombinationen av `StudentID` och `OfferingID` kan användas som
sammansatt primärnyckel om samma student bara får registreras en gång på samma
kurstillfälle. Attribut som `RegisteredAt` och `Grade` placeras också här,
eftersom de beskriver registreringen snarare än studenten eller
kurstillfället var för sig.

Nordic Brews `OrderLine` följer samma mönster. Relationen kopplar en
`SalesOrder` till en `Product` och kan samtidigt registrera `Quantity` och
`AgreedUnitPriceOre` för just den kombinationen.

## 7.5 En-till-en kräver ett motiverat val

Ett en-till-en-samband ger ofta fler än en rimlig tabellutformning. Återvänd
till exemplet där en anställd får ha högst ett skåp och varje skåp får vara
tilldelat högst en anställd. Om skåpen finns även när de inte är tilldelade kan
följande lösning vara lämplig:

```text
Employee(EmployeeID, EmployeeName)
PK: EmployeeID

Locker(LockerID, Location, AssignedEmployeeID)
PK: LockerID
FK: AssignedEmployeeID -> Employee.EmployeeID
UNIQUE: AssignedEmployeeID
```

Anta att skåp 12 tilldelas anställd 7. Den främmande nyckeln gör att vi kan följa hänvisningen till den anställde, men skulle ensam också tillåta att skåp 13 hänvisade till samma person. Därför behövs även `UNIQUE` på `AssignedEmployeeID`, så att en anställd kan få högst ett skåp. När ett skåp är ledigt representeras frånvaron av en tilldelning med `NULL`. Det ska förstås som att något värde inte har angetts, inte som anställd nummer noll.

Det hade också varit möjligt att placera `LockerID` i `Employee`. Vilket val
som är bäst beror bland annat på vilken av entitetstyperna som kan finnas utan
den andra och vilken riktning användningen oftast utgår från. Om två
entitetstyper alltid uppstår, förändras och försvinner tillsammans kan de i
vissa fall slås samman, men en-till-en är inte i sig ett tillräckligt skäl.

## 7.6 När ett attribut får flera värden

En liknande översättning behövs om en kund kan ha flera telefonnummer. Att
lagra alla nummer i en cell skulle göra det svårt att söka och kontrollera dem
var för sig. I stället kan varje telefonnummer få en egen rad:

```text
CustomerPhone(CustomerID, PhoneNumber, PhoneType)
PK: CustomerID + PhoneNumber
FK: CustomerID -> Customer.CustomerID
```

Med denna struktur kan vi lägga till eller ta bort ett av kundens telefonnummer utan att redigera en textlista med alla nummer. Telefonnumret behöver för den skull inte ha varit en egen entitetstyp i den första skissen; den konceptuella modellen kan ha beskrivit att kunden har flera telefonnummer. Relationsschemat visar nu hur dessa värden representeras så att de kan hanteras ett i taget.

## 7.7 Stanna upp och pröva

En avdelning har flera anställda, och varje anställd arbetar vid exakt en
avdelning. Var bör främmande nyckeln placeras?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>Lägg <code>DepartmentID</code> i <code>Employee</code>. Varje
  anställningsrad behöver då hänvisa till en avdelning, medan flera anställda
  får använda samma avdelnings-ID. En lista med anställda i
  <code>Department</code> skulle blanda flera värden i samma attribut.</p>
</details>

## Kontrollera ett steg innan du skriver hela schemat

En lokal kan användas av flera besök, men varje besök använder en lokal. Vi har lokal 3 och besöken 41 och 42, båda i lokal 3. Skriv de två besöksraderna med deras hänvisning till lokalen. Behöver lokalen två rader för att representera detta?

<details class="answer" markdown="1"><summary>Ledtråd och kontroll</summary>

Låt varje besöksrad bära lokalnumret: (41, 3) och (42, 3). Lokalen beskrivs en gång. `RoomID` får återkomma på besökssidan; det är besökets identifierare som ska skilja besöksraderna åt. En främmande nyckel gör inte automatiskt kolumnen unik.
</details>

Pröva nu ett nytt villkor: ett besök får använda två lokaler. Skriv de nödvändiga paren av besöksnummer och lokalnummer. Nu behövs en relation som kan rymma flera sådana par. Motivera ändringen i associationen innan du jämför med många-till-många-avsnittet. Detta är samma metod som i uthyrningsövningen nedan, med färre beslut på en gång.

## 7.8 Överföringsövning: uthyrning av utrustning

En friluftsverksamhet hyr ut individuellt märkta utrustningsföremål. En kund
kan göra flera bokningar och varje bokning kan omfatta flera föremål. För varje
föremål i en bokning registreras ett avtalat dygnspris. Ett föremål kan
naturligtvis bokas många gånger, men inte nödvändigtvis under samma period.

1. Föreslå relationer och primärnycklar.
2. Placera de främmande nycklar som följer av en-till-många-sambanden.
3. Identifiera vilket samband som behöver en mellanliggande relation.
4. Placera det avtalade dygnspriset och motivera valet.
5. Ange vilka regler i texten som inte kan uttryckas enbart med primär- och främmande nycklar.

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

Ett möjligt schema skiljer kunderna och utrustningsföremålen från de bokningar som görs. Här kallas en bokning `Rental`; varje rad i `RentalItem` beskriver sedan ett visst föremål i just den bokningen.

```text
Customer(CustomerID, CustomerName)
PK: CustomerID

Equipment(EquipmentID, EquipmentName)
PK: EquipmentID

Rental(RentalID, CustomerID, StartDate, EndDate)
PK: RentalID
FK: CustomerID -> Customer.CustomerID

RentalItem(RentalID, EquipmentID, AgreedDailyPriceOre)
PK: RentalID + EquipmentID
FK: RentalID -> Rental.RentalID
FK: EquipmentID -> Equipment.EquipmentID
```

**Följ först kunden till bokningen.** Varje bokning har ett eget `RentalID` och hänvisar till en kund genom `CustomerID`. En kund som bokar igen får därför en ny bokningsrad med samma kundnummer, utan att den tidigare bokningen skrivs över.

**Följ därefter bokningen till dess föremål.** Eftersom en bokning kan innehålla flera föremål och ett föremål kan bokas vid flera tillfällen behövs `RentalItem` mellan `Rental` och `Equipment`. Kombinationen av bokningsnummer och föremålsnummer kan vara nyckel om samma föremål förekommer högst en gång i en bokning. Det antagandet behöver anges; texten bestämmer inte varje möjlig detalj i en verklig uthyrningsverksamhet.

**Placera priset där det kan variera.** Samma kamera kan hyras för ett visst dygnspris vid ett tillfälle och för ett annat pris nästa gång. `AgreedDailyPriceOre` hör därför till föremålet i den enskilda bokningen och placeras i `RentalItem`. Ett enda pris hos `Equipment` skulle inte bevara skillnaden mellan dessa avtal.

**Pröva vad nycklarna inte garanterar.** Två olika bokningar kan fortfarande avse samma föremål under överlappande perioder. Primärnycklarna skiljer bokningarna åt, och de främmande nycklarna kontrollerar att föremålet finns, men ingen av dessa regler jämför perioderna. Inte heller följer kravet att slutdatum ska komma efter eller på startdatum av nycklarna ensamma. Båda tidsreglerna behöver därför en uttrycklig definition och ytterligare kontroll.

</details>


## 7.9 Från en större verksamhetsbeskrivning till schema

Hittills har flera av modellvalen redan varit utpekade. Nu ska du hålla ihop dem i ett något större fall. En reparationsverkstad behöver följa både föremål och reparationer. Arbeta först med begreppen och gör sedan en separat översättning till relationsschema. Du behöver inget databasprogram.

> En kund har ett kundnummer och ett namn och kan äga flera apparater. Varje apparat har ett eget nummer, en beskrivning och exakt en aktuell ägare. Apparaten tillhör en apparattyp med ett typnummer och ett typnamn. En kund och en apparattyp får finnas utan apparater.
>
> En apparat kan lämnas in för reparation flera gånger. Varje reparation får ett eget nummer, ett inlämningsdatum och en felbeskrivning och gäller exakt en apparat. En apparat får finnas utan reparationer. Flera tekniker kan arbeta med samma reparation, och en tekniker kan arbeta med flera reparationer. Teknikern har ett nummer och ett namn. För varje kombination av reparation och tekniker registreras det sammanlagda antalet arbetade timmar i högst en post. En ny reparation och en ny tekniker får ännu sakna sådana poster.

Ägarbytenas historik och uppdelning av arbetstiden i flera arbetspass ingår inte. Den avgränsningen är viktig: en reparation gäller ett tillfälle, medan arbetstidsuppgiften här gäller en sammanställning för en bestämd tekniker på den reparationen.

### Första delen: komplettera modellen

Börja med <code>CUSTOMER</code>, <code>DEVICE</code> och <code>REPAIR</code>. Vilka ytterligare begrepp behövs? Placera attributen och skriv båda riktningarna för varje association. Förklara särskilt varför antalet arbetade timmar inte beskriver en tekniker generellt.

<details class="answer" markdown="1">
<summary>Jämför begrepp och samband</summary>

<code>DEVICE_TYPE</code> beskriver apparattypen, <code>TECHNICIAN</code> beskriver teknikern och <code>REPAIR_WORK</code> beskriver teknikerns samlade arbete på en reparation. Timmarna hör till <code>REPAIR_WORK</code> eftersom samma tekniker kan arbeta olika länge med olika reparationer.

| Association | Från vänster | Från höger |
| --- | --- | --- |
| <code>CUSTOMER</code> äger <code>DEVICE</code> | En kund äger 0..* apparater. | En apparat har 1..1 aktuell ägare. |
| <code>DEVICE_TYPE</code> klassificerar <code>DEVICE</code> | En typ har 0..* apparater. | En apparat har 1..1 typ. |
| <code>DEVICE</code> har <code>REPAIR</code> | En apparat har 0..* reparationer. | En reparation gäller 1..1 apparat. |
| <code>REPAIR</code> har <code>REPAIR_WORK</code> | En reparation har 0..* arbetsposter. | En arbetspost gäller 1..1 reparation. |
| <code>TECHNICIAN</code> utför <code>REPAIR_WORK</code> | En tekniker har 0..* arbetsposter. | En arbetspost gäller 1..1 tekniker. |

<code>REPAIR_WORK</code> kan också uttryckas som ett samband med egenskapen <code>Hours</code>. På begreppsnivå är det betydelsen och identifieringen av kombinationen som är avgörande, inte att rutan måste kallas kopplingstabell.
</details>

### Andra delen: välj representation själv

Skriv nu ett fullständigt relationsschema med engelska identifierare, PK och FK. Ange vilka hänvisningar som måste ha ett värde. Pröva därefter två registreringar: samma apparat repareras igen, och en andra tekniker deltar i en redan registrerad reparation. Kan båda händelserna registreras utan att den första informationen skrivs över?

<details class="answer" markdown="1">
<summary>Visa ett schema och hur det prövas</summary>

```text
Customer(CustomerID, CustomerName)                       PK CustomerID
DeviceType(DeviceTypeID, TypeName)                       PK DeviceTypeID
Device(DeviceID, Description, CustomerID, DeviceTypeID)   PK DeviceID
Repair(RepairID, DeviceID, ReceivedDate, FaultDescription) PK RepairID
Technician(TechnicianID, TechnicianName)                  PK TechnicianID
RepairWork(RepairID, TechnicianID, Hours)                 PK RepairID + TechnicianID
```

<code>Device</code>.<code>CustomerID</code> hänvisar till <code>Customer</code> och <code>Device</code>.<code>DeviceTypeID</code> till <code>DeviceType</code>. <code>Repair</code>.<code>DeviceID</code> hänvisar till <code>Device</code>. <code>RepairWork</code> har hänvisningar till <code>Repair</code> och <code>Technician</code>. Samtliga dessa hänvisningar är obligatoriska enligt beskrivningen.

En andra reparation av apparat 71 kan få ett nytt <code>RepairID</code> men behålla <code>DeviceID</code> 71. En andra tekniker på reparation 901 ger en ny kombination i <code>RepairWork</code>. Däremot kan samma tekniker inte få två separata rader på samma reparation enligt den nuvarande regeln: en ny arbetsinsats behöver läggas till i den sammanlagda tiden. Om enskilda arbetspass ska sparas måste radbetydelsen och identifieringen ändras.

Schemat lagrar apparatens aktuella ägare. Om den byts kommer äldre reparationer fortfarande att hänvisa till apparaten, men modellen bevarar inte automatiskt vem som ägde den vid reparationstillfället. Det följer av avgränsningen och bör omprövas om den historiken behövs.
</details>

## Innan du går vidare

Skissa två konkreta registreringar i <code>Enrollment</code>. Kontrollera att båda kan dela <code>StudentID</code> utan att kombinationen <code>StudentID</code> + <code>OfferingID</code> upprepas.

## Kontrollfrågor

1. Vad skiljer en konceptuell modell från ett logiskt relationsschema?
2. Varför placeras `CustomerID` i `SalesOrder` och inte en lista med order-ID:n i `Customer`?
3. Varför behövs `Enrollment` mellan `Student` och `CourseOffering`?
4. Vilken ytterligare regel behövs när en främmande nyckel representerar ett en-till-en-samband?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Den konceptuella modellen beskriver verksamhetens begrepp, egenskaper och samband. Det logiska relationsschemat väljer hur detta ska representeras som relationer med attribut och nycklar. Regeln att varje order tillhör en kund kan exempelvis uttryckas som en association i modellen och som en obligatorisk främmande nyckel i schemat.

2. Varje order hör till en kund och kan därför innehålla ett enda `CustomerID`. När kunden gör ytterligare en beställning tillkommer en ny orderrad med samma kundnummer. En lista med ordernummer i `Customer` skulle däremot behöva hantera flera hänvisningar i en cell, vilket försvårar att söka och kontrollera varje beställning separat.

3. En student kan delta i flera kurstillfällen och ett kurstillfälle kan ha flera studenter. `Enrollment` ger varje kombination en egen rad, så att vi kan registrera exempelvis när just det deltagandet började. Utan den mellanliggande relationen skulle ett enda tillfällesnummer hos studenten eller ett enda studentnummer hos tillfället inte räcka.

4. Den främmande nyckeln måste också vara unik bland de värden som anges. Annars kan flera rader hänvisa till samma rad på andra sidan, vilket tillåter ett en-till-många-samband. Kravet på unikhet anger maximum; ett separat krav på att hänvisningen ska ha ett värde behövs om minimum ska vara ett.

</details>

## Sammanfattning

Ett relationsschema översätter verksamhetsbegrepp och associationer till relationer, nycklar och villkor. Nycklarnas placering ska kunna motiveras av vad en rad betyder och hur många förekomster som får höra samman. Översättningen är därför ett sätt att bevara modellens regler, inte bara att byta namn på rutorna.