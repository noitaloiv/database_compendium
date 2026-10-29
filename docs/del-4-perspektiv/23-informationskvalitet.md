---
layout: default
track: grundspar
prerequisites: "Kapitel 1, 16 och 22: betydelse, integritetsvillkor och ansvar."
focus: "Skilj tekniskt giltiga värden från information som går att lita på i en viss uppgift."
title: 23. Informationskvalitet – när går uppgifterna att använda?
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 23
permalink: /docs/del-4-perspektiv/informationskvalitet/
description: Bedöm uppgifters betydelse, riktighet, fullständighet, aktualitet och ursprung utifrån användningen.
keywords: [informationskvalitet, datakvalitet, aktualitet, fullständighet, riktighet, metadata, ursprung, dubbletter, historik]
---

# 23. Informationskvalitet – när går uppgifterna att använda?

{% include chapter_guide.html %}

En kund hos Nordic Brew har bytt e-postadress, men den gamla adressen står kvar i kundregistret. Eftersom adressen fortfarande uppfyller tabellens krav på ett angivet och unikt värde kan kundens beställning registreras utan felmeddelande. Orderbekräftelsen skickas ändå till fel adress. Det som gick bra i databasen var alltså kontrollen mot de angivna reglerna, medan uppgiften inte längre fungerade för det avsedda ändamålet.

Exemplet samlar en fråga som har följt med genom hela boken: räcker det att databasen godkänner ett värde? För att bedöma **informationskvalitet** behöver vi också fråga om uppgiften är användbar för det ändamål den ska stödja. Samma uppgift kan vara tillräcklig i ett sammanhang och otillräcklig i ett annat.

## 23.1 Börja med beslutet som informationen ska stödja

Anta att produkt 501 har det registrerade lagersaldot 90 förpackningar. Om saldot kontrollerades för fem minuter sedan kan det ge ett användbart underlag för dagens leveranser, medan samma tal i en rapport från förra månaden inte säger lika mycket om vad som finns att packa nu. För att bedöma uppgiften behöver vi därför veta både när den gällde och vilka lagerförändringar som kan ha skett sedan dess.

En rapport från förra månaden kan samtidigt vara precis rätt underlag för att beskriva lagret vid det månadsskiftet. Aktualitet betyder alltså inte att alla uppgifter alltid ska ersättas med dagens värde. Historiska uppgifter måste i stället vara korrekta för den tid de avser.

| Användning hos Nordic Brew | Vad behöver uppgiften kunna visa? | Vad blir fel om sammanhanget saknas? |
| --- | --- | --- |
| Skicka orderbekräftelse | Kundens avsedda kontaktadress för beställningen | Meddelandet når inte rätt mottagare |
| Planera dagens plockning | Lagerantal som är tillräckligt aktuella | Personalen lovar förpackningar som inte finns kvar |
| Förklara en äldre order | Antal och pris som avtalades då | Dagens listpris förändrar bilden av det gamla köpet |
| Jämföra beställningsvolym mellan månader | Samma definition och enhet i båda perioderna | Förändrade beräkningssätt ser ut som förändrad efterfrågan |

När vi bedömer kvalitet bör vi därför först avsluta meningen: *uppgiften ska användas för att …*. Annars riskerar vi att kontrollera sådant som är lätt att mäta och missa det som avgör om användaren kan fatta ett rimligt beslut.

## 23.2 Undersök flera sidor av kvaliteten

Ett saldo kan återge en tidigare inventering helt korrekt och ändå vara otillräckligt för dagens plockning. På samma sätt kan varje angivet paketmått vara riktigt, samtidigt som måtten saknas för så många paket att transporten inte går att planera. Riktighet är därför en viktig del av kvaliteten, men behöver bedömas tillsammans med bland annat tid, fullständighet och möjligheten att tolka uppgifterna. Tabellen nedan visar olika frågor som hjälper oss att undersöka samma underlag.

| Perspektiv | Konkret kontrollfråga | Exempel |
| --- | --- | --- |
| Riktighet | Stämmer registreringen med det den påstår? | Avser kundnumret faktiskt den beställande kunden? |
| Fullständighet | Finns de uppgifter som behövs för ändamålet? | Är samtliga order från perioden med i rapporten? |
| Aktualitet | Gäller uppgiften vid rätt tidpunkt? | När bekräftades kontaktadressen senast? |
| Överensstämmelse | Har uppgifter som ska beskriva samma sak samma betydelse? | Anger två system pris i samma valuta och enhet? |
| Begriplighet | Kan mottagaren tolka värdet rätt? | Är `Quantity` antal förpackningar eller gram? |
| Åtkomlighet | Kan rätt person komma åt uppgiften när den behövs? | Kan kundservice hitta rätt order utan att få onödiga rättigheter? |

Tabellen är ett sätt att ställa frågor, inte en obligatorisk checklista där varje rad måste få ett poängtal. Vilka brister som är allvarliga beror på vad informationen ska användas till och vilka följder ett fel kan få.

När en kvalitetsbrist upptäcks behöver åtgärden träffa orsaken till problemet. Ett nytt fält förbättrar exempelvis inte registreringen om ingen vet vem som ansvarar för att fylla i det. På motsvarande sätt hjälper en oftare uppdaterad rapport föga om de två system som jämförs fortfarande menar olika saker med ”beställd produkt”. Vi behöver alltså förstå bristen innan vi väljer en teknisk förändring.

## 23.3 Vad kan databasen kontrollera?

Vi har redan använt flera verktyg som stärker kvaliteten: en främmande nyckel kan exempelvis hindra en order från att hänvisa till en kund som inte finns, ett `CHECK`-villkor kan kräva att det registrerade antalet är positivt och normalisering kan minska risken för motstridiga kopior av samma aktuella faktum. Tillsammans hjälper de oss att hålla registreringarna förenliga med de regler vi har uttryckt.

De kan däremot inte ensamma avgöra om Mira verkligen beställde varan eller om det registrerade antalet kaffeförpackningar motsvarar hennes beställning. För det behöver databasen ett tillförlitligt underlag att jämföra med: den kan kontrollera givna regler och värden, men har ingen egen direkt tillgång till vad som hände när kunden beställde.

Anta i ett separat kontrollfall att Mira beställde två förpackningar, men att antalet råkade registreras som 20. Figuren samlar uppgifter från beställningen och dess orderrad och visar varför misstaget kan passera flera tekniska kontroller.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/29-kvalitet-underlag-registrering.svg' | relative_url }}" alt="Två beställda kaffeförpackningar jämförs med en orderrad där Quantity felaktigt är 20. Tekniska villkor kan godkännas trots felskrivningen." width="1000" height="520" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 23.1.</strong> Antalet 20 är positivt men återger inte beställningen. Detta är ett illustrativt felregistreringsfall, inte en ändring av bokens SQL-startdata. <a href="{{ '/assets/images/29-kvalitet-underlag-registrering.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

<figure class="diagram">
<div class="table-wrapper"><table>
<thead><tr><th scope="col">Kontroll</th><th scope="col">Kan upptäcka</th><th scope="col">Behöver annat underlag för att avgöra</th></tr></thead>
<tbody><tr><td>Främmande nyckel för <code>CustomerID</code></td><td>Kundnummer 999 saknas</td><td>Kund 17 finns, men ordern tillhör egentligen kund 24</td></tr>
<tr><td><code>NOT NULL</code> och <code>CHECK</code> på <code>Quantity</code> &gt; 0</td><td>Antalet −2 är otillåtet</td><td>2 registrerades fast kunden beställde 3</td></tr>
<tr><td><code>UNIQUE</code> på <code>Email</code></td><td>Samma adress registreras igen</td><td>Två olika adresser tillhör samma person</td></tr>
<tr><td>Transaktion</td><td>Ofullständiga ändringar kan återställas tillsammans</td><td>Båda ändringarna gäller fel produkt</td></tr></tbody></table></div>
<figcaption><strong>Tabell 23.1.</strong> Tekniska villkor kontrollerar uttryckta regler. För att bedöma överensstämmelsen med verksamheten behövs också rätt källa och ett ansvar för kontrollen.</figcaption>
</figure>

Om felet är att 20 förpackningar registrerades i stället för 2 behöver vi därför komplettera databasens villkor med en kontroll mot själva beställningen. Tydliga inmatningsfält kan minska risken för felskrivning, medan en orderbekräftelse kan ge kunden möjlighet att upptäcka ett kvarvarande fel. När olika underlag ändå säger olika saker behöver någon också ha ansvar för att undersöka skillnaden och besluta vilken uppgift som ska rättas. Kontrollerna kompletterar då varandra, eftersom de fångar olika slags problem.

## 23.4 Saknade uppgifter är inte samma sak som noll

Anta att vikten saknas för vissa paket i en leveransrapport. Det kan verka praktiskt att ersätta de saknade värdena med noll för att kunna summera alla rader, men då ändrar vi också vad rapporten påstår: paketen framstår som viktlösa i stället för ovägda. Totalsumman kan därför bli missvisande samtidigt som underlaget ser mer fullständigt ut än det är.

I SQL kan en saknad uppgift representeras med `NULL`. Detta behöver kompletteras med en definition av *varför* värdet saknas. ”Inte uppmätt”, ”inte tillämpligt” och ”har inte importerats ännu” kan kräva olika åtgärder, även om systemet från början lagrar alla tre som <code>NULL</code>.

| Registrering av vikt | Vad vet vi? | Rimlig fortsättning |
| --- | --- | --- |
| 0 gram | Ett känt värde, om det verkligen är uppmätt eller definierat så | Pröva om noll är rimligt för just denna sorts paket |
| <code>NULL</code>, inte uppmätt | Vikten är okänd | Mät om ändamålet kräver en vikt |
| <code>NULL</code>, import saknas | Källan kan ha uppgiften | Undersök importen innan värdet fylls i manuellt |

För att mottagaren ska kunna bedöma en sammanställning behöver dess underlag framgå. Om medelvikten exempelvis bygger på 80 av 100 paket bör rapporten visa både beräkningen och att 20 paket saknar vikt. Annars riskerar ett matematiskt korrekt medelvärde att uppfattas som representativt för hela leveransen. Skillnaden knyter an till SQL-kapitlet, där `COUNT(*)` räknade alla rader medan `COUNT(attribut)` bara räknade de rader som hade ett värde i attributet.

## 23.5 Bevara betydelse, ursprung och tid

**Metadata** hjälper oss att förstå själva uppgifterna. För ett pris behöver vi exempelvis veta vad priset avser, vilken valuta och enhet som används och om det är aktuellt eller historiskt. **Ursprung** handlar om varifrån registreringen kommer och hur den har bearbetats.

En enkel beskrivning av Nordic Brews befintliga prisfält kan se ut så här:

| Egenskap | <code>ListPriceOre</code> | <code>AgreedUnitPriceOre</code> |
| --- | --- | --- |
| Betydelse | Produktens aktuella listpris per förpackning | Avtalat pris per förpackning på en viss orderrad |
| Enhet i övningsdata | Svenska ören | Svenska ören |
| Vem bestämmer värdet? | Den som ansvarar för prislistan | Orderregistreringen enligt det avtal som gäller köpet |
| Vad händer vid en ny prislista? | Kan ändras | Äldre orderrader ska behålla det avtalade priset |

I ett större system kan det också behövas uppgifter om vilken källa som levererade ett värde och när det hämtades. Tidpunkten för import är dock inte alltid den tidpunkt uppgiften gäller: en lagerlista som importeras i dag kan beskriva gårdagens inventering.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur som kan rullas i sidled på smal skärm" style="--figure-width: 900px">
  <img src="{{ '/assets/images/30-kvalitet-observation-import.svg' | relative_url }}" alt="Nittio förpackningar observeras klockan nio. Tio skickas ut före klockan femton, men rapporten som importeras då innehåller fortfarande observationen nittio." width="1000" height="510" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 23.2.</strong> Rapporten kan vara korrekt för observationstillfället utan att beskriva det nuvarande lagret. En senare import ändrar inte vilken tid uppgiften avser. <a href="{{ '/assets/images/30-kvalitet-observation-import.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Det är därför bättre att använda precisa namn som `ObservedAt` för observationstid och `ImportedAt` för importtid än att lägga allt i ett odefinierat `Date`. Dessa fält är exempel på hur modellen kan utvidgas när behovet finns; de har inte lagts till i bokens tidigare startfiler.

## 23.6 Undersök dubbletter innan de slås ihop

När två kundrader båda innehåller namnet Mira Ek är det lätt att misstänka en dubbelregistrering. Namnet räcker emellertid inte för att avgöra saken, eftersom två olika personer kan heta likadant. Det omvända gäller också: samma person kan ha registrerats under två stavningar och fått olika kundnummer. Vi behöver därför undersöka vad raderna betecknar och vilket underlag som stöder deras identitet, i stället för att låta vare sig namnlikhet eller olika primärnycklar avgöra frågan ensamt.

Anta att kundservice hittar två registreringar för Mira Ek. Innan de slås ihop behöver någon undersöka vad `Customer` betecknar, vilka underlag som stöder att det är samma kund och vad som händer med hänvisningarna från tidigare order. Kanske är det en dubbelregistrering; kanske är det avsiktligt skilda konton med olika ansvar.

Att radera den ena raden direkt kan förstöra historik eller göra att order förknippas med fel part. En rättning bör därför omfatta både beslutet om vad som är korrekt och hur hänvisningar samt dokumentation ska bevaras. Nästa kapitel fördjupar just frågan om vad identifieraren betecknar.

## 23.7 Överföringsövning: föreningens inventering

**Arbetssätt:** resonera utifrån tabellen. Den är ett fristående granskningsunderlag, inte en fil som ska köras i SQLite. Föreningen vill lova ut stolar till ett evenemang på fredag.

| Uppgift | Registrerat innehåll | Känt sammanhang |
| --- | --- | --- |
| Antal stolar | 80 | Inventerat för sex månader sedan |
| Trasiga stolar | 0 | Fältet fylldes automatiskt med noll när ingen uppgift fanns |
| Utlånade stolar | 20 | Avser ett pågående lån, väntas tillbaka på måndag |
| Enhet | Saknas | Ett äldre system räknade staplar med fem stolar |

1. Vilken uppgift bör hindra föreningen från att utan vidare lova ut 80 stolar på fredag?
2. Vilka två frågor skulle du reda ut först, och varför?
3. Föreslå en bättre hantering av fältet för trasiga stolar.
4. Räcker ett villkor som kräver att alla antal är minst noll?

<details class="answer" markdown="1">
<summary>Ett möjligt resonemang</summary>

1. Underlaget ger inte ett säkert antal tillgängliga stolar. Inventeringen är gammal, nollan för trasiga är påhittad, enheten är oklar och 20 stolar väntas tillbaka först efter evenemanget.
2. Börja exempelvis med att fastställa enheten och kontrollera vilka fungerande stolar som faktiskt är tillgängliga på fredag. Dessa frågor avgör direkt vad som kan lovas. Exakt prioritering kan anpassas efter hur snabbt underlagen går att kontrollera.
3. Behåll att uppgiften är okänd tills den har kontrollerats, i stället för att registrera en falsk nolla. Dokumentera när och av vem antalet kontrollerades om det behövs för fortsatt användning.
4. Nej. Ett sådant villkor hindrar negativa värden men avgör inte om 80 avser stolar eller staplar, om antalet är aktuellt eller om stolarna är bokningsbara.
</details>

## Kontrollfrågor

1. Kan en gammal uppgift ha hög kvalitet?
2. Vad kan en främmande nyckel kontrollera när en order får ett kundnummer?
3. Varför kan ett korrekt medelvärde ändå vilseleda?
4. Varför räcker inte samma namn för att avgöra om två kundrader är dubbletter?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Ja, om den beskriver rätt historiska tidpunkt för det avsedda ändamålet. En korrekt lageruppgift från förra månadsskiftet kan vara precis vad en historisk rapport behöver. Samma tal behöver däremot inte vara ett användbart besked om vad som finns att packa i dag. Kvaliteten bedöms därför i relation till användningen, inte enbart uppgiftens ålder.

2. Den främmande nyckeln kan kontrollera att det angivna kundnumret har en giltig motsvarighet i kundtabellen. Om kund 17 finns kan hänvisningen därför godkännas. Villkoret kan däremot inte ensamt avgöra om kund 17 faktiskt gjorde beställningen; för det behövs ett tillförlitligt verksamhetsunderlag. Ett befintligt nummer kan fortfarande vara fel nummer.

3. Beräkningen kan vara riktig för sitt underlag men tolkas som ett besked om en större eller annorlunda grupp. Om bara 80 av 100 paket har registrerad vikt beskriver medelvärdet de 80 kända vikterna, inte automatiskt hela leveransen. Rapporten behöver därför göra både de saknade observationerna och beräkningens avgränsning synliga.

4. Namnlika rader kan beskriva olika personer, och samma person kan också ha flera avsiktligt skilda kundkonton. Innan något slås ihop behöver vi därför undersöka vad `Customer` betecknar och vilket underlag som visar att registreringarna verkligen gäller samma företeelse. Annars kan en tänkt rättning i stället koppla historiska order till fel part.

</details>

## Sammanfattning

Informationskvalitet bedöms i förhållande till användningen. Giltiga format och integritetsvillkor ger viktiga skydd, men vi behöver också förstå betydelse, tid, fullständighet och ursprung. När brister upptäcks behövs ett ansvar för att kontrollera och rätta dem utan att förlora hänvisningar eller historik.

**Vidare läsning:** Wang, R. Y. & Strong, D. M. (1996), [Beyond Accuracy: What Data Quality Means to Data Consumers](https://www.jmis-web.org/articles/1002), *Journal of Management Information Systems*, 12(4), 5–33. Studien visar varför användbar datakvalitet behöver förstås bredare än enbart riktighet. Kapitlets kontroller och verksamhetsexempel är egna tillämpningar av detta perspektiv.