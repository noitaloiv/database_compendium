---
layout: default
track: grundspar
prerequisites: "Kapitel 3–4: rader, kolumner och identifierare."
focus: "Skilj ett värde från en hel rad och kombinera två enkla mängder."
title: 10. Mängder och relationer
parent: Del II – Frågor och förändring
nav_order: 10
permalink: /docs/del-2-fragor/mangder-och-relationer/
description: Från samlingar av produktnummer till relationer som mängder av beskrivande rader.
keywords: [mängd, element, union, snitt, differens, tupel, domän, relationsmodell]
---

# 10. Mängder och relationer

{% include chapter_guide.html %}

Nordic Brew vill undersöka vilka produkter som har beställts, så att företaget kan jämföra efterfrågan med sitt sortiment. Produkt 501 förekommer visserligen på två orderrader, men i just den jämförelsen ska den bara räknas som en beställd produkt. Frågan gäller alltså *vilka produkter* som förekommer; antalet orderrader och antalet beställda kaffeförpackningar får vi undersöka separat.

För att uttrycka den skillnaden kan vi använda **mängder**. Vi börjar med produktnummer, eftersom det gör grundidén synlig utan att vi samtidigt behöver läsa en SQL-fråga. Därefter låter vi varje element innehålla flera uppgifter och kommer på så sätt tillbaka till relationerna i databasen.

## 10.1 En mängd beskriver vilka element som ingår

En mängd är en samling av åtskilda element. I vårt fall är elementen produktnummer, och vi skriver dem mellan klammerparenteser:

```text
B = {501, 502, 503}
```

Namnet `B` betecknar mängden av beställda produkter, så att 501 finns med betyder att produkten har beställts minst en gång. Eftersom mängden bara visar vilka produktnummer som förekommer kan vi däremot inte utläsa hur många gånger produkten beställts eller hur många förpackningar det gäller.

Om vi skriver `{503, 501, 502}` beskriver vi samma mängd. Ordningen har ingen betydelse, och att skriva 501 en gång till skulle inte lägga till ett nytt element. Det kan jämföras med en gästlista där frågan är vilka personer som är inbjudna: att samma person skrivs in två gånger innebär inte att ytterligare en person har bjudits in.

| Fråga om orderraderna i Nordic Brew | Svar | Vad räknas? |
| --- | ---: | --- |
| Hur många orderrader finns? | 4 | Varje registrerad rad |
| Hur många olika produkter förekommer? | 3 | Produktnummer: 501, 502 och 503 |
| Hur många förpackningar har beställts? | 7 | Summan av kvantiteterna 2 + 1 + 1 + 3 |

Skillnaderna beror på vad vi vill veta. Mängdbegreppet hjälper oss att vara tydliga med när upprepning ska sakna betydelse; det innebär inte att antalet upprepningar alltid är ointressant.

## 10.2 Två frågor ger två mängder

Anta nu att `A` innehåller produktnummer för produkter med listpris på minst 120 kronor, medan `B` fortfarande innehåller de produkter som någon har beställt:

```text
A = {501, 504}
B = {501, 502, 503}
```

Produkt 501 tillhör båda mängderna: den kostar minst 120 kronor och har beställts. Produkt 504 uppfyller bara prisvillkoret, medan 502 och 503 har beställts men kostar mindre än 120 kronor.

<figure class="figure">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Mängddiagram, rulla vid behov i sidled" style="--figure-width: 680px">
<img src="{{ '/assets/images/21-mangder.svg' | relative_url }}" alt="Mängd A innehåller 501 och 504. Mängd B innehåller 501, 502 och 503. Endast 501 finns i överlappet." width="680" height="300" loading="lazy" decoding="async">
</div>
  <figcaption><strong>Figur 10.1.</strong> Varje produktnummer placeras efter vilka villkor det uppfyller. Överlappet visar gemensamma element.</figcaption>
</figure>

Figuren är ett **Venn-diagram**. Här behöver vi inte tolka cirklarnas storlek som ett antal; deras uppgift är att visa medlemskap och överlapp. Med samma två mängder kan vi nu ställa tre olika frågor.

## 10.3 Union, snitt och differens

Om vi vill ha produkter som kostar minst 120 kronor **eller** har beställts använder vi **union**, skrivet `A ∪ B`. Alla element från båda mängderna kommer med, men varje element förekommer bara en gång. Därför blir resultatet `{501, 502, 503, 504}`.

Om produkten i stället ska uppfylla **båda** villkoren använder vi **snitt**, skrivet `A ∩ B`. Vi behåller då bara överlappet, vilket ger `{501}`.

En tredje fråga gäller produkter som kostar minst 120 kronor **men ännu inte har beställts**. Då tar vi **differensen** `A − B`: börja med A och ta bort de element som även finns i B. Resultatet blir `{504}`.

| Operation | Läs uttrycket som | Resultat |
| --- | --- | --- |
| `A ∪ B` | Finns i A eller B, även i båda | `{501, 502, 503, 504}` |
| `A ∩ B` | Finns i både A och B | `{501}` |
| `A − B` | Finns i A men inte i B | `{504}` |
| `B − A` | Finns i B men inte i A | `{502, 503}` |

De två sista raderna visar att differensens betydelse beror på vilken mängd vi utgår från: ”dyrare men inte beställda” är en annan fråga än ”beställda men inte dyrare”. För union och snitt spelar ordningen däremot ingen roll, eftersom samma element tas med även om A och B byter plats.

**Stanna upp:** Vad blir snittet om ingen produkt uppfyller båda villkoren?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

Resultatet är den **tomma mängden**, skriven `{}` eller `∅`. Det är fortfarande ett meningsfullt svar: ingen produkt uppfyller båda villkoren. Ett tomt resultat behöver alltså inte betyda att frågan är fel.
</details>

## 10.4 En relation innehåller hela rader

Hittills har ett element varit ett enda produktnummer. Vi kan också låta varje element beskriva en produkt med flera uppgifter:

| <code>ProductID</code> | <code>ProductName</code> | <code>ListPriceOre</code> |
| ---: | --- | ---: |
| 501 | Brew coffee 500 g | 12900 |
| 502 | Espresso blend 250 g | 8900 |
| 503 | Decaf coffee 250 g | 9900 |
| 504 | Winter blend 500 g | 14900 |

I relationsmodellen kallas en sådan rad en **tupel**. Läs exempelvis den första raden som en hel beskrivning: produkten med nummer 501 heter Brew coffee 500 g och har listpriset 12 900 öre. När vi samlar tupler som följer samma schema får vi en **relation**. Här har alltså varje tupel plats för samma tre slags uppgifter, även om värdena skiljer sig mellan produkterna.

Kolumnernas namn betecknar relationens **attribut**, medan ett attributs **domän** anger vilka värden det kan anta. För `ListPriceOre` behöver vi därför precisera både formen och betydelsen: ett icke-negativt heltal som anger priset i öre. Värdet 12900 ska då tolkas som 129 kronor, inte som ett produktnummer eller ett belopp i någon annan valuta.

Orden ger oss ett mer precist språk för något vi redan har arbetat med. Vi behöver fortfarande kunna säga vad varje rad betyder, men kan nu också beskriva relationens egenskaper: den har inga identiska tupler och ingen inbyggd ordning mellan tuplerna.

| Vardagligt språk i tabellbilderna | Relationsmodellens term |
| --- | --- |
| Tabellens radstruktur och innehåll | Relationsschema respektive relationens aktuella innehåll |
| Rad | Tupel |
| Namngiven kolumn | Attribut |
| Tillåtna slags värden | Domän |

Att två produkter har samma pris hindrar inte att båda finns med i relationen, eftersom raderna är identiska först om *alla* deras attributvärden är lika. Produktnumret skiljer därför produktraderna åt även om både namn och pris skulle råka överensstämma.

## 10.5 Samma form behövs när relationer kombineras

Union, snitt och differens kan även användas på relationer. Vi kan exempelvis kombinera relationen med de dyrare produkternas `ProductID` och relationen med beställda produkters `ProductID`. Varje rad innehåller då ett produktnummer i båda underlagen, precis som i Venn-diagrammet.

Det skulle däremot bli missvisande att kombinera produktnummer med ordernummer bara för att båda skrivs som heltal. En rad med värdet 501 skulle inte längre ha en entydig betydelse. När vi använder mängdoperationer på relationer måste attributen därför vara förenliga: samma antal attribut, motsvarande värdedomäner och en gemensam tolkning. Vid behov behöver attributen först väljas ut och ges passande namn.

Här finns en viktig kontrollfråga inför SQL: *betyder en rad samma sak i de båda underlag jag försöker kombinera?* Att ett verktyg accepterar frågan är inte tillräckligt för att svaret ska vara användbart.

## 10.6 Från mängder till frågor

En databasfråga behöver ofta göra mer än att kombinera två färdiga mängder. För att få fram A måste vi först välja de produkter som uppfyller prisvillkoret och därefter behålla produktnumret. Nästa kapitel beskriver sådana steg med **relationsalgebra**: operationer på relationer som ger nya relationer.

SQL låter oss senare uttrycka dessa frågor i ett databashanteringssystem, men följer inte relationsmodellen i alla avseenden. Om en kund har gjort två beställningar kan till exempel kundnumret komma med två gånger när en SQL-fråga hämtar kundnummer ur beställningarna. Den klassiska relationsalgebrans projektion ger i stället en mängd där samma kundnummer bara förekommer en gång.

SQL skiljer sig också från den klassiska relationsalgebran genom att tillåta `NULL` för saknade uppgifter och `ORDER BY` för sortering. Vi återkommer till båda när de behövs i konkreta frågor. Tills vidare är det framför allt skillnaden mellan en mängd och ett resultat som kan innehålla upprepningar vi behöver bära med oss.

## 10.7 Överföringsövning: två läsecirklar

**Arbetssätt:** resonera på papper; ingen databas behövs. Läsecirkel A har medlemmarna `{11, 12, 14}` och läsecirkel B har `{12, 13}`. Numren är föreningens medlemsnummer.

1. Vilka ska få en inbjudan om alla i minst en läsecirkel bjuds in? Varje person ska få en inbjudan.
2. Vilka deltar i båda läsecirklarna?
3. Vilka deltar i A men inte i B? Vad händer om riktningen byts?
4. Kan vi använda antalet element i unionen för att avgöra hur många deltaganden som har registrerats totalt?

<details class="answer" markdown="1">
<summary>Lösningsförslag med resonemang</summary>

1. Unionen är `{11, 12, 13, 14}`. Medlem 12 ingår bara en gång, trots att medlemsnumret finns i båda underlagen.
2. Snittet är `{12}`, eftersom medlem 12 är den enda som finns i båda läsecirklarna. Medlem 11 och 14 deltar bara i A, medan medlem 13 bara deltar i B; ingen av dem uppfyller därför villkoret att delta i båda.

3. `A − B` är `{11, 14}`, medan `B − A` är `{13}`. Den första riktningen hittar deltagare som enbart går i A, medan den andra hittar deltagare som enbart går i B. Medlem 12 tas bort i båda fallen eftersom personen finns i båda underlagen.

4. Nej. Unionen innehåller fyra olika medlemmar, men de båda cirklarna har sammanlagt fem deltaganden: tre i A och två i B. Medlem 12 bidrar till båda deltagandeantalen. Om varje deltagande ska följas behöver vi därför bevara kombinationen av medlemsnummer och läsecirkel, inte bara medlemsnumret.

</details>

## Kontrollfrågor

1. Förändras en mängd om elementen skrivs i en annan ordning?
2. Vad är skillnaden mellan snitt och differens?
3. Får två tupler i en relation ha samma produktnamn?
4. Varför bör produktnummer och ordernummer inte blandas i samma mängdoperation?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Nej. Mängderna `{501, 502, 503}` och `{503, 501, 502}` innehåller samma element och är därför samma mängd. Ordningen beskriver hur vi skriver upp mängden, inte en egenskap hos dess medlemskap. Att skriva 501 ytterligare en gång skulle inte heller lägga till en ny produkt.

2. Snittet behåller det som finns i båda mängderna. Differensen `A − B` börjar i stället med A och tar bort det som även finns i B. Med de dyrare produkterna i A och de beställda i B ger snittet produkt 501, medan differensen ger den ännu obeställda produkten 504. Riktningen spelar därför roll för differensen.

3. Ja. Två produkter kan ha samma namn och ändå vara olika tupler, exempelvis därför att deras `ProductID` skiljer sig åt. En relation förbjuder upprepning av identiska hela tupler, inte att enskilda attributvärden återkommer. Först när alla attributvärden sammanfaller beskriver raderna samma tupel.

4. Numren identifierar olika slags företeelser trots att båda skrivs som heltal. Om resultatet innehåller 501 behöver vi kunna avgöra om det betyder produkt 501 eller order 501. En meningsfull mängdoperation kräver därför inte bara förenlig form utan också att motsvarande kolumner har en gemensam tolkning.

</details>

## Sammanfattning

En mängd beskriver vilka element som ingår, utan dubbletter eller inbyggd ordning. När elementen är beskrivande rader med samma uppsättning attribut har vi en relation. Union, snitt och differens kombinerar förenliga relationer på olika sätt, men deras användbarhet avgörs fortfarande av frågan och av vad en rad betyder.