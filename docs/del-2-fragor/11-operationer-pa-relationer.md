---
layout: default
track: grundspar
prerequisites: "Kapitel 10: mängder och relationer."
focus: "Följ urval, projektion och sammanfogning med ord, tabeller och mellanresultat; formell symbolnotation är valbar."
title: 11. Operationer på relationer
parent: Del II – Frågor och förändring
nav_order: 11
permalink: /docs/del-2-fragor/fran-informationsbehov-till-databasfraga/
description: Hur vi går från ett informationsbehov till en faktisk databasförfrågan.
keywords:
  - informationsbehov
  - relationsalgebra
  - urval
  - projektion
  - sammanfogning
  - databasfråga
---

# 11. Operationer på relationer

{% include chapter_guide.html %}

I det här kapitlet använder vi relationsalgebra för att förstå hur en databasfråga "byggs upp". Det viktigaste är att du kan förklara vilka rader som väljs, vilka attribut som behålls och hur information från olika relationer kopplas samman. Operationerna illustreras också med formella symboler, men du behöver inte själv kunna skriva algebrauttrycken för att följa kapitlets grundspår.

När en databas väl har fått en genomtänkt struktur återstår en ny utmaning: hur hämtar vi den information som behövs? En användare kanske vill veta vilka produkter som är aktiva och kostar mindre än 120 kronor, vilka beställningar som har gjorts av en viss kund eller vilka kunder som ännu inte har beställt något.

Sådana frågor uttrycks vanligen med SQL, men för att skriva en bra fråga behöver vi först förstå vilket resultat den ska ge. Vilka relationer behövs?  Vilka rader ska behållas? Vilka attribut ska visas? När vi kan besvara dessa frågor blir det betydligt enklare att formulera SQL-satsen.

I föregående kapitel kombinerade vi mängder av produktnummer, men för att få fram sådana mängder behöver vi kunna arbeta med relationer som innehåller fler attribut. **Relationsalgebra** ger oss operationer för just detta: att välja rader, välja attribut och koppla samman fakta. När resultatet av en operation fortfarande är en relation kan det användas i nästa steg. Vi börjar därför med att följa konkreta exempelrader genom stegen, innan vi sätter ihop dem till hela uttryck.

## 11.1 Börja med frågan, inte med kommandot

Ponera att Nordic Brew vill visa namn och listpris för alla aktiva produkter som kostar mindre än 120 kronor. Databasen lagrar priset i öre, vilket innebär att gränsen motsvarar 12 000 öre.

Informationsbehovet kan delas upp i tre frågor:

1. Vilken relation innehåller de relevanta uppgifterna?
2. Vilka rader uppfyller villkoren?
3. Vilka attribut ska finnas i resultatet?

I detta fall finns all nödvändig data i relationen `Product`. Därifrån behöver vi behålla rader där `Active = 1` och `ListPriceOre < 12000`. Av de rader som återstår vill vi endast visa `ProductName` och `ListPriceOre`.

Resonemanget kan sammanfattas som en kedja:

<figure class="figure" id="figur-11-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 11.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/15-fran-fraga-till-resultat.svg' | relative_url }}" alt="Frågan preciseras, relationer väljs, rader begränsas, attribut väljs och resultatet tolkas mot informationsbehovet." width="1040" height="390" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 11.1.</strong> Arbetsstegen hjälper oss att kontrollera resultatets betydelse innan vi skriver en SQL-sats. <a href="{{ '/assets/images/15-fran-fraga-till-resultat.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Poängen med uppdelningen är inte att varje fråga måste lösas i exakt denna ordning. Den ger däremot ett sätt att kontrollera att frågan verkligen motsvarar informationsbehovet. Om vi inte kan förklara vilka rader och attribut som ska ingå är det osannolikt att en mer avancerad SQL-sats löser problemet åt oss.

## 11.2 Operationer ger nya relationer

Inom relationsalgebra kan en databasfråga beskrivas som en följd av operationer, där varje operation tar emot en eller flera relationer och lämnar tillbaka en ny relation. Eftersom resultatet har samma slags struktur som underlaget kan det i sin tur användas som indata till nästa operation. På så sätt kan en mer omfattande fråga byggas upp av mindre delar som går att granska var för sig.

Anta att `Product` innehåller följande rader:

| <code>ProductID</code> | <code>ProductName</code>          | <code>ListPriceOre</code> | <code>Active</code> |
| --------: | -------------------- | -----------: | -----: |
|       501 | Brew coffee 500 g    |        12900 |      1 |
|       502 | Espresso blend 250 g |         8900 |      1 |
|       503 | Decaf coffee 250 g   |         9900 |      1 |
|       504 | Winter blend 500 g   |        14900 |      0 |

Om vi först väljer de aktiva produkter som kostar mindre än 12 000 öre får vi ett mellanresultat:

| <code>ProductID</code> | <code>ProductName</code>          | <code>ListPriceOre</code> | <code>Active</code> |
| --------: | -------------------- | -----------: | -----: |
|       502 | Espresso blend 250 g |         8900 |      1 |
|       503 | Decaf coffee 250 g   |         9900 |      1 |

När vi därefter begränsar resultatet till produktnamn och listpris får vi den slutliga relationen:

| <code>ProductName</code>          | <code>ListPriceOre</code> |
| -------------------- | -----------: |
| Espresso blend 250 g |         8900 |
| Decaf coffee 250 g   |         9900 |

Mellanresultatet behöver inte sparas som en permanent tabell. Det är ett sätt att synliggöra frågans logik: först avgörs vilka rader som är relevanta, och därefter avgörs vilka egenskaper hos dessa rader som ska visas.

<figure class="figure" id="figur-11-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 11.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/32-urval-projektion.svg' | relative_url }}" alt="Urvalet behåller raderna 502 och 503 med alla fyra attribut. Projektionen tar sedan bort ProductID och Active." width="900" height="690" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 11.2.</strong> Urval ändrar vilka rader som ingår, medan projektion väljer deras attribut. De markerade raderna går att följa genom hela bilden. <a href="{{ '/assets/images/32-urval-projektion.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 11.3 Urval begränsar antalet rader

Operationen **urval** (*selection*) behåller de rader som uppfyller ett angivet villkor. Den skrivs med den grekiska bokstaven sigma, σ:

<div class="algebra" role="group" aria-label="Relationsalgebraiskt uttryck">σ<sub><code>Active</code> = 1 ∧ <code>ListPriceOre</code> &lt; 12000</sub>(<code>Product</code>)</div>

Uttrycket kan läsas som:

> Välj de rader ur `Product` där produkten är aktiv och listpriset understiger 12 000 öre.

Urvalet bestämmer vilka produkter som får vara kvar, men ändrar inte hur en produkt beskrivs. Därför har mellanresultatet fortfarande alla fyra attributen från `Product`: vi kan läsa både nummer, namn, pris och aktiv-status för produkt 502 och 503. Även om bara en produkt hade uppfyllt villkoret skulle raden alltså ha haft fyra attribut. Det är antalet rader som kan minska vid ett urval, medan uppsättningen attribut bevaras.

Flera villkor kan kombineras. Operatorn ∧ betyder att båda villkoren måste vara sanna, medan ∨ betyder att minst ett av dem ska vara sant. När villkoren blir mer omfattande bör parenteser användas för att göra den avsedda tolkningen tydlig.

## 11.4 Projektion begränsar antalet attribut

Operationen **projektion** (*projection*) väljer vilka attribut som ska finnas i resultatet. Den skrivs med den grekiska bokstaven pi, π:

<div class="algebra" role="group" aria-label="Relationsalgebraiskt uttryck">π<sub><code>ProductName</code>, <code>ListPriceOre</code></sub>(<code>Product</code>)</div>

Uttrycket betyder att vi ur varje produktrad väljer uppgifterna `ProductName` och `ListPriceOre`. Vi kan därefter läsa vad produkten heter och kostar, men inte längre dess produktnummer eller aktiv-status ur just detta resultat. Projektionen avgör på så sätt *vilka uppgifter* som visas, medan urvalet i föregående avsnitt avgjorde *vilka produkter* som skulle vara med.

Urval och projektion kan kombineras:

<div class="algebra" role="group" aria-label="Relationsalgebraiskt uttryck"><code>SelectedProducts</code> = σ<sub><code>Active</code> = 1 ∧ <code>ListPriceOre</code> &lt; 12000</sub>(<code>Product</code>)<br><code>Result</code> = π<sub><code>ProductName</code>, <code>ListPriceOre</code></sub>(<code>SelectedProducts</code>)</div>

För att kunna följa arbetet ger vi först urvalets resultat namnet <code>SelectedProducts</code>. Operationen σ väljer de produktrader som uppfyller villkoret, varefter π behåller de två efterfrågade attributen ur just dessa rader. Senare kan samma steg skrivas som ett nästlat uttryck, men mellanresultatets namn hjälper oss här att se vad varje operation får att arbeta med.

När attribut väljs bort kan två rader som tidigare gick att skilja åt bli identiska. Eftersom en relation är en mängd finns den gemensamma resultatraden då bara med en gång. Det följer av relationsmodellens definition, inte av att någon rad i den lagrade databasen har tagits bort. SQL behåller däremot vanligen sådana upprepningar om vi inte uttryckligen ber om något annat. För att se varför skillnaden spelar roll följer vi nu beställningarnas kundnummer genom en projektion.

### När en projektion slår ihop rader

I `SalesOrder` finns tre olika beställningar, men bara två olika kundnummer:

| <code>OrderID</code> | <code>CustomerID</code> |
| ---: | ---: |
| 1042 | 17 |
| 1043 | 24 |
| 1044 | 17 |

Projektionen `π` på enbart `CustomerID` ger därför raderna 17 och 24. När ordernumret väljs bort blir de två raderna för kund 17 identiska, och en relation innehåller inte identiska tupler flera gånger. Vi har gått från att beskriva beställningar till att beskriva vilka kunder som beställt.

Detta är också anledningen till att projektion kan minska både antalet attribut och antalet rader. Urval kan däremot bara välja bort befintliga rader; det förändrar inte deras attribut.

## 11.5 Sammanfogning kopplar samman fakta

Alla informationsbehov kan inte besvaras från en enda relation. Kundens namn finns exempelvis i `Customer`, medan kundens beställningar finns i `SalesOrder`:

```text
Customer(CustomerID, CustomerName, Email)
SalesOrder(OrderID, OrderDate, CustomerID, Status)
```

Om vi vill visa beställningsnummer och datum för Mira Eks beställningar behöver relationerna sammanfogas genom det gemensamma kundnumret. Operationen **sammanfogning**, eller *join*, skrivs med symbolen ⋈:

<div class="algebra" role="group" aria-label="Relationsalgebraiskt uttryck"><code>Customer</code> ⋈<sub><code>Customer</code>.<code>CustomerID</code> = <code>SalesOrder</code>.<code>CustomerID</code></sub> <code>SalesOrder</code></div>

Sammanfogningen parar ihop varje kund med de beställningar vars främmande nyckel hänvisar till kunden. När urval och projektion läggs till delar vi upp frågan i tre steg: sammanfoga, välj Miras rader och välj slutligen ordernummer och datum. Likhetstecknet nedan ger varje mellanresultat ett namn:

<div class="algebra" role="group" aria-label="Relationsalgebraiskt uttryck"><code>JoinedOrders</code> = <code>Customer</code> ⋈<sub><code>Customer</code>.<code>CustomerID</code> = <code>SalesOrder</code>.<code>CustomerID</code></sub> <code>SalesOrder</code><br><code>MirasOrders</code> = σ<sub><code>CustomerName</code> = 'Mira Ek'</sub>(<code>JoinedOrders</code>)<br><code>Result</code> = π<sub><code>OrderID</code>, <code>OrderDate</code></sub>(<code>MirasOrders</code>)</div>

Med Nordic Brews exempeldata blir resultatet:

| <code>OrderID</code> | <code>OrderDate</code>  |
| ------: | ---------- |
|    1042 | 2027-01-15 |
|    1044 | 2027-01-17 |

Sammanfogningen härleder ett frågeresultat genom att kombinera matchande rader; den skapar inte någon ny permanent kopia av tabellerna. Kunduppgifter och beställningar ligger därför fortfarande kvar i sina separata, normaliserade tabeller efter att resultatet har visats.

### Se vad som faktiskt paras ihop

| Kundrad | Beställningsrad med samma <code>CustomerID</code> | En rad i resultatet |
| --- | --- | --- |
| 17, Mira Ek | 1042, kund 17 | Mira Ek, 1042 |
| 17, Mira Ek | 1044, kund 17 | Mira Ek, 1044 |
| 24, Samir Noor | 1043, kund 24 | Samir Noor, 1043 |
| 31, Lo Chen | Ingen | Ingen rad i denna sammanfogning |

Mira förekommer två gånger eftersom två olika beställningar matchar hennes kundnummer. Detta är en annan operation än snittet i ett Venn-diagram: vi söker inte hela rader som redan finns identiska i båda relationerna, utan bildar kombinationer av rader som uppfyller ett villkor. <code>JOIN</code>-kapitlet återkommer till detta och till hur även Lo kan få finnas med i resultatet.

## 11.6 Resultatet måste kunna förklaras

En fråga är inte färdig bara för att den ger ett resultat. Resultatets betydelse måste också kunna beskrivas.

För varje resultat bör åtminstone följande frågor kunna besvaras:

* Vad representerar en rad?
* Varifrån kommer varje attribut?
* Vilka villkor avgör om en rad tas med?
* Kan samma verksamhetsföreteelse förekomma på flera resultatrader?
* Krävs en bestämd sorteringsordning?

Den sista frågan är särskilt viktig. Relationer har ingen inneboende radordning. Att rader råkar visas i stigande nummerordning innebär därför inte att samma ordning gäller nästa gång frågan körs. Om ordningen har betydelse måste den anges uttryckligen när frågan senare formuleras i SQL.

### Hur samma tanke uttrycks i SQL

Följande jämförelse är en första karta. Du behöver inte skriva syntaxen på egen hand ännu; nästa kapitel går igenom den mot en körbar databas.

| Avsikt | Relationsalgebra | Motsvarande steg i SQL |
| --- | --- | --- |
| Använd produktrelationen | `Product` | `FROM Product` |
| Behåll aktiva produkter under 120 kr | `σ` med villkoret | `WHERE Active = 1 AND ListPriceOre < 12000` |
| Visa namn och pris | `π` på de två attributen | `SELECT DISTINCT ProductName, ListPriceOre` |

Lägg märke till att SQL-ordet `SELECT` anger vilka uttryck som ska visas, medan algebrans *selection* är urvalet av rader. Det urvalet uttrycks här med `WHERE`. `DISTINCT` behövs om SQL-resultatet ska ha samma frånvaro av dubbletter som en projektion i relationsalgebra.

```sql
SELECT DISTINCT ProductName, ListPriceOre
FROM Product
WHERE Active = 1 AND ListPriceOre < 12000;
```

Resultatet innehåller Espresso blend 250 g med priset 8900 och Decaf coffee 250 g med priset 9900. Deras inbördes visningsordning är inte bestämd av frågan. Vill vi dessutom presentera resultatet i prisordning behöver vi senare lägga till `ORDER BY ListPriceOre`.

## 11.7 Stanna upp och förutsäg

Nordic Brew vill visa `OrderID` och `Status` för alla beställningar med status `CONFIRMED` eller `SHIPPED`.

Vilken relation behövs, vilka rader ska behållas och vilka attribut ska visas?

<details class="answer">
  <summary>Visa resonemang</summary>
  <p>All nödvändig data finns i <code>SalesOrder</code>, vilket innebär att någon sammanfogning inte behövs. Ett urval behåller rader där status är <code>CONFIRMED</code> eller <code>SHIPPED</code>, varefter en projektion begränsar resultatet till <code>OrderID</code> och <code>Status</code>. Med exempeldata ingår order 1042 och 1043.</p>
</details>

## 11.8 Vanlig missuppfattning: fler operationer ger ett bättre svar

Det kan vara lockande att börja varje fråga med en sammanfogning av alla tabeller som verkar beröra samma verksamhetsområde. En sådan strategi gör emellertid frågan svårare att förstå och kan skapa fler rader än förväntat.

Om informationsbehovet gäller produktnamn och listpris finns ingen anledning att sammanfoga `Product` med `OrderLine`. En sådan sammanfogning skulle dessutom utesluta produkter som aldrig har beställts och upprepa produkter som förekommer på flera orderrader.

En bättre princip är att börja med det minsta antal relationer som faktiskt behövs och sedan lägga till varje operation med en tydlig motivering.

## 11.9 Överföringsövning: bibliotekets utlån

Ett bibliotek använder relationerna:

```text
Book(BookID, Title, PublicationYear)
Member(MemberID, MemberName)
Loan(LoanID, BookID, MemberID, LoanDate, ReturnDate)
```

Beskriv följande frågor med urval, projektion och sammanfogning. Du behöver ännu inte skriva SQL.

1. Visa titel och utgivningsår för böcker publicerade efter 2020.
2. Visa lånedatum för alla lån som gjorts av medlemmen Amina Said.
3. Visa lånenummer, boktitel och medlemsnamn för varje registrerat lån.
4. Vilka relationer behövs inte om frågan enbart gäller medlemmarnas namn?
5. Förklara vad en rad representerar i resultatet från fråga 3.

<details class="answer" markdown="1">
<summary>Visa lösningsförslag med resonemang</summary>

1. Börja med `Book` och gör ett urval där `PublicationYear > 2020`. Projicera sedan på `Title` och `PublicationYear`. Varken medlemmen eller lånet behövs för att besvara en fråga om bokens utgivning.
2. Sammanfoga `Member` och `Loan` där deras `MemberID` är lika. Välj därefter rader där `MemberName = 'Amina Said'` och projicera på `LoanDate`. Här antar vi att namnet pekar ut rätt medlem; om flera medlemmar heter Amina Said behöver frågan precisera vem som avses, exempelvis med ett medlemsnummer.
3. Utgå från `Loan`. Sammanfoga med `Book` genom `BookID` och med `Member` genom `MemberID`. Projicera därefter på `LoanID`, `Title` och `MemberName`. Något urval behövs inte eftersom frågan gäller alla registrerade lån.
4. Endast `Member` behövs. En projektion på `MemberName` ger de förekommande namnen. I relationsalgebra tas identiska tupler bort, så två medlemmar med samma namn ger ett gemensamt namnvärde i resultatet. Vill vi skilja medlemmarna åt behöver även `MemberID` följa med.
5. Med giltiga nyckelhänvisningar representerar varje rad ett bestämt lån: lånenumret identifierar händelsen, medan titel och namn beskriver vad som lånades och av vem. Om samma medlem lånar samma bok igen får det nya lånet ett annat `LoanID`. Utan lånenumret skulle projektionen slå ihop de två identiska kombinationerna av titel och medlemsnamn.

Du kan alltså inte alltid ta bort identifierare utan att förändra vad en resultatrad representerar. Börja med informationsbehovet och välj sedan vilka attribut som behöver följa med.
</details>

## 11.10 Följ frågan med ord och mellanresultat

De här små relationerna räcker som underlag. Börja med att beskriva vad varje operation gör och vilket resultat den ger, gärna med ord och små tabeller. Du behöver inte skriva SQL eller formella algebrauttryck. Om du vill träna symbolnotation kan du också uttrycka stegen med σ, π och ⋈.

| <code>CustomerID</code> | <code>CustomerName</code> |
| ---: | --- |
| 17 | Mira Ek |
| 24 | Samir Noor |
| 31 | Lo Chen |

| <code>OrderID</code> | <code>CustomerID</code> | <code>Status</code> |
| ---: | ---: | --- |
| 1042 | 17 | <code>CONFIRMED</code> |
| 1043 | 24 | <code>SHIPPED</code> |
| 1044 | 17 | <code>DRAFT</code> |


1. Välj de beställningar i `SalesOrder` som har status `CONFIRMED` och visa sedan endast `CustomerID`. Visa resultatet efter båda stegen och förklara vad en rad representerar.
2. Utgå från samtliga beställningar och visa varje förekommande kundnummer en gång. Varför innehåller resultatet färre rader än `SalesOrder`?
3. Koppla samman `Customer` och `SalesOrder` genom deras kundnummer. Välj därefter Samir Noors beställningar och visa `OrderID` och `Status`. Beskriv de tre stegen med ord och visa mellanresultatet. Den som vill träna formell notation kan dessutom skriva stegen med σ, π och ⋈.
4. En läsare tar först bort <code>CustomerID</code> från båda relationerna. Varför kan läsaren då inte fortsätta med samma sammanfogningsvillkor?

<details class="answer" markdown="1">
<summary>Visa lösningsförslag och resultat</summary>

Den första frågan kan delas upp så här:

<div class="algebra"><code>ConfirmedOrders</code> = σ<sub><code>Status</code> = '<code>CONFIRMED</code>'</sub>(<code>SalesOrder</code>)<br><code>Result</code> = π<sub><code>CustomerID</code></sub>(<code>ConfirmedOrders</code>)</div>

Urvalet innehåller hela raden (1042, 17, <code>CONFIRMED</code>). Slutresultatet har endast kolumnen <code>CustomerID</code> och värdet 17. I fråga 2 ger projektionen i stället 17 och 24: två order för kund 17 blir samma tupel när både ordernummer och status väljs bort.

Fråga 3:

<div class="algebra"><code>JoinedOrders</code> = <code>Customer</code> ⋈<sub><code>Customer</code>.<code>CustomerID</code> = <code>SalesOrder</code>.<code>CustomerID</code></sub> <code>SalesOrder</code><br><code>SamirsOrders</code> = σ<sub><code>CustomerName</code> = 'Samir Noor'</sub>(<code>JoinedOrders</code>)<br><code>Result</code> = π<sub><code>OrderID</code>, <code>Status</code></sub>(<code>SamirsOrders</code>)</div>

| Kund i sammanfogningen | <code>OrderID</code> | <code>Status</code> |
| --- | ---: | --- |
| Mira Ek, 17 | 1042 | <code>CONFIRMED</code> |
| Samir Noor, 24 | 1043 | <code>SHIPPED</code> |
| Mira Ek, 17 | 1044 | <code>DRAFT</code> |

Tabellen visar ett utsnitt av sammanfogningens attribut. Urvalet behåller Samirs rad; projektionen ger den fullständiga resultatrelationen:

| <code>OrderID</code> | <code>Status</code> |
| ---: | --- |
| 1043 | <code>SHIPPED</code> |

I fråga 4 har de attribut som villkoret använder redan tagits bort. Ett senare steg kan inte hänvisa till en kolumn som inte längre finns i dess indata. Därför behöver en projektion bevara uppgifter som återstående operationer behöver.
</details>

Återvänd gärna till fråga 2 efter SQL-introduktionen. Jämför då `SELECT CustomerID FROM SalesOrder;` med samma fråga med <code>DISTINCT</code>. Vilken motsvarar projektionens frånvaro av identiska tupler?

## Kontrollfrågor

1. Vad skiljer urval från projektion?
2. Varför kan resultatet från en operation användas som indata till nästa?
3. Vad avgör vilka attribut som används i en sammanfogning?
4. Varför kan radordningen inte tas för given?
5. Varför bör en fråga använda så få relationer som informationsbehovet tillåter?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Urvalet avgör vilka rader som får vara med, medan projektionen väljer vilka attribut som ska visas för dem. I produktexemplet behåller urvalet de aktiva produkterna under prisgränsen. Projektionen visar sedan deras namn och pris utan produktnummer och aktiv-status. Vi kan alltså ändra frågans radmängd och dess beskrivning av raderna i skilda steg.

2. Operationernas resultat är också relationer. Efter urvalet har vi därför fortfarande ett underlag med rader och attribut som en projektion kan arbeta med. Denna gemensamma form låter oss bygga en fråga av flera begripliga steg och kontrollera mellanresultaten, utan att varje steg måste sparas som en ny permanent tabell.

3. Attributen väljs utifrån vilket samband vi vill följa och vad deras värden betyder. För att koppla en beställning till kunden jämför vi `SalesOrder.CustomerID` med `Customer.CustomerID`. Att i stället jämföra ordernummer med kundnummer vore inte samma samband, även om kolumnerna har samma datatyp och råkar innehålla några lika tal.

4. En relation beskrivs som en mängd av tupler och har därför ingen inbyggd ordning mellan raderna. När vi ritar en tabell måste raderna stå någonstans på sidan, men den placeringen är inte en del av relationens betydelse. I SQL behöver en bestämd presentationsordning begäras uttryckligen med `ORDER BY`.

5. Varje tillagd relation behöver bidra med en efterfrågad uppgift eller ett nödvändigt villkor. En onödig sammanfogning med orderrader kan exempelvis ta bort produkter som aldrig beställts och samtidigt upprepa produkter som beställts flera gånger. Färre motiverade steg gör därför frågans betydelse och radantal lättare att kontrollera; det handlar inte bara om att skriva kortare kod.

</details>

## Sammanfattning

Relationsalgebra låter oss följa en fråga genom konkreta mellanresultat. Urval behåller rader, projektion väljer attribut och tar bort identiska tupler, medan sammanfogning bildar matchande radpar. När avsikten senare uttrycks i SQL behöver vi fortfarande kontrollera radbetydelse, upprepningar och eventuell sortering.