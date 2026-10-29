---
layout: default
track: grundspar
prerequisites: "Kapitel 1, 4 och 5: betydelse, identifierare och begrepp."
focus: "Förklara vad en identifierare betecknar och vem som ansvarar för den."
title: 24. Begrepp, identitet och informationssystem
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 24
permalink: /docs/del-4-perspektiv/begrepp-identitet-och-informationssystem/
description: Undersök vad modeller och identifierare betecknar, från fysiska föremål till institutionella roller.
keywords: [begrepp, ontologi, identitet, identifierare, institutionella fakta, syntax, semantik, pragmatik]
---

# 24. Begrepp, identitet och informationssystem

{% include chapter_guide.html %}

Två system kan använda kolumnnamnet `CustomerID` utan att mena samma sak med ”kund”. I det ena betecknar kunden en person som köper något; i det andra betecknar den ett faktureringskonto som flera personer använder. Om uppgifterna slås ihop utifrån kolumnnamnet kan resultatet bli missvisande trots att alla SQL-frågor går att köra.

Vi återvänder därför till den fråga som föregick tabellerna: vad är det egentligen som beskrivs? Konceptuell modellering är ett sätt att undersöka detta. Entitetsrutor, associationer och multiplicitet är notation för resonemanget, medan själva arbetet gäller begrepp, avgränsningar och gemensam förståelse.

## 24.1 En modell är ett urval med ett syfte

Ett bibliotek behöver skilja bokutgåvan från de fysiska exemplaren för att veta vilket exemplar som lånas ut och vilket som fortfarande står på hyllan. I en litteraturhistorisk undersökning kan andra skillnader vara viktigare, exempelvis de mellan verk, översättning och utgåva. Båda modellerna gör därför ett urval av vad som beskrivs, men urvalet behöver motiveras av de frågor respektive verksamhet vill kunna besvara.

En modell kan ändå kritiseras. Om bibliotekets modell inte kan skilja två samtidigt utlånade exemplar åt uppfyller den inte sitt syfte. ”Alla modeller är förenklingar” är därför ingen ursäkt för oklara begrepp. Vi behöver kunna säga både vad modellen tar med och vad som avsiktligt lämnas utanför.

När vi undersöker vilka slags företeelser en modell förutsätter och hur de hör ihop rör vi oss mot *ontologiska frågor*. Här syftar ontologi på våra grundantaganden om vad som finns och räknas som något i verksamheten, inte på ett särskilt tekniskt verktyg.

## 24.2 Fysiska föremål och institutionella roller

En och samma person kan vara student, anställd och bibliotekslåntagare samtidigt. Roller behöver ändå kunna skiljas åt i modellen, eftersom de medför olika rättigheter, skyldigheter och relationer. Om studentregistreringen upphör finns personen fortfarande kvar, och anställningen kan fortsätta oberoende av registreringen. Det är denna skillnad mellan personen och personens olika roller som modellen behöver kunna bevara.

Begrepp som student, kundkonto och godkänd bokning är därför inte bara etiketter på fysiska ting. Deras betydelse beror på regler och socialt erkännande. En bokning räknas exempelvis som bekräftad därför att vissa villkor och handlingar gör den bekräftad inom verksamheten. Detta är ett exempel på ett **institutionellt faktum**.

| Företeelse | Vad behöver definitionen förklara? |
| --- | --- |
| En fysisk person | Vilken person vi avser. |
| Ett studentdeltagande | Vilken person som deltar i vilket kurstillfälle enligt vilka registreringar. |
| Ett kundkonto | Vilken part eller grupp kontot företräder och vem som får använda det. |
| En bekräftad bokning | Vilken regel eller handling som gör bokningen giltig. |

De regler som gör en registrering till ett studentdeltagande kan få konkreta följder, exempelvis för rätten att delta i undervisning eller få ett resultat registrerat. På samma sätt kan definitionen av ett kundkonto avgöra vem som ansvarar för en betalning. Att dessa företeelser är institutionella betyder därför inte att de är godtyckliga; deras betydelse behöver förklaras genom de regler och handlingar som verksamheten erkänner. Det är dessa skillnader modellen måste kunna bevara.

## 24.3 Identifiera personen eller personens deltagande?

Anta att Nora deltar i samma kurs vid två olika tillfällen. Personens identifierare är densamma, men deltagandena kan ha olika registreringsdatum och resultat. Om `PersonID` görs till enda nyckel i en tabell över deltaganden kan vi inte registrera båda utan att skriva över eller sammanblanda dem.

Ett möjligt schema är:

```text
Person(PersonID, PersonName)
CourseOffering(OfferingID, CourseCode, StartDate)
Enrollment(PersonID, OfferingID, RegisteredAt)
PK i Enrollment: PersonID + OfferingID
```

I detta schema låter `PersonID` oss känna igen Nora som samma person vid båda kurstillfällena. För att peka ut ett av hennes deltaganden behöver vi däremot också ange `OfferingID`: kombinationen skiljer höstens deltagande från vårens. Nyckelvalet bygger alltså på regeln att en person har högst ett deltagande per tillfälle. Om även ett enskilt tillfälle kan innehålla flera separata deltagandeperioder som ska följas var för sig behöver modellen beskriva den skillnaden och få en identifierare som klarar den.

Ett unikt nummer löser alltså inte identifieringsfrågan förrän vi har bestämt **vad numret ska identifiera**. Om numret betecknar personen men raden ska beskriva ett av flera deltaganden har vi valt fel företeelse som grund för nyckeln, även om numret är tekniskt unikt i personregistret.

<figure class="figure" id="figur-24-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 24.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/43-person-och-deltagande.svg' | relative_url }}" alt="PersonID 71 betecknar Nora. Kombinationerna 71 med OfferingID 501 respektive 608 betecknar hennes två olika deltaganden." width="900" height="435" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 24.1.</strong> Samma person har två deltaganden med olika identifierande kombinationer. Numren hör till utbildningsexemplet och har ingen koppling till Nordic Brews produkter. <a href="{{ '/assets/images/43-person-och-deltagande.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 24.4 Tre frågor om en identifierare

Eriksson och Ågerfalk diskuterar identifierare som en fråga om betydelse och ansvar i informationssystem. Tre problemområden hjälper oss att pröva våra egna modeller: information som byggs in i identifieraren, valet av vad den identifierar och hur den förvaltas.

**Vilken information bär numret?** En medlemskod som `UPP-2027-0042` kan exempelvis innehålla ort och registreringsår. Om medlemmen flyttar behöver föreningen då bestämma om koden ska bevara den ursprungliga orten eller ändras till den nya. Det första valet kräver att mottagaren förstår kodens historiska betydelse, medan det andra också kräver att gamla hänvisningar hanteras. Information i identifieraren kan alltså vara användbar, men dess betydelse över tid behöver vara avsiktlig.

**Vilken företeelse pekar den ut?** <code>Person</code>, medlemskap och kundkonto är olika möjliga svar. Ett personnummer eller en personnyckel ska inte oreflekterat ersätta en medlemskapsnyckel om samma person kan ha flera medlemskap som behöver följas var för sig.

**Vem bestämmer över identifieraren?** Någon behöver tilldela den, förebygga dubletter, besluta om rättningar och ange om gamla nummer får återanvändas. Två organisationer kan båda ha kund 17 utan att mena samma kund. Vid datautbyte behövs därför även sammanhanget för numret, exempelvis vilken organisation som utfärdade det.

## 24.5 Rätt syntax kan fortfarande ge fel betydelse

Kapitel 1 visade att värdet 34700 behöver ett sammanhang. Nu kan vi skilja tre frågor om en registrering:

| Perspektiv | Fråga | Exempel |
| --- | --- | --- |
| **Syntax** | Är uttrycket uppbyggt enligt formen? | Beloppet består av tillåtna siffror och lagras i rätt kolumn. |
| **Semantik** | Vad betyder uttrycket? | 34700 betyder 347 kronor när enheten är öre. |
| **Pragmatik** | Hur används och förstås uppgiften i arbetet? | Beloppet används för att begära betalning av rätt part. |

En betalningsbegäran på 34700 kronor kan vara syntaktiskt välformad men semantiskt fel om beloppet lagrades i öre. Även ett rätt tolkat belopp kan användas olämpligt, exempelvis om det skickas till någon som inte längre är betalningsansvarig. Därför behöver systemets kvalitet bedömas i relation till både värden, betydelser och verksamhetshandlingar.

## 24.6 Beskrivningar och identifierare pekar ut på olika sätt

Om någon på ett möte ber oss lämna en blankett till ”personen i den röda jackan” kan beskrivningen räcka för att peka ut rätt person. Den fungerar därför att vi delar ett sammanhang och för tillfället bara ser en person som stämmer in på den. En sådan utpekande beskrivning kallas en **bestämd beskrivning**.

Beskrivningen är däremot inte nödvändigtvis en bra grund för långvariga hänvisningar. Nästa dag har personen bytt jacka, eller också finns två röda jackor i rummet. Ett medlems-ID kan fortsätta att beteckna samma medlemskap även när personens kläder, namn och adress ändras, förutsatt att föreningen förvaltar identifieraren på det sättet.

Skillnaden ligger alltså i hur hänvisningen fungerar. Beskrivningen pekar ut genom egenskaper i ett sammanhang, medan en tilldelad identifierare bygger på en överenskommen koppling till den företeelse som ska identifieras. Även identifieraren kräver sammanhang: nummer 42 betyder inget bestämt utan information om vilket register eller vilken utfärdare vi menar.

**Pröva tanken:** Räcker ”den som just nu är ordförande” för att ange mottagaren av dagens mötesinbjudan? Räcker samma beskrivning för att dokumentera vem som fattade ett beslut för fem år sedan?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

Beskrivningen kan fungera för dagens inbjudan om föreningen har en känd, entydig ordförande. Den räcker inte ensam för det historiska beslutet, eftersom rollen kan ha bytt innehavare. Då behöver registreringen bevara vem som avsågs vid beslutstillfället, och vid behov även personens roll under den perioden. Det är informationsbehovet över tid som avgör vilken hänvisning som behövs.
</details>

## 24.7 Öva: ett medlemsnummer som byter ägare

En förening återanvänder medlemsnummer när någon lämnar föreningen. Nora hade nummer 42 år 2025. År 2027 får Bo samma nummer. En äldre tabell över betalda avgifter innehåller bara medlemsnumret och beloppet.

1. Varför räcker inte den aktuella medlemstabellen för att tolka en äldre betalning på nummer 42?
2. Hur skulle en annan identifieringsregel kunna undvika problemet?
3. Vilket ansvar behöver dokumenteras även om en ny teknisk nyckel införs?

<details class="answer" markdown="1">
<summary>Visa ett möjligt resonemang</summary>

1. Nummer 42 har betecknat två olika medlemskap över tid. En koppling till dagens rad kan tillskriva Bo Noras betalning.
2. Ett stabilt medlemskaps-ID som inte återanvänds kan identifiera medlemskapet, medan ett synligt medlemsnummer hanteras separat med sin giltighet. Den exakta modellen beror på vilken historik verksamheten behöver.
3. Vem som tilldelar nummer, vad som räknas som samma medlemskap, hur fel rättas och hur historiska hänvisningar ska bevaras. En ny kolumn fattar inte de besluten åt verksamheten.
</details>

## 24.8 Behöver sambandet till personen bevaras?

Hittills har vi ofta undersökt hur historiska händelser kan bevaras utan att skrivas över. Det betyder inte att varje uppgift om en person bör sparas utan slut. Ett bibliotek kan exempelvis behöva veta vem som ansvarar för ett pågående lån, samtidigt som det senare vill sammanställa hur många utlåningar en viss bokutgåva har haft. Det är två olika informationsbehov, och bara det första kräver självklart att personen kan pekas ut.

För personuppgifter behöver insamling och fortsatt användning ha ett bestämt ändamål. **Uppgiftsminimering** innebär att uppgifterna begränsas till vad ändamålet kräver, medan **lagringsminimering** gäller hur länge de behöver bevaras. Dessa principer kompletterar behörighetsstyrningen: även en väl skyddad uppgift kan vara onödig att samla in eller fortsätta lagra.

| Skede | Fråga att reda ut | Bibliotekets exempel |
| --- | --- | --- |
| Insamling | Vilka uppgifter behövs för den avsedda uppgiften? | Kontaktväg för ett pågående lån, men inte automatiskt uppgifter om familjemedlemmar |
| Användning | Vem behöver se vad? | Personal kan behöva kontakta låntagaren; en sammanställning över utlåningsvolym behöver inte visa namn |
| Bevarande | Vilket fortsatt behov eller krav finns? | Ett avslutat lån kan behöva utredas en tid, men detta måste ha ett uttalat skäl |
| Radering eller bearbetning | Vad behöver finnas kvar för att det återstående ändamålet ska kunna uppfyllas? | Statistik kan i vissa fall bevaras utan att enskilda låntagare kan identifieras |

Det går därför inte att ange en allmän tidsgräns som passar varje databas. Vissa handlingar omfattas också av särskilda bevarandekrav. Verksamheten behöver reda ut vad som gäller och låta modellen samt rutinerna stödja det, i stället för att göra ett tekniskt standardval till en outtalad bevarandepolicy.

### Ett nytt nummer gör inte uppgifterna anonyma

Anta att namnet tas bort ur lånelistan, men att `MemberID` finns kvar och fortfarande kan kopplas till medlemsregistret. Personen kan då fortfarande identifieras. Att ersätta ett namn med ett nummer kan minska direkt exponering, men det ska inte utan vidare beskrivas som anonymisering. Även kombinationer av andra uppgifter kan ibland göra en person igenkännbar.

På motsvarande sätt är en markering som `IsDeleted = 1` inte samma sak som att uppgiften har raderats. Raden kan fortfarande finnas i tabellen, i exporter eller i säkerhetskopior. En genomtänkt hantering behöver därför ange vilka kopior och kopplingar som finns och hur de hanteras över tid. Detta är en fråga om systemets samlade ansvar, inte bara om en enskild `DELETE`-sats.

**Pröva:** Biblioteket vill visa antal utlåningar per bokutgåva och månad. En kollega vill behålla alla tidigare låntagares namn och e-postadresser för säkerhets skull. En annan föreslår att namnen ersätts med medlemsnummer. Vad behöver ni undersöka innan något av förslagen väljs?

<details class="answer" markdown="1">
<summary>Ett möjligt resonemang</summary>

Börja med vad sammanställningen faktiskt behöver: bokutgåva, tidsperiod och antal. Namn och e-postadresser behövs inte för just den beräkningen. Om det finns ett annat behov av individuppgifterna behöver det beskrivas och bedömas separat, tillsammans med eventuella bevarandekrav.

Förslaget med medlemsnummer tar inte automatiskt bort personkopplingen, eftersom numret kan användas för att slå upp personen. Ett alternativ kan vara en sammanställning på en lämplig nivå utan identifierbara låntagare, men även den behöver bedömas utifrån vilka uppgifter och kombinationer som faktiskt lämnas kvar. Valet bör alltså följa det avsedda användningsområdet och en prövad hantering, inte bara byta kolumnnamn.

</details>

**Vidare läsning:** [IMY om grundläggande principer för personuppgifter](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/grundlaggande-principer/) och [om skillnaden mellan anonymiserade och identifierbara uppgifter](https://www.imy.se/verksamhet/dataskydd/innovationsportalen/vi-guidar-dig/vi-hanterar-bara-anonymiserade-personuppgifter-da-kan-vi-val-bortse-fran-gdpr/). Principerna ger vägledning för designfrågorna här; vad som gäller för en viss verksamhet behöver bedömas i sitt sammanhang.

## Kontrollfrågor

1. Varför är konceptuell modellering mer än att rita ett ER-diagram?
2. Hur kan samma person motsvara flera institutionella roller?
3. Vilken skillnad finns mellan ett unikt värde och en lämplig identifierare?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Diagrammet är en notation för att uttrycka begrepp, samband och regler som först behöver undersökas. Att rita en ruta för `Customer` avgör exempelvis inte om rutan betyder en person, ett konto eller en organisation. Modelleringen omfattar därför också definitionerna, avgränsningarna och prövningen mot verksamhetens behov; en snygg bild ersätter inte dessa beslut.

2. En person kan ha flera roller genom olika relationer och regler. Nora kan exempelvis vara både student och anställd, och avsluta ett studentdeltagande utan att anställningen upphör. Om modellen blandar samman personen med en enda roll riskerar den att förlora den andra rollens uppgifter när något förändras.

3. Ett unikt värde skiljer registreringar åt i ett givet underlag, men en lämplig identifierare måste också peka ut rätt slags företeelse och fungera över den tid som behövs. `PersonID` kan vara unikt för Nora utan att kunna identifiera vart och ett av hennes flera kurstillfällesdeltaganden. Vi måste därför bestämma vad raden beskriver innan vi väljer dess identifierare.

</details>

**Vidare läsning:** Eriksson, O. & Ågerfalk, P. J. (2010), *Rethinking the Meaning of Identifiers in Information Infrastructures*, Journal of the Association for Information Systems, 11(8), 433–454. [doi:10.17705/1jais.00234](https://doi.org/10.17705/1jais.00234). Kapitlets exempel är egna tillämpningar av frågorna om betydelse och identifiering.

## Sammanfattning

Ett unikt värde är användbart först när det är klart vad det betecknar. Personer, roller, konton och deltaganden kan behöva olika identifierare, även om de hör samman. Modellen behöver därför beskriva både begreppens betydelse och hur hänvisningar ska fungera över tid och mellan organisationer.