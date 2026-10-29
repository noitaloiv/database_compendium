---
layout: default
track: grundspar
prerequisites: "Kapitel 8: fullständiga, partiella och transitiva beroenden."
focus: "Dela upp relationer och motivera varje flytt av ett attribut."
title: 9. Normalisering steg för steg
parent: Del I – Modeller och relationer
nav_order: 9
permalink: /docs/del-1-grunder/normalisering/
description: Hur en problematisk relation delas upp till första, andra och tredje normalformen utan att information går förlorad.
keywords:
  - normalisering
  - normalization
  - första normalformen
  - andra normalformen
  - tredje normalformen
  - 1NF
  - 2NF
  - 3NF
  - dekomposition
  - förlustfri join
---

# 9. Normalisering steg för steg

{% include chapter_guide.html %}

I föregående kapitel såg vi hur flera orderrader kan innehålla redigerbara kopior av samma produktnamn. Beroendena visade varför: produktnumret bestämmer namnet oberoende av vilken order raden gäller. Med **normalisering** använder vi den insikten för att dela upp relationen, så att produktens namn kan hanteras på en egen plats samtidigt som sambandet med orderraderna bevaras.

Varje uppdelning behöver ha ett tydligt skäl. Vi vill minska risken för motstridiga uppgifter, men måste samtidigt kunna återskapa de kombinationer som verksamheten behöver. Därför räcker det inte att kontrollera att de nya tabellerna ser enklare ut; vi behöver också visa hur deras nycklar och hänvisningar håller ihop informationen.

## Börja med ett enda upprepat faktum

Tänk dig att två lokalbokningar båda innehåller `VenueID` 7 och namnet Blue Room. Om lokalen byter namn till Green Room behöver båda kopiorna ändras i den platta listan. Genom att i stället lagra lokalens nummer och namn tillsammans i `Venue(7, Green Room)` kan bokningarna nöja sig med hänvisningen 7. Då räcker en namnändring på lokalens egen rad, samtidigt som båda bokningarna fortfarande pekar ut rätt lokal.

Det är denna idé vi nu gör systematisk: ta reda på vad varje uppgift beskriver och låt samma självständiga faktum få en tydlig hemvist. När exemplet växer till flera attribut behöver varje uppdelning fortfarande kunna förklaras lika konkret.

## 9.1 Normalisering utgår från betydelse

Innan vi kan dela upp en relation behöver vi veta vad en rad betyder och vilka beroenden som gäller för alla tillåtna registreringar. Anta exempelvis att vi felaktigt påstår att en produkt alltid har samma avtalade pris. Då skulle vi kunna flytta priset till produktrelationen och förlora skillnaden mellan två köp. Den formella uppdelningen kan alltså bara bli hållbar om den bygger på riktiga verksamhetsregler.

Utgångspunkten är den platta relationen från föregående kapitel, nu kompletterad
med avtalat pris:

```text
OrderReport(
  OrderID, OrderDate,
  CustomerID, CustomerName, Email,
  ProductID, ProductName, ListPriceOre,
  Quantity, AgreedUnitPriceOre
)
```

Varje rad beskriver en produkt i en bestämd order, och kandidatnyckeln är
`OrderID + ProductID`. Följande centrala beroenden antas gälla:

```text
OrderID -> OrderDate, CustomerID
CustomerID -> CustomerName, Email
ProductID -> ProductName, ListPriceOre
OrderID, ProductID -> Quantity, AgreedUnitPriceOre
```

Dessa antaganden är de sakliga grunderna för resten av normaliseringen.

## 9.2 Första normalformen: en radtyp utan upprepade grupper

En relation är i **första normalformen**, `1NF`, när varje rad följer samma
struktur och varje attributposition innehåller ett enda värde ur sin avsedda
värdemängd. Ett vanligt problem i en tabell som ännu inte har fått en lämplig relationsstruktur är att förbereda upprepade kolumngrupper:

| <code>OrderID</code> | <code>Product1ID</code> | <code>Product1Quantity</code> | <code>Product2ID</code> | <code>Product2Quantity</code> |
| ---: | ---: | ---: | ---: | ---: |
| 1042 | 501 | 2 | 502 | 1 |

Kolumnnamnen bevisar inte i sig ett formellt brott mot 1NF, eftersom varje enskild cell i exemplet innehåller ett värde. Svårigheten är i stället att återkommande orderrader har pressats in i ett i förväg bestämt antal kolumner. En tredje produkt kräver då nya kolumner, medan en order med bara en produkt lämnar en hel grupp kolumner oanvänd. Om varje produkt i beställningen i stället får en egen rad kan antalet orderrader variera utan att tabellens struktur behöver ändras:

| <code>OrderID</code> | <code>ProductID</code> | <code>Quantity</code> |
| ---: | ---: | ---: |
| 1042 | 501 | 2 |
| 1042 | 502 | 1 |

Vad som räknas som ”ett värde” beror dock på hur uppgiften ska användas. Ett
fullständigt namn kan behandlas som ett värde om det aldrig behöver delas upp,
medan koordinater eller telefonnummer kan behöva separeras om deras delar ska
sökas och kontrolleras oberoende. Första normalformen är därför inte en
uppmaning att dela all text i minsta möjliga beståndsdel.

## 9.3 Andra normalformen: hela nyckeln ska behövas

En relation som redan är i 1NF är i **andra normalformen**, `2NF`, om varje
icke-nyckelattribut är fullständigt beroende av varje kandidatnyckel. Med icke-nyckelattribut menar vi här ett attribut som inte ingår i någon kandidatnyckel. Regeln
blir särskilt relevant när nyckeln är sammansatt.

I `OrderReport` består nyckeln av `OrderID + ProductID`, men flera attribut
behöver bara en del av nyckeln:

- `OrderDate` och `CustomerID` bestäms av `OrderID`;
- `ProductName` och `ListPriceOre` bestäms av `ProductID`;
- `Quantity` och `AgreedUnitPriceOre` behöver däremot både `OrderID` och
  `ProductID`.

De partiella beroendena kan tas bort genom att dela upp relationen efter vilket
faktum attributen beskriver:

```text
SalesOrder(OrderID, OrderDate, CustomerID, CustomerName, Email)
PK: OrderID

Product(ProductID, ProductName, ListPriceOre)
PK: ProductID

OrderLine(OrderID, ProductID, Quantity, AgreedUnitPriceOre)
PK: OrderID + ProductID
FK: OrderID -> SalesOrder.OrderID
FK: ProductID -> Product.ProductID
```

Efter uppdelningen kan produktens namn ändras på en enda rad i `Product`. Samtidigt ligger kvantitet och avtalat pris kvar i `OrderLine`, eftersom de behöver hela kombinationen av order och produkt. Orderns egna uppgifter har samlats i `SalesOrder`, men där följer kundnamn och e-post fortfarande med på varje order. Nästa steg handlar om att undersöka den kvarvarande upprepningen.

## 9.4 Tredje normalformen: skilj kundfakta från orderfakta

I den föreslagna relationen `SalesOrder` gäller kedjan

```text
OrderID -> CustomerID -> CustomerName, Email
```

Anta att Mira gör fem beställningar. I den föreslagna `SalesOrder` får hennes namn och e-postadress då fem redigerbara kopior, trots att uppgifterna beskriver samma kund. Beroendet från `CustomerID` visar varför de hör ihop, och kundnumret identifierar inte en viss order. För att nå **tredje normalformen**, `3NF`, skiljer vi därför kunduppgifterna från orderuppgifterna och behåller en hänvisning mellan relationerna:

```text
Customer(CustomerID, CustomerName, Email)
PK: CustomerID

SalesOrder(OrderID, OrderDate, CustomerID)
PK: OrderID
FK: CustomerID -> Customer.CustomerID

Product(ProductID, ProductName, ListPriceOre)
PK: ProductID

OrderLine(OrderID, ProductID, Quantity, AgreedUnitPriceOre)
PK: OrderID + ProductID
FK: OrderID -> SalesOrder.OrderID
FK: ProductID -> Product.ProductID
```

En praktisk tumregel är att varje icke-nyckelattribut ska beskriva nyckeln, hela nyckeln och inget annat än nyckeln. Den hjälper oss att upptäcka problemen i de enkla relationerna här, men ska inte förväxlas med en fullständig definition av 3NF. När flera kandidatnycklar överlappar kan nämligen en mer precis analys behövas. Även då börjar resonemanget i samma fråga: vilket faktum bestämmer vilket annat faktum?

<figure class="figure" id="figur-9-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 9.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/20-normalisering-i-tre-steg.svg' | relative_url }}" alt="Den platta orderrelationen delas först efter partiella beroenden och sedan efter kunduppgifternas transitiva beroende. Slutresultatet är Customer, SalesOrder, Product och OrderLine." width="1160" height="760" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 9.1.</strong> Utgångsrelationen är redan i 1NF. Uppdelningarna för 2NF och 3NF skiljer sedan produkt-, order-, kund- och orderradsfakta åt. <a href="{{ '/assets/images/20-normalisering-i-tre-steg.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

<details class="extension" markdown="1">
<summary>Fördjupning: den mer allmänna regeln för 3NF</summary>

En **supernyckel** är en attributuppsättning som bestämmer hela raden, även om uppsättningen kan innehålla överflödiga attribut. En kandidatnyckel är en minimal supernyckel.

För varje icke-trivialt funktionellt beroende `X → A` kräver 3NF att X är en supernyckel eller att A ingår i någon kandidatnyckel. Icke-trivialt betyder här att A inte redan ingår i X. Regeln behöver gälla de beroenden som följer av verksamhetsreglerna, inte bara de som har skrivits ut i en kort lista.

Detta är skälet till att tumregeln om icke-nyckelattribut fungerar för våra enkla exempel men inte är en fullständig definition för varje möjlig relation. Grundövningen ovan kan fortfarande lösas genom att motivera vilka fakta som gäller kunden, produkten, ordern och orderraden.
</details>

## 9.5 Vad blev bättre?

Vi kan nu återvända till de tre ändringsproblemen och se vad uppdelningen gör möjligt. Ett produktnamn ändras i `Product`, en kund kan registreras i `Customer` före sin första order och en order kan tas bort utan att kundens egen rad för den skull behöver raderas. Genom att skilja dessa fakta åt har schemat minskat risken att en förändring oavsiktligt får följder för något annat.

Normaliseringen har också gjort vissa verksamhetsregler tydligare. En främmande
nyckel från `SalesOrder` till `Customer` anger att varje order hänvisar till en
befintlig kund, medan den sammansatta primärnyckeln i `OrderLine` hindrar samma
produkt från att förekomma två gånger i samma order – förutsatt att just den
regeln är avsedd.

Fler tabeller innebär att en fråga ibland behöver sammanfoga relationerna för
att visa en komplett order. Det är en verklig kostnad, men inte ett argument
för att återinföra okontrollerad redundans. Frågan är om den förenklade
läsningen av en platt tabell väger tyngre än risken för motstridiga fakta och
svårkontrollerade förändringar.

## 9.6 Kontrollera dekompositionen

En uppdelning är inte automatiskt bra bara för att relationerna blir mindre.
Minst tre frågor behöver prövas.

Först behöver vi kontrollera att uppdelningen är **förlustfri**. Det innebär att de ursprungliga giltiga kombinationerna kan återskapas genom sammanfogning, utan att rader försvinner eller nya, ogrundade kombinationer uppstår. Därefter undersöker vi om viktiga beroenden och verksamhetsregler fortfarande går att upprätthålla. Slutligen läser vi varje ny relation som ett påstående: går det att förklara vad en rad representerar utan att blanda ihop flera oberoende företeelser? Dessa kontroller kompletterar normalformsbedömningen.

{: .mistake }
> Normalisering betyder inte att godtyckligt dela en tabell på mitten. Om
> kopplingsattribut eller korrekta beroenden saknas kan uppdelningen förlora
> information eller skapa tvetydiga sammanfogningar.

### Alla kolumner finns kvar, men sambandet är borta

Anta att en förening registrerar vilket rum en medarbetare ska förbereda en viss dag. Varje medarbetare ansvarar för högst ett rum per dag. I följande lilla exempel har Nora och Bo olika rum, trots att de arbetar samma dag:

| `StaffID` | `WorkDate` | `RoomID` |
| --- | --- | --- |
| 11 | 2027-01-12 | 101 |
| 22 | 2027-01-12 | 202 |

En kollega delar upp relationen i `StaffDay(StaffID, WorkDate)` och `RoomDay(RoomID, WorkDate)`. Den första innehåller medarbetarnas arbetsdagar och den andra rummens förberedelsedagar. Alla tre attributnamn finns alltså fortfarande någonstans, men uppdelningen har tappat bort **vilken medarbetare som hör till vilket rum**.

**`StaffDay`: medarbetarnas arbetsdagar**

| `StaffID` | `WorkDate` |
| --- | --- |
| 11 | 2027-01-12 |
| 22 | 2027-01-12 |

**`RoomDay`: rummens förberedelsedagar**

| `RoomID` | `WorkDate` |
| --- | --- |
| 101 | 2027-01-12 |
| 202 | 2027-01-12 |

Detta är två separata relationer. Att en medarbetare och ett rum råkar stå först i var sin tabell återinför inget samband mellan dem: radpositionen får inte användas som en dold hänvisning.

Om vi försöker återskapa ansvaret genom att para ihop rader med samma datum matchar varje medarbetare båda rummen:

| `StaffID` | `WorkDate` | `RoomID` | Jämfört med ursprunget |
| --- | --- | --- | --- |
| 11 | 2027-01-12 | 101 | Fanns redan |
| 11 | 2027-01-12 | 202 | Ny, ogrundad kombination |
| 22 | 2027-01-12 | 101 | Ny, ogrundad kombination |
| 22 | 2027-01-12 | 202 | Fanns redan |

Ingen ursprunglig rad har försvunnit, men två påståenden har tillkommit utan stöd. Uppdelningen är därför inte förlustfri. Det som förlorades var informationen om sambandet, vilket blev synligt först när delarna sattes ihop igen. Kapitel 13 visar hur sådan matchning uttrycks med `JOIN`.

**Pröva:** skulle ett nytt löpnummer i var och en av de två deltabellerna lösa problemet?

<details class="answer" markdown="1">
<summary>Varför två nya nummer inte återställer sambandet</summary>

Nej, inte om numren bara identifierar raderna i respektive tabell. De behöver också uttrycka den förlorade kopplingen mellan medarbetare, dag och rum. Ett enkelt sätt är att behålla en relation `Assignment(StaffID, WorkDate, RoomID)`, där kombinationen `StaffID` och `WorkDate` bestämmer rummet enligt verksamhetsregeln. Eventuella namn på medarbetare och rum kan förvaltas separat med hänvisningar via deras identifierare. Då delar vi upp självständiga beskrivningar utan att kasta bort själva ansvarsfördelningen.

</details>

## 9.7 När bör man stanna?

Tredje normalformen är en vanlig och användbar målnivå, men den är inte en
garanti för en perfekt databas. Felaktiga verksamhetsregler, olämpliga
identifierare och missförstådd historik kan fortfarande ge en svag modell, och
mer komplicerade kombinationer av kandidatnycklar kan kräva ytterligare
analys.

Det finns också situationer där data medvetet dupliceras för läsprestanda,
rapportering eller historiska ögonblicksbilder. Ett sådant avsteg bör vara ett
uttalat designbeslut där kostnaden för synkronisering och risken för
motstridighet hanteras. Det skiljer sig från redundans som uppstår därför att
beroendena aldrig analyserades.

## 9.8 Stanna upp och pröva

Anta relationen

```text
Enrollment(StudentID, OfferingID, StudentName, CourseCode, Grade)
```

med nyckeln `StudentID + OfferingID`. Vilka attribut är partiellt beroende av
nyckeln?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p><code>StudentName</code> bestäms av <code>StudentID</code>, medan
  <code>CourseCode</code> i detta förenklade exempel bestäms av
  <code>OfferingID</code>. Båda beror alltså endast på en del av den
  sammansatta nyckeln och bör placeras i relationer som beskriver studenten
  respektive kurstillfället. <code>Grade</code> beskriver däremot studentens
  resultat på just det kurstillfället och behöver hela kombinationen.</p>
</details>


## Gör ett beroende synligt innan du delar upp allt

Anta att `BookingLine(BookingID, ItemID, ItemName, Quantity)` beskriver en artikels rad i en bokning. En artikel får förekomma högst en gång per bokning. `ItemID` bestämmer artikelns aktuella namn; kombinationen `BookingID, ItemID` bestämmer antalet. Inga andra unikhetsregler gäller.

Det första beslutet är redan motiverat: `ItemName` beskriver artikeln, så samma namn behöver inte lagras på varje bokningsrad. Slutför beslutet genom att skriva de två relationerna, deras nycklar och den hänvisning som låter oss få tillbaka namnet.

<details class="answer" markdown="1"><summary>Ledtråd</summary>

Ta bort det upprepade namnet från bokningsraden, men behåll artikelnumret där. Fråga vilken uppgift som identifierar en artikel respektive en viss artikels förekomst i en bokning.
</details>

<details class="answer" markdown="1"><summary>Kontrollera uppdelningen</summary>

`Item(ItemID PK, ItemName)` och `BookingLine(BookingID, ItemID, Quantity)` med sammansatt PK `(BookingID, ItemID)` och FK `ItemID` till `Item`. Kombinationen behövs fortfarande för antalet. Varje bokningsrad kopplas tillbaka till exakt en artikel eftersom `ItemID` är nyckel i `Item`. Ett nytt löpnummer i den gamla relationen hade inte i sig tagit bort det upprepade artikelnamnet.
</details>

Pröva därefter övning 9.9 utan facit. Om du fastnar, återgå till en enda uppgift: vad beskriver den, vad bestämmer den och vilken koppling måste finnas kvar? Du behöver inte gissa det färdiga antalet tabeller.

## 9.9 Överföringsövning: bokning av utrustning

En verksamhet använder följande relation:

```text
RentalLine(
  RentalID, RentalDate,
  CustomerID, CustomerName,
  ItemID, ItemDescription, CategoryID, CategoryName,
  AgreedDailyPriceOre
)
```

Anta att en uthyrning kan omfatta flera föremål, att varje föremål tillhör en
kategori och att priset avtalas för ett visst föremål i en viss uthyrning.

1. Föreslå relationens kandidatnyckel.
2. Formulera de funktionella beroenden som behövs för analysen.
3. Visa varför relationen inte är i 2NF.
4. Identifiera ett transitivt beroende som hindrar 3NF.
5. Dekomponera relationen och ange `PK` och `FK`.
6. Beskriv hur du skulle kontrollera att uppdelningen är förlustfri.

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

Börja med antagandena att ett föremål får förekomma högst en gång i en uthyrning och att varje uthyrning hör till en kund. Kombinationen `RentalID + ItemID` kan då identifiera en uthyrningsrad, men flera av dess beskrivande uppgifter bestäms av bara en del av kombinationen:

| Bestämmande attribut | Bestämmer |
| --- | --- |
| <code>RentalID</code> | <code>RentalDate</code>, <code>CustomerID</code> |
| <code>CustomerID</code> | <code>CustomerName</code> |
| <code>ItemID</code> | ItemDescription, <code>CategoryID</code> |
| <code>CategoryID</code> | <code>CategoryName</code> |
| <code>RentalID</code> + <code>ItemID</code> | <code>AgreedDailyPriceOre</code> |

Det avtalade dygnspriset behöver hela kombinationen eftersom det beskriver just detta föremål i just denna uthyrning. Kundens namn och kategorins namn följer däremot de egna identifierarna, vilket hjälper oss att motivera den fortsatta uppdelningen.

<code>RentalDate</code> och ItemDescription är exempel på partiella beroenden som hindrar 2NF. Ett transitivt beroende finns via <code>CategoryID</code> till <code>CategoryName</code>. En uppdelning är:

```text
Customer(CustomerID, CustomerName)                 PK: CustomerID
Rental(RentalID, RentalDate, CustomerID)           PK: RentalID
Category(CategoryID, CategoryName)                PK: CategoryID
Item(ItemID, ItemDescription, CategoryID)          PK: ItemID
RentalItem(RentalID, ItemID, AgreedDailyPriceOre)   PK: RentalID + ItemID
```

<code>Rental</code>.<code>CustomerID</code> hänvisar till <code>Customer</code>, Item.<code>CategoryID</code> till Category, och <code>RentalItem</code> har främmande nycklar till <code>Rental</code> och Item. Varje ursprunglig rad kan återskapas genom dessa hänvisningar utan att blanda olika kunder, föremål eller kategorier: varje hänvisning träffar exakt den identifierade raden. Att testa några exempelrader är användbart, men garantin behöver motiveras av nycklar och beroenden, inte enbart av att ett litet prov råkar fungera.
</details>


## 9.10 Öva själv: behöver varje steg dela upp relationen?

Normalisering är en prövning av regler, inte en instruktion att alltid skapa fler tabeller vid varje steg. Följande relation beskriver kontroller av utrustning:

```text
Inspection(InspectionID, EquipmentID, EquipmentName,
           InspectorID, InspectorName, InspectedAt, Result)
```

Utgå från att `InspectionID` är den enda kandidatnyckeln och att varje kontroll gäller en utrustning och en kontrollant. Utrustningens nummer bestämmer dess namn, precis som kontrollantens nummer bestämmer kontrollantens namn. Samma utrustning kan emellertid kontrolleras flera gånger, också av samma kontrollant, så dessa nummer skiljer inte kontrollhändelserna åt. Namn och tidpunkter antas inte heller vara unika, och varje attributposition innehåller ett värde ur sin avsedda domän.

| <code>InspectionID</code> | <code>EquipmentID</code> | <code>EquipmentName</code> | <code>InspectorID</code> | <code>InspectorName</code> |
| ---: | ---: | --- | ---: | --- |
| 901 | 7 | Lift A | 31 | Nora Berg |
| 902 | 7 | Lift A | 42 | Bo Ek |
| 903 | 8 | Lift B | 31 | Nora Berg |

Tabellen är ett utsnitt; <code>InspectedAt</code> och <code>Result</code> följer också med varje kontroll.

1. Formulera ett ändringsproblem med den platta relationen.
2. Skriv de grundläggande funktionella beroendena.
3. Är relationen redan i 2NF? Motivera utan att dela upp den först.
4. Pröva 3NF och skriv ett lämpligt schema med PK och FK.
5. Förklara varför två kontroller av samma utrustning inte ska slås ihop bara för att utrustningsnumret är detsamma.

<details class="answer" markdown="1">
<summary>Visa analys och lösningsförslag</summary>

Om Nora byter namn måste båda kopiorna ändras. Beroendena är:

```text
InspectionID -> EquipmentID, InspectorID, InspectedAt, Result
EquipmentID -> EquipmentName
InspectorID -> InspectorName
```

<code>InspectionID</code> bestämmer även namnen genom de andra beroendena. Under de uttryckliga antagandena är relationen i 2NF: den enda kandidatnyckeln har ett attribut och kan därför inte ge ett partiellt beroende av en del av nyckeln. Den är däremot inte i 3NF, eftersom namn bestäms genom utrustnings- och kontrollantnumren, som inte är nycklar i <code>Inspection</code>.

```text
Equipment(EquipmentID, EquipmentName)    PK EquipmentID
Inspector(InspectorID, InspectorName)    PK InspectorID
Inspection(InspectionID, EquipmentID, InspectorID, InspectedAt, Result)
PK InspectionID
FK EquipmentID -> Equipment.EquipmentID
FK InspectorID -> Inspector.InspectorID
```

Efter uppdelningen behåller varje kontroll sitt eget `InspectionID`, sin tidpunkt och sitt resultat. Två kontroller av samma utrustning slås alltså inte ihop; det är bara utrustningens gemensamma namn som nu hämtas från en enda utrustningsrad. På så sätt försvinner de redigerbara kopiorna av beskrivningen, samtidigt som skillnaden mellan kontrollhändelserna bevaras.
</details>

## Innan du går vidare

Förklara med ett konkret värde varför <code>ProductName</code> flyttas till <code>Product</code> men <code>AgreedUnitPriceOre</code> stannar i <code>OrderLine</code>. De båda prisbegreppen beskriver olika fakta.

## Kontrollfrågor

1. Vilket problem behandlar 1NF?
2. När blir 2NF relevant?
3. Vilket beroende i `SalesOrder` hindrade relationen från att vara i 3NF?
4. Varför måste funktionella beroenden fastställas före normaliseringen?
5. Vad innebär det att en dekomposition är förlustfri?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Första normalformen kräver här att varje attributposition innehåller ett enda värde ur sin avsedda domän och att raderna har en enhetlig struktur. En lista med flera självständiga produktnummer i en cell passar därför inte som ett enda produktnummer. Upprepade kolumner som `Product1ID` och `Product2ID` ger också en opraktisk struktur, men deras namn bevisar inte ensamma ett formellt 1NF-brott. Läs cellernas betydelse, inte bara kolumnrubrikerna.

2. Andra normalformen prövas när relationen redan är i 1NF och handlar om fullständigt beroende av varje kandidatnyckel för attribut som inte ingår i någon kandidatnyckel. Den blir särskilt tydlig med sammansatta nycklar: om bara `ProductID` räcker för produktnamnet hör namnet inte hemma bland fakta som behöver kombinationen av order och produkt. Uppdelningen skiljer därför produktfakta från orderradsfakta.

3. Beroendet `CustomerID → CustomerName, Email` gjorde att kunduppgifter upprepades på kundens olika order. Kundnumret är inte en nyckel för en bestämd order, men bestämmer ändå dessa andra uppgifter. Genom att flytta dem till `Customer` och behålla `CustomerID` som hänvisning i `SalesOrder` kan samma kundfakta hanteras på en plats.

4. Normalisering använder beroendena för att avgöra vilka uppgifter som kan skiljas åt. Om vi antar fel beroende kan vi därför få en välformad struktur som inte klarar verkliga variationer. Anta exempelvis att samma produkt alltid har samma avtalade pris: då riskerar vi att flytta priset till produkten och förlora att två kunder avtalat olika priser vid olika köp.

5. Förlustfrihet innebär att de ursprungliga giltiga kombinationerna kan återskapas genom att de uppdelade relationerna sammanfogas, utan att något saknas eller nya ogrundade kombinationer tillkommer. Det räcker alltså inte att alla attributnamn finns kvar någonstans. Även kopplingen mellan värdena måste bevaras genom en korrekt uppdelning.

</details>

## Sammanfattning

Normalisering använder beroendena för att ge självständiga fakta egna platser. I våra exempel skiljer 2NF produkt- och orderfakta från uppgifter som behöver hela orderradsnyckeln, medan steget till 3NF också skiljer kundfakta från ordern. Varje uppdelning behöver bevara möjligheten att återskapa de ursprungliga uppgifterna utan påhittade kombinationer.