---
layout: default
track: grundspar
prerequisites: "Kapitel 18: transaktionens början, skrivningar och avslut."
focus: "Följ lokala läsvärden, skrivna värden och <code>COMMIT</code> var för sig."
title: 19. Samtidighet och transaktionsproblem
parent: Del III – Transaktioner och samtidighet
nav_order: 19
permalink: /docs/del-3-transaktioner/samtidighet-och-transaktionsproblem/
description: Läs transaktionsscheman stegvis och skilj förlorad uppdatering, smutsig läsning och förändrade läsresultat åt.
keywords: [transaktionsschema, lost update, dirty read, non-repeatable read, inkonsistent analys]
transaction_lab: true
---

# 19. Samtidighet och transaktionsproblem

{% include chapter_guide.html %}

När två anställda hos Nordic Brew arbetar med samma lagersaldo kan båda hinna läsa det innan någon av dem är klar. Varje person kan då räkna rätt utifrån sin egen skärm och ändå bidra till ett felaktigt slutresultat. För att förstå varför behöver vi följa ordningen mellan deras läsningar och skrivningar.

Det gör vi med **transaktionsscheman**: tabeller där varje steg visar vad en transaktion gör. Schemat beskriver ett tänkbart förlopp, inte ett löfte om att ett visst DBHS tillåter det. Ett fungerande system kan tvärtom stoppa just det problem som schemat illustrerar.

<aside class="practice-guide" markdown="1">
**Resonera direkt här:** scheman, frågor och stegvis visning innehåller hela underlaget. Ingen SQL-klient behövs. Den stegvisa visningen är en begreppsmodell, inte en SQLite-databas. Tabellerna nedan finns kvar även utan JavaScript.
</aside>

## 19.1 Skilj läst värde från databasvärde

Vi följer lagersaldot för produkt 501, som börjar på 100 förpackningar. För att göra samtidigheten lättare att följa visar schemana bara läsningar och skrivningar av saldot; leveransposterna från föregående kapitel lämnas utanför just denna analys. Transaktion A läser saldot för att registrera ett uttag av 10 enheter. Efter läsningen har A ett eget, lokalt läsvärde: 100. Det ändras inte automatiskt bara för att någon annan senare skriver ett nytt saldo till databasen.

För att följa schemat behöver vi skilja på att läsa, skriva och godkänna en förändring. Vid **läsning** hämtar transaktionen ett synligt värde till sitt eget arbete, medan en **skrivning** för över ett nytt värde till databasens pågående tillstånd. Först genom **<code>COMMIT</code>** godkänns transaktionens förändringar. En annan transaktions möjligheter att se en skrivning beror därför på vilka skyddsregler systemet använder.

I våra scheman betyder en tom cell att transaktionen inte gör något på just det steget. Vi räknar uppifrån och ned, en rad i taget. <code>BEGIN</code> utelämnas i tabellerna för överskådlighet: varje transaktion antas ha påbörjats före sitt första läs- eller skrivsteg, och upprepade läsningar som anges inom samma transaktion hör till samma pågående arbete.

## 19.2 Förlorad uppdatering: två rätta beräkningar ger fel saldo

A ska ta ut 10 enheter och B ska ta ut 20. Om båda uttagen blir genomförda ska det återstå 100 − 10 − 20 = 70. Följ nu vad som händer om båda räknar utifrån det ursprungliga saldot:

| Steg | Transaktion A | Transaktion B | Senast skrivet saldo |
| ---: | --- | --- | ---: |
| 0 | | | 100 |
| 1 | Läser 100 till sitt lokala värde | | 100 |
| 2 | | Läser 100 till sitt lokala värde | 100 |
| 3 | Skriver 100 − 10 = 90 | | 90, ännu inte godkänt |
| 4 | <code>COMMIT</code> | | 90 |
| 5 | | Skriver 100 − 20 = 80 | 80, ännu inte godkänt |
| 6 | | <code>COMMIT</code> | 80 |

När B till slut skriver utgår beräkningen fortfarande från det egna läsvärdet 100, trots att A redan har minskat saldot. B skriver därför 80 och ersätter därmed även effekten av A:s uttag, som skulle ha gett slutvärdet 70 tillsammans med B:s uttag. Det är denna bortskrivna förändring som kallas **förlorad uppdatering**, eller *lost update*.

Båda transaktionerna kan alltså ha en korrekt gräns mellan `BEGIN` och `COMMIT` och ändå ge ett felaktigt gemensamt resultat. Orsaken är att läsningarna och skrivningarna överlappar på ett sätt som gör B:s underlag inaktuellt. För att förebygga förlusten behöver vi samordna åtkomsten, inte bara lägga till ytterligare ett `COMMIT`.

<figure class="figure" id="figur-19-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 19.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/37-lokalt-varde.svg' | relative_url }}" alt="B behåller det lästa värdet 100 när A godkänner ett nytt saldo på 90. B:s senare beräkning använder därför gammalt underlag." width="900" height="495" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 19.1.</strong> B:s lokala kopia ändras inte när A skriver. Bilden sammanfattar schemat i avsnitt 19.2. <a href="{{ '/assets/images/37-lokalt-varde.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 19.3 Smutsig läsning: någon använder ett värde som dras tillbaka

Anta i stället att A skriver saldot 90 men ännu inte vet om uttaget kan genomföras. B läser detta värde, varefter A avbryter:

| Steg | Transaktion A | Transaktion B | Vad behöver vi uppmärksamma? |
| ---: | --- | --- | --- |
| 1 | Skriver 90 | | A har inte godkänt förändringen. |
| 2 | | Läser 90 | B använder A:s ofärdiga värde. |
| 3 | <code>ROLLBACK</code> | | A:s förändring dras tillbaka; saldot återgår till 100. |

B har gjort en **smutsig läsning**, eller *dirty read*. Problemet uppstår redan när B tillåts läsa en annan transaktions icke-godkända skrivning. Att A sedan avbryter gör följden särskilt tydlig: B kan ha fattat ett beslut utifrån något som aldrig blev en godkänd förändring.

I båda fallen kan en transaktion få ett olämpligt underlag, men problemen uppstår på olika sätt. Vid *dirty read* är felet att B får läsa A:s skrivning innan A har godkänt den; B kan alltså använda något som senare dras tillbaka. Vid *lost update* kan B däremot ha läst ett helt godkänt värde, som 100 i föregående exempel. Felet visar sig då när B:s senare skrivning tränger undan effekten av A:s förändring. Vi behöver därför granska både värdets status vid läsningen och vad en senare skrivning ersätter.

## 19.4 Samma rad ger olika svar

Anta nu att A läser 100, fortsätter med annat arbete och senare läser samma saldo igen. Under tiden ändrar B saldot till 80 och godkänner sin förändring:

| Steg | Transaktion A | Transaktion B |
| ---: | --- | --- |
| 1 | Läser 100 | |
| 2 | | Skriver 80 |
| 3 | | <code>COMMIT</code> |
| 4 | Läser 80 inom samma transaktion | |

Detta är en **icke upprepbar läsning**, eller *non-repeatable read*. A får olika svar vid två läsningar av samma uppgift inom sin transaktion. Inget smutsigt värde behöver ha lästs, eftersom B godkände sin förändring före A:s andra läsning. Frågan är i stället om A:s arbete behöver en stabil bild under hela förloppet.

## 19.5 En sammanställning kan blanda två tidpunkter

Lagerexemplet visade problem med en enda uppgift. För att undersöka en sammanställning återvänder vi till de två kontona i föregående kapitels överföringsövning. A ska beräkna deras summa, samtidigt som B för över 200 kronor. B gör överföringen korrekt som en enhet; problemet uppstår i hur A:s läsningar placeras runt den.

| Steg | Transaktion A: summera | Transaktion B: överföra | Konton efter steget |
| ---: | --- | --- | --- |
| 0 | | | 1000 och 500, godkänt |
| 1 | Läser konto 1 = 1000 | | 1000 och 500 |
| 2 | | Skriver konto 1 = 800 och konto 2 = 700 | 800 och 700, ännu inte godkänt |
| 3 | | <code>COMMIT</code> | 800 och 700, godkänt |
| 4 | Läser konto 2 = 700 | | 800 och 700 |
| 5 | Beräknar 1000 + 700 = 1700 | | 800 och 700 |

B:s två skrivningar visas på samma rad i schemat eftersom A inte läser mellan dem i just detta förlopp. Det skyddar dock inte A:s sammanställning: A har redan hämtat konto 1:s gamla saldo 1000 när B genomför överföringen. När A sedan hämtar konto 2 får den det nya saldot 700. A:s lokala underlag består därför av värden från var sin sida om en och samma överföring, trots att båda var godkända när de lästes.

Summan var 1500 både före och efter överföringen, men A har blandat ett gammalt och ett nytt värde. Det kallas här **inkonsistent analys**. Exemplet visar varför vi behöver granska flera relaterade uppgifter tillsammans, även när varje enskild läsning gäller ett godkänt värde.

<figure class="figure" id="figur-19-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 19.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/38-blandade-tidpunkter.svg' | relative_url }}" alt="Rapporten väljer konto 1:s saldo före överföringen och konto 2:s saldo efter. Den blandade summan 1700 förekommer inte i något av de två godkända tillstånden." width="900" height="430" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 19.2.</strong> Värdena är godkända var för sig, men kommer från olika tidpunkter. Därför kan sammanställningen bli inkonsistent utan någon smutsig läsning. <a href="{{ '/assets/images/38-blandade-tidpunkter.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 19.6 Följ förloppen ett steg i taget

Välj ett förlopp i rutan. Tabellen visar hela schemat med samma kolumner som tidigare, medan den markerade raden anger hur långt visningen har kommit. Följ särskilt B:s lokala läsvärde och jämför det med det senast skrivna lagersaldot. De behöver inte vara lika. Klicka på Nästa steg för att följa vad varje händelse förändrar.

{% include transaction_lab.html %}

I det sista alternativet får A ensamrätt till saldot innan någon av transaktionerna läser. När B försöker komma åt samma uppgift måste B därför vänta, och hämtar sitt läsvärde först efter att A har godkänt uttaget. Då är underlaget 90 och B:s beräkning ger 90 − 20 = 70. Skillnaden mot det felaktiga förloppet är alltså inte själva subtraktionen, utan när B tillåts skaffa det värde som subtraktionen bygger på. Nästa kapitel förklarar låsreglerna som gör denna väntan möjlig.

## 19.7 Öva och motivera diagnosen

**Arbetssätt:** resonera med tabellen; ingen installation behövs. En förening räknar föremål i sitt förråd. Det registrerade antalet börjar på 50, A ska lägga till 5 och B ska lägga till 7. Vi byter därmed verksamhet men behåller samma problem med lokala läsvärden.

| Steg | Transaktion A | Transaktion B | Senast skrivet antal |
| ---: | --- | --- | --- |
| 0 | | | 50, godkänt |
| 1 | Läser 50 | | 50 |
| 2 | | Läser 50 | 50 |
| 3 | Skriver 55 | | 55, ännu inte godkänt |
| 4 | <code>COMMIT</code> | | 55, godkänt |
| 5 | | Skriver 57 | 57, ännu inte godkänt |
| 6 | | <code>COMMIT</code> | 57, godkänt |

1. Vilket slutvärde får schemat, och vilket slutvärde skulle båda ökningarna ge?
2. Vilken av de två läsningarna behöver ske senare för att förhindra just detta problem?
3. Finns det en dirty read i det beskrivna förloppet? Hänvisa till ett konkret steg.

<details class="answer" markdown="1">
<summary>Visa ett stegvis resonemang</summary>

1. Schemat ger 57 eftersom B räknar från sitt lokala 50. Båda ökningarna tillsammans skulle ge 62. A:s ökning har trängts undan.
2. Exempelvis kan B behöva vänta med sin läsning tills A är färdig. Då läser B 55 och skriver 62. Det räcker inte att bara senarelägga B:s skrivning om den fortfarande bygger på 50.
3. Nej. B läser det ursprungliga godkända värdet 50 före A:s skrivning. Det här är en lost update, inte en läsning av A:s ofärdiga värde.
</details>

Pröva därefter ett prisexempel, där båda A:s läsningar ingår i samma transaktion:

| Steg | Transaktion A | Transaktion B |
| ---: | --- | --- |
| 1 | Läser priset 90 | |
| 2 | | Skriver priset 95 |
| 3 | | <code>COMMIT</code> |
| 4 | Läser priset 95 | |

Vilket problem ser vi, och vilket steg utesluter dirty read vid A:s andra läsning?

<details class="answer" markdown="1">
<summary>Visa svar</summary>

Förloppet visar en **icke upprepbar läsning** inom A: samma pris läses två gånger, men B hinner ändra och godkänna priset mellan läsningarna. Den andra läsningen gäller därför ett godkänt värde och är inte smutsig. Det som behöver bedömas är i stället om A:s arbete kan hantera att svaret förändras under den pågående transaktionen.
</details>

<details class="extension" markdown="1">
<summary>Fördjupning: fler rader och verkligt SQLite-beteende</summary>

Om en upprepad fråga hittar nya rader som en annan transaktion har lagt till kan det röra sig om en *phantom read*. Då förändras mängden matchande rader, i stället för bara värdet i en redan läst rad.

SQLite med vanliga, separata anslutningar tillåter inte att en anslutning läser en annans icke-godkända förändringar, och serialiserar skrivningar. De felaktiga schemana ovan ska därför inte återskapas genom att stänga av skydd i en SQLite-klient. Ett valbart [experiment med två terminaler]({{ '/docs/fordjupning/sqlite-tva-anslutningar/' | relative_url }}) visar i stället hur systemet får en skrivare att vänta eller misslyckas med ett låsfel. Det kräver SQLite-kommandot `sqlite3`; grundövningarna på denna sida kräver ingen installation.
</details>

## Kontrollfrågor

1. Varför ändras inte ett tidigare läst lokalt värde när databasen ändras?
2. Vilken uppgift om <code>COMMIT</code> behövs för att avgöra om en läsning är smutsig?
3. Kan en inkonsistent analys uppstå även om alla lästa värden är godkända?
4. Betyder ett transaktionsschema att SQLite tillåter just det förloppet?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Läsningen har gett transaktionen ett lokalt värde att arbeta med, ungefär som när någon skriver av ett tal från en skärm. Om databasen senare ändras skrivs den redan hämtade kopian inte om automatiskt. B kan därför fortfarande räkna från 100 trots att A har skrivit och godkänt 90. En ny läsning eller annan samordning behövs för att undvika att beräkningen bygger på fel underlag.

2. Vi behöver veta om transaktionen som skrev just det lästa värdet hade gjort `COMMIT` före läsningen. Om B läser A:s nya 90 medan A fortfarande kan avbryta är läsningen smutsig. Om A redan har godkänt värdet är just den läsningen inte smutsig, även om andra samtidighetsproblem fortfarande kan finnas i schemat.

3. Ja. I kontoexemplet läser A konto 1:s godkända saldo 1000 före överföringen och konto 2:s godkända saldo 700 efter den. Summan 1700 blandar därmed två tidpunkter, trots att totalsaldot var 1500 både före och efter. Problemet ligger i vilka värden som kombineras, inte i att något enskilt läsvärde saknade godkännande.

4. Nej. Ett schema är ett underlag för att analysera ordningen mellan händelser, och kan medvetet visa ett oskyddat förlopp. Ett verkligt DBHS kan stoppa ett steg, låta en transaktion vänta eller avbryta arbetet för att förebygga felet. Grundövningen är därför att förstå vad som skulle gå fel och var skydd behövs, inte att tvinga SQLite att återskapa varje rad i schemat.

</details>

## Sammanfattning

För att förstå ett transaktionsproblem behöver vi följa vad som läses, vad som skrivs och när en ändring godkänns. Ett gammalt lokalt värde kan orsaka en förlorad uppdatering, ett ofärdigt värde kan ge en smutsig läsning och flera godkända värden från olika tidpunkter kan ge en missvisande helhet. Ett schema gör skillnaderna synliga utan att förutsätta att ett visst DBHS tillåter förloppet.