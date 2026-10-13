---
layout: default
track: grundspar
prerequisites: "Kapitel 19: lost update, dirty read och non-repeatable read."
focus: "Visa exakt var ett lås stoppar ett felaktigt förlopp."
title: 20. Samtidighetskontroll med lås
parent: Del III – Transaktioner och samtidighet
nav_order: 20
permalink: /docs/del-3-transaktioner/samtidighetskontroll-med-las/
description: Använd läs- och skrivlås för att analysera scheman, tvåfaslåsning och dödlägen.
keywords: [lås, serialiserbarhet, 2PL, S2PL, SS2PL, deadlock, dödläge]
---

# 20. Samtidighetskontroll med lås

{% include chapter_guide.html %}

I det förra kapitlet räknade B på ett gammalt saldo eftersom B hann läsa innan A var färdig. För att förebygga problemet behövs en regel som styr när läsningen får ske. Ett sätt är att låta transaktioner begära **lås** på de uppgifter de ska använda.

Ett lås fungerar i detta sammanhang som en rättighet att använda en viss uppgift, och det är databashanteringssystemet som samordnar dessa rättigheter. Om en transaktion begär en åtkomst som inte är förenlig med ett befintligt lås kan begäran därför inte beviljas direkt. Transaktionen kan då behöva vänta tills uppgiften blir tillgänglig eller avbrytas och senare försöka genomföra hela sitt arbete igen.

För att kunna följa samordningen steg för steg börjar vi med en förenklad modell där ett dataobjekt, exempelvis Nordic Brews lagersaldo för produkt 501, kan låsas separat. Modellen beskriver principen, medan verkliga DBHS kan låsa på andra nivåer eller kombinera lås med versionshantering. I båda fallen behöver systemet hantera samma grundfråga: vilka samtidiga åtkomster kan tillåtas utan att transaktionerna stör varandras avsedda arbete?

## 20.1 Seriellt och serialiserbart

Om A utför hela sitt arbete och avslutar det innan B börjar är förloppet **seriellt**. Med ett ursprungligt saldo på 100 hinner A då läsa 100, dra av 10 och godkänna saldot 90. När B därefter läser får B 90 som underlag och drar av 20, så att slutvärdet blir 70. Om B får börja blir mellanvärdet i stället 80, men A:s efterföljande uttag ger även då 70. Just dessa två uttag ger alltså samma slutsaldo i båda seriella ordningarna; det är inte en allmän regel för alla transaktioner.

Att alltid låta hela transaktioner arbeta en i taget skulle däremot begränsa samtidigheten även när de arbetar med helt olika uppgifter. Därför eftersträvar vi ofta ett förlopp där stegen får blandas men effekten motsvarar en tillåten seriell ordning. Ett sådant förlopp kallas **serialiserbart**. Överensstämmelsen gäller transaktionernas observationer och effekter, inte bara att ett enskilt slutsaldo råkar bli rätt.

## 20.2 Två slags lås

När en transaktion enbart ska läsa används ett **delat lås**, S-lås. Flera transaktioner kan då ha S-lås på samma objekt samtidigt, eftersom deras läsningar inte förändrar värdet. En transaktion som ska skriva behöver däremot ett **exklusivt lås**, X-lås. För att skrivningen ska kunna skyddas är det låset inte förenligt med någon annan transaktions S- eller X-lås på samma objekt.

| Lås som en annan transaktion redan har | Nytt S-lås | Nytt X-lås |
| --- | --- | --- |
| Inget | Beviljas | Beviljas |
| S | Beviljas | Vänta |
| X | Vänta | Vänta |

Tabellen gäller önskemål från **olika** transaktioner. En transaktion som redan har X-lås kan själv läsa och skriva det låsta objektet. Om ett önskemål måste vänta får vi inte låtsas att den efterföljande läsningen ändå har utförts: resten av transaktionens arbete beror på att låset faktiskt beviljas.

## 20.3 Förebygg en förlorad uppdatering

Vi återvänder till Nordic Brews två uttag. Här betecknar X lagersaldot för produkt 501, och vi vet att båda transaktionerna ska läsa och sedan ändra det. Bokstaven X i *X-lås* betyder exklusivt; ett X-lås kan alltså tas även på ett objekt som heter Y. I detta exempel begär de därför X-lås **före sin första läsning** och behåller det tills de är klara.

| Steg | A: ta ut 10 | B: ta ut 20 | Saldo |
| ---: | --- | --- | ---: |
| 1 | Får X-lås på X | | 100 |
| 2 | Läser 100 | | 100 |
| 3 | | Begär X-lås på X; väntar | 100 |
| 4 | Skriver 90 | Väntar | 90 |
| 5 | <code>COMMIT</code> och släpper låset | | 90 |
| 6 | | Får låset och läser 90 | 90 |
| 7 | | Skriver 70 | 70 |
| 8 | | <code>COMMIT</code> och släpper låset | 70 |

I steg 3 kommer B fram till den punkt där ett lås behövs för att arbetet ska kunna fortsätta. Eftersom A redan har ett oförenligt lås får B vänta utan att läsa saldot. Först när A har godkänt sitt uttag och släppt låset kan B hämta 90 och räkna vidare från det. Ett skrivlås som togs först efter en tidigare läsning av 100 skulle däremot komma för sent för att lösa just detta problem: låset skyddar åtkomsten, men räknar inte om en redan gjord beräkning från ett gammalt underlag.

**Fyll i:** Om B i stället får X-låset först, vilka två saldon skriver B och A?

<details class="answer" markdown="1">
<summary>Visa svar</summary>

Om B får börja skriver den 80 och godkänner sitt uttag innan A läser. A räknar då från 80 och skriver 70, så båda uttagen ingår även i denna ordning. Exemplet visar att den avgörande frågan är vilket underlag den andra transaktionen får läsa, inte vilken av de två som alltid måste börja.
</details>

## 20.4 Tvåfaslåsning styr även när lås får släppas

Att ta lås är inte tillräckligt om de släpps och återtas utan någon regel. **Tvåfaslåsning**, 2PL (*two-phase locking*), delar därför transaktionens låsbeteende i två faser:

1. Under den växande fasen får transaktionen skaffa lås men inte släppa något.
2. Efter den första upplåsningen är den i den krympande fasen: den får släppa lås men inte skaffa nya.

Så länge inget lås har släppts kan transaktionen fortsätta att skaffa de lås den behöver. Den **första upplåsningen** blir därför en gräns: efter den får transaktionen bara lämna ifrån sig lås, inte hämta nya. Två faser beskriver denna ordning mellan låsning och upplåsning, inte ett krav på två SQL-satser eller två transaktioner.

När alla åtkomster skyddas med rätt slags lås och alla transaktioner följer tvåfasregeln blir schemat konfliktserialiserbart. Det innebär att ordningen mellan åtkomster som kan påverka varandra motsvarar en seriell ordning. Grundvarianten kan dock släppa ett skrivlås före `COMMIT`, och hindrar därför inte i sig att någon annan läser en ännu inte godkänd skrivning. De striktare varianterna nedan lägger till regler för just detta.

| Protokoll | Vad gäller utöver rätt lås för varje åtkomst? |
| --- | --- |
| **2PL** | Inget nytt lås får tas efter första upplåsningen. |
| **Strikt 2PL, S2PL** | Tvåfasregeln gäller och alla X-lås behålls till <code>COMMIT</code> eller avbrott. |
| **Starkt strikt 2PL, SS2PL** | Alla S- och X-lås behålls till <code>COMMIT</code> eller avbrott. Kallas också rigorös tvåfaslåsning. |

I vissa texter används namnen något annorlunda; tabellen anger de definitioner som används här. SS2PL är enklast att följa i våra första scheman eftersom upplåsningen alltid sker sist. S2PL skyddar ofärdiga skrivningar genom att X-låsen hålls kvar, medan läslås kan släppas tidigare om tvåfasregeln fortfarande följs.

<figure class="figure" id="figur-20-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 20.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/39-tva-faser.svg' | relative_url }}" alt="Tvåfaslåsning tillåter nya lås fram till den första upplåsningen. Därefter får endast lås släppas." width="900" height="360" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 20.1.</strong> Faserna gäller ordningen mellan låshändelser. De säger inte att en transaktion måste innehålla exakt två SQL-satser. <a href="{{ '/assets/images/39-tva-faser.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 20.5 Läs två objekt utan att blanda överföringens sidor

Vid kontoöverföringen behöver skrivaren B låsa båda kontona med X-lås. Sammanställaren A behöver läsa båda och kan använda S-lås. Om båda följer SS2PL kan A hålla sina läslås tills summan är beräknad. B får då vänta med oförenliga lås, så att A inte blandar konto 1 före överföringen med konto 2 efter den.

För rapporten räcker det alltså inte att varje saldo var för sig läses på ett tillåtet sätt. De två värdena behöver också höra till ett sammanhängande läge i förhållande till överföringen. Genom att behålla det första läslåset medan det andra kontot läses kan A hindra B från att förändra den ena sidan av överföringen mellan rapportens läsningar. Skyddet följer då rapportens hela arbete, inte bara en isolerad läsning.

## 20.6 Dödläge: båda väntar på varandra

Låsning kan skapa ett nytt problem. Anta att A och B behöver ändra objekten X och Y, men begär dem i olika ordning:

| Steg | A | B |
| ---: | --- | --- |
| 1 | Får X-lås på objekt X | |
| 2 | | Får X-lås på objekt Y |
| 3 | Begär X-lås på Y; väntar på B | |
| 4 | | Begär X-lås på X; väntar på A |

Nu kan ingen av transaktionerna nå sitt avslut, eftersom båda väntar på ett lås som den andra håller. Denna cirkulära väntan kallas ett **dödläge**, eller *deadlock*. Ett DBHS kan exempelvis upptäcka väntcykeln och avbryta en av transaktionerna, så att dess förändringar återställs och dess lås släpps. Då kan den andra bli klar, varefter den avbrutna verksamhetsoperationen får prövas på nytt från ett korrekt utgångsläge.

Om alla transaktioner kan begära låsen i en gemensam ordning, exempelvis X före Y, förebyggs just denna typ av cykel. En annan möjlig källa till dödläge är att två transaktioner först tar S-lås och sedan båda försöker uppgradera till X. Därför begärde läs-och-ändra-exemplet ovan X-lås redan från början.

<figure class="figure" id="figur-20-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 20.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/40-dodlage.svg' | relative_url }}" alt="A håller ett lås på X och väntar på Y. B håller ett lås på Y och väntar på X. Pilarna bildar en väntcykel." width="900" height="460" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 20.2.</strong> Pilarna betyder ”väntar på ett lås som den andra håller”. Systemet behöver bryta cykeln för att arbetet ska komma vidare. <a href="{{ '/assets/images/40-dodlage.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 20.7 Arbetsgång när du granskar ett schema

Börja med att skriva vad varje transaktion avser att åstadkomma och vilket resultat en seriell körning skulle ge. Lägg sedan in låsbegäran före varje berörd åtkomst. När en begäran kolliderar med ett befintligt lås markerar du väntan och fortsätter endast med transaktioner som faktiskt får arbeta. Avsluta genom att kontrollera både slutvärdena och att vald låsregel har följts.

**Resonera:** En transaktion får S-lås på X, läser X, släpper X och begär sedan S-lås på Y. Följer den 2PL? Gör det någon skillnad att den aldrig skriver?

<details class="answer" markdown="1">
<summary>Visa lösningsförslag</summary>

Förloppet följer inte 2PL, eftersom transaktionen begär låset på Y efter att ha släppt sitt första lås. Tvåfasregeln gäller även transaktioner som bara läser; avsaknaden av skrivningar gör därför inte denna ordning tillåten. En möjlig lösning är att ta båda läslåsen innan något släpps. Med SS2PL skulle transaktionen dessutom behålla dem tills hela arbetet avslutas.
</details>

## 20.8 Öva stegvis: tre transaktioner och två objekt

Ett större schema behöver inte kräva en ny metod. Vi följer fortfarande ett läsvärde och en låsbegäran i taget, men håller nu isär två objekt. Anta att `X = 100` och `Y = 60`. A ska minska X med 10, B ska minska X med 20 och C ska minska Y med 5. X och Y kan exempelvis vara lagersaldon för två olika produkter.

Utan samordning skulle följande kunna inträffa i vår förenklade modell:

| Steg | A | B | C |
| ---: | --- | --- | --- |
| 1 | Läser X = 100 | | |
| 2 | | Läser X = 100 | |
| 3 | | | Läser Y = 60 |
| 4 | Skriver X = 90 | | |
| 5 | | | Skriver Y = 55 |
| 6 | <code>COMMIT</code> | | |
| 7 | | Skriver X = 80 | |
| 8 | | <code>COMMIT</code> | |
| 9 | | | <code>COMMIT</code> |

**Börja med värdena:** Vilka slutvärden ger schemat, och vilka skulle vi få om alla avsedda minskningar fanns med? Peka sedan ut det lässteg som måste skjutas fram för att undvika felet.

<details class="answer" markdown="1">
<summary>Kontrollera analysen innan du lägger till lås</summary>

Schemat slutar med X = 80 och Y = 55. A:s minskning har skrivits över eftersom B använder sitt gamla läsvärde från steg 2. Med båda minskningarna av X ska resultatet i stället vara 70. C:s förändring av Y påverkas inte av just den konflikten.

Om A ska arbeta först behöver B:s läsning av X vänta tills A har avslutat sin transaktion. Att bara skjuta upp B:s skrivning hjälper inte: den beräknas fortfarande från 100 om B inte läser ett aktuellt värde.
</details>

**Lägg nu till lås:** Använd SS2PL. Låt A få sitt X-lås på objekt X först och låt varje transaktion begära ett X-lås före sin första läsning. Måste C vänta när B väntar? Skriv ett möjligt schema innan du öppnar svaret.

<details class="answer" markdown="1">
<summary>Visa ett möjligt skyddat förlopp</summary>

| Steg | A | B | C |
| ---: | --- | --- | --- |
| 1 | Får X-lås på X; läser 100 | | |
| 2 | | Begär X-lås på X; väntar | |
| 3 | | Väntar | Får X-lås på Y; läser 60 |
| 4 | Skriver X = 90 | Väntar | |
| 5 | | Väntar | Skriver Y = 55 |
| 6 | <code>COMMIT</code>; släpper X | | |
| 7 | | Får låset på X; läser 90 | |
| 8 | | | <code>COMMIT</code>; släpper Y |
| 9 | | Skriver X = 70 | |
| 10 | | <code>COMMIT</code>; släpper X | |

C kan fortsätta eftersom den använder ett annat objekt. Slutvärdena blir X = 70 och Y = 55, samtidigt som arbetet med Y får överlappa arbetet med X. Alla lås behålls till respektive <code>COMMIT</code>, så förloppet följer SS2PL. Flera andra ordningar är också möjliga; det avgörande är vilka åtkomster som faktiskt står i konflikt.
</details>

## 20.9 Orientering: läsning med versioner

Låsövningarna fortsätter i **20.10 och 20.11**. Orienteringen nedan kan läsas efter dem: den jämför den inlärda låsmodellen med en annan princip och behövs inte för att följa de två fortsatta förloppen.

<details class="extension" markdown="1">
<summary>Öppna orienteringen om versioner efter låsövningarna</summary>

Anta att Nordic Brew vill läsa en försäljningssammanställning medan nya order registreras. Ett DBHS kan då behålla flera versioner av uppgifter, så att läsaren använder en äldre godkänd bild samtidigt som skrivaren arbetar med en ny. Denna princip kallas **MVCC**, *Multi-Version Concurrency Control*.

Det är viktigt att skilja metoden från löftet till läsaren. MVCC beskriver att versioner används, men säger inte ensamt om varje fråga får en ny bild eller om samma bild används under hela transaktionen. Den senare typen av stabil bild är central i **snapshot isolation**, där samtidiga skrivkonflikter också behöver hanteras.

| Perspektiv | Frågan det besvarar |
| --- | --- |
| MVCC | Hur kan flera versioner hjälpa systemet att samordna åtkomst? |
| Isoleringsgaranti, exempelvis snapshot isolation | Vilka uppgifter får transaktionen se, och vilka konflikter måste stoppas? |
| Serialiserbarhet | Motsvarar transaktionernas observationer och effekter en seriell ordning? |

Versionshantering innebär alltså inte att alla lås försvinner eller att alla samtidighetsproblem automatiskt löses. Ett system kan kombinera versioner med lås och avbryta transaktioner vid konflikter. I låsövningarna använder vi fortfarande de uttryckliga låsregler som anges där.

<details class="extension" markdown="1">
<summary>Fördjupning: en stabil ögonblicksbild räcker inte för varje regel</summary>

Anta att två lageranställda, Amina och Leo, båda är markerade som i tjänst. Regeln är att minst en måste vara kvar. Två transaktioner läser samma bild där båda är i tjänst. Den ena markerar Amina som ledig eftersom Leo finns kvar; den andra markerar Leo som ledig eftersom Amina finns kvar.

De ändrar olika rader, så en kontroll som enbart upptäcker samtidiga ändringar av samma rad behöver inte stoppa dem. Båda kan då avslutas och lämna lagret utan bemanning. Detta brukar kallas *write skew* och visar varför snapshot isolation inte generellt innebär serialiserbarhet. I en seriell körning skulle den andra transaktionen se att bara en person återstår och inte godkänna ytterligare ledighet.

Exakta isoleringsnivåer och namn varierar mellan DBHS. PostgreSQL beskriver exempelvis sin Repeatable Read-nivå som snapshot isolation och visar varför starkare skydd ibland behövs i [dokumentationen om transaktionsisolering](https://www.postgresql.org/docs/current/transaction-iso.html). SQLite beskriver sitt eget beteende i [dokumentationen om isolering](https://www.sqlite.org/isolation.html). Dessa produktdetaljer behövs inte för att lösa bokens abstrakta låsscheman.

Tidsstämpelbaserade protokoll är ytterligare en möjlig princip. De använder en bestämd ordning mellan transaktioner för att avgöra vilka läsningar och skrivningar som får ske. För att analysera ett sådant protokoll behövs dess uttryckliga regler; det går inte att ersätta låssymbolerna med tidsstämplar och anta att samma analys gäller.
</details>

</details>

## 20.10 När en transaktion behöver båda objekten

I övning 20.8 arbetade den tredje transaktionen med en separat uppgift. Nu låter vi en beställning beröra båda produkterna, så att vi måste följa hur konflikterna hänger ihop. Analysen görs med schematabeller; du ska inte försöka återskapa det oskyddade förloppet i SQLite.

Nordic Brew har X = 100 förpackningar av en produkt och Y = 60 av en annan. A tar ut 10 av X och 5 av Y. B tar ut 20 av X, medan C levererar 8 av Y. Varje READ skapar ett lokalt värde som transaktionen senare räknar på. Följande schema visar skrivningarnas resultat, men varje resultat behöver härledas från respektive tidigare läsning:

| Steg | A | B | C | Databas X, Y |
| ---: | --- | --- | --- | --- |
| 1 | Läser Y = 60 | | | 100, 60 |
| 2 | | Läser X = 100 | | 100, 60 |
| 3 | | Skriver X = 80 | | 80, 60 |
| 4 | | <code>COMMIT</code> | | 80, 60 |
| 5 | | | Läser Y = 60 | 80, 60 |
| 6 | | | Skriver Y = 68 | 80, 68 |
| 7 | Läser X = 80 | | | 80, 68 |
| 8 | Beräknar lokalt X = 70 och Y = 55 | | | 80, 68 |
| 9 | | | <code>COMMIT</code> | 80, 68 |
| 10 | Skriver Y = 55 | | | 80, 55 |
| 11 | Skriver X = 70 | | | 70, 55 |
| 12 | <code>COMMIT</code> | | | 70, 55 |

**Stanna först vid värdena:** vilket slutsaldo borde Y få när både uttaget och leveransen ingår? Vilken skrivning går förlorad, och vilken tidigare läsning ligger bakom felet?

<details class="answer" markdown="1">
<summary>Visa diagnosen innan du inför lås</summary>

Y borde bli 60 − 5 + 8 = 63. I steg 10 ersätter A värdet 68 med 55, beräknat från läsningen av 60 i steg 1. C:s leverans har därmed gått förlorad. X blir däremot rätt, 100 − 20 − 10 = 70, eftersom A läser B:s godkända värde. Ett schema kan alltså hantera en uppgift korrekt och ändå förlora en ändring i en annan.
</details>

Använd nu SS2PL för alla tre transaktionerna och begär X-lås före första läsningen av ett objekt som ska ändras. Låt A få Y först och låt B därefter arbeta med X. Skriv ett möjligt fullständigt schema. Behåll A:s läsning av Y före läsningen av X, men flytta fram blockerade transaktioners senare steg.

<details class="answer" markdown="1">
<summary>Visa ett skyddat förlopp och förklaringen till väntan</summary>

| Steg | A | B | C | Databas X, Y |
| ---: | --- | --- | --- | --- |
| 1 | Får X-lås på Y; läser 60 | | | 100, 60 |
| 2 | | Får X-lås på X; läser 100 | | 100, 60 |
| 3 | | Skriver X = 80 | | 80, 60 |
| 4 | | <code>COMMIT</code>; släpper X | | 80, 60 |
| 5 | | | Begär X-lås på Y; väntar | 80, 60 |
| 6 | Får X-lås på X; läser 80 | | Väntar | 80, 60 |
| 7 | Beräknar lokalt X = 70 och Y = 55 | | Väntar | 80, 60 |
| 8 | Skriver Y = 55 | | Väntar | 80, 55 |
| 9 | Skriver X = 70 | | Väntar | 70, 55 |
| 10 | <code>COMMIT</code>; släpper båda låsen | | | 70, 55 |
| 11 | | | Får X-lås på Y; läser 55 | 70, 55 |
| 12 | | | Skriver Y = 63 | 70, 63 |
| 13 | | | <code>COMMIT</code>; släpper Y | 70, 63 |

C läser nu 55 och räknar därför med A:s uttag innan leveransen läggs till. B kunde arbeta medan A höll Y, eftersom B bara behövde X. Alla lås behålls till respektive avslut, och observationerna och effekterna motsvarar den seriella ordningen B, A, C. Det är alltså inte nödvändigt att förbjuda varje överlappning.

Om C hade fått läsa 60 före väntan skulle ett senare skrivlås inte räcka: det lokala värdet skulle redan vara föråldrat. I det skyddade schemat är det därför själva läsningen som skjuts fram.
</details>

## 20.11 Öva själv: en rapport över två konton

Ett annat system har saldona X = 40 och Y = 10. Rapporttransaktionen A läser båda och summerar. B flyttar 5 från X till Y, och C tar därefter ut 3 från X. Underlaget nedan använder samma förenklade modell som tidigare.

| Steg | A | B | C |
| ---: | --- | --- | --- |
| 1 | Läser X = 40 | | |
| 2 | | Läser X = 40 och Y = 10 | |
| 3 | | Skriver X = 35 | |
| 4 | | Skriver Y = 15 | |
| 5 | | <code>COMMIT</code> | |
| 6 | | | Läser X = 35 |
| 7 | | | Skriver X = 32 |
| 8 | | | <code>COMMIT</code> |
| 9 | Läser Y = 15 och summerar | | |
| 10 | <code>COMMIT</code> | | |

1. Vad visar rapporten? Vilka totalsaldon kan förekomma före och efter hela, godkända verksamhetsoperationer i detta exempel?
2. Namnge och förklara problemet. Skilj det från att rapporten skulle ha läst en ofärdig skrivning.
3. Konstruera ett SS2PL-schema där A får sitt första S-lås före B. Ange båda kontonas lås, väntan och vilket värde varje transaktion läser. Behåll B före C i den skyddade ordningen.
4. Kontrollera både rapportens svar och databasens slutvärden. Varför räcker inte slutvärdena ensamma för att granska hela förloppet?

<details class="answer" markdown="1">
<summary>Visa ett fullständigt lösningsförslag</summary>

A får summan 40 + 15 = 55, men den summan motsvarar varken tillståndet före eller efter någon av de färdiga förändringarna. Före överföringen är totalsaldot 50 och efter överföringen fortfarande 50; först C:s uttag minskar det till 47.

Rapporten är därför inkonsistent: värdet på X kommer från tiden före B:s överföring, medan värdet på Y kommer från tiden efter B:s `COMMIT`. Ingen av läsningarna är smutsig, men tillsammans bildar de ändå en missvisande helhet.

Ett möjligt skyddat förlopp är:

| Steg | A | B | C |
| ---: | --- | --- | --- |
| 1 | Får S-lås på X; läser 40 | | |
| 2 | | Begär X-lås på X; väntar | |
| 3 | | Väntar | Begär X-lås på X; väntar |
| 4 | Får S-lås på Y; läser 10 | Väntar | Väntar |
| 5 | Summerar 50; <code>COMMIT</code>; släpper X och Y | | |
| 6 | | Får X-lås på X och Y; läser 40 och 10 | Väntar |
| 7 | | Skriver X = 35 och sedan Y = 15 | Väntar |
| 8 | | <code>COMMIT</code>; släpper X och Y | |
| 9 | | | Får X-lås på X; läser 35 |
| 10 | | | Skriver X = 32; <code>COMMIT</code>; släpper X |

Schemat väljer att bevilja B:s väntande lås före C:s när A är klar. Den ordningen är angiven i uppgiften; SS2PL i sig bestämmer inte en allmän köpolicy. Rapporten får 50 och slutvärdena blir X = 32 och Y = 15. De senare var korrekta även i det oskyddade schemat, men där hade rapporten ändå fått 55. Därför behöver både observationer och förändringar granskas.
</details>


## Kontrollfrågor

1. Kan två olika transaktioner ha S-lås på samma objekt samtidigt?
2. Varför måste B vänta före sin läsning i avsnitt 20.3?
3. Vad markerar övergången mellan faserna i 2PL?
4. Vad skiljer S2PL och SS2PL enligt kapitlets definitioner?
5. Betyder ett dödläge att låsningens skydd mot felaktig samtidighet har slutat fungera?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Ja. I den förenklade modellen är två S-lås från olika transaktioner förenliga, eftersom båda bara ger rätt att läsa. Om någon av dem vill skriva behövs däremot ett X-lås, som inte är förenligt med den andras S-lås på samma objekt. Vi behöver därför hålla isär att flera får läsa och att någon får förändra underlaget.

2. B:s minskning ska bygga på saldot efter att A:s uttag har genomförts. När låset stoppar B före läsningen hämtar B senare 90 och skriver 70. Om B redan hade läst 100 skulle ett lås precis före skrivningen inte automatiskt ändra den lokala beräkningen: B kunde fortfarande skriva 80 och tränga undan A:s effekt.

3. Den första upplåsningen markerar övergången från den växande till den krympande fasen. Före den får nya lås tas, men inga släppas; efter den får lås släppas, men inga nya tas. En transaktion som släpper låset på X och sedan begär ett nytt på Y bryter därför mot 2PL, även om den bara läser.

4. Båda följer tvåfasregeln, men S2PL kräver att alla X-lås behålls till transaktionens avslut, medan SS2PL behåller både S- och X-lås till dess. Med S2PL kan ett läslås alltså släppas tidigare om inga nya lås därefter tas. Definitionerna är viktiga när ett schema granskas, eftersom orden ”strikt” används lite olika i olika texter.

5. Nej. Ett dödläge innebär att transaktionerna hindrar varandra från att komma vidare genom att vänta på lås som den andra håller. Skyddet kan alltså fortfarande stoppa oförenliga åtkomster samtidigt som framdriften har stannat. Systemet behöver bryta väntcykeln, exempelvis genom att avbryta och återställa en transaktion så att dess lås kan släppas.

</details>

## Sammanfattning

Lås kan göra att en transaktion måste vänta innan den läser ett värde som den senare ska använda. Skyddet beror både på vilka lås som tas och på när de släpps, vilket tvåfaslåsning gör till en uttrycklig regel. Samma skydd kan skapa dödlägen som DBHS behöver hantera. Versionshantering erbjuder andra sätt att samordna läsning och skrivning, men isoleringsgarantierna måste fortfarande anges.