---
layout: default
track: grundspar
prerequisites: "Kapitel 16 och 18: integritetsvillkor och transaktioner."
focus: "Fördela ansvar för åtkomst, säkerhetskopiering och återställning."
title: 22. Databasadministration och säker användning
parent: Del IV – Åtkomst, ansvar och perspektiv
nav_order: 22
permalink: /docs/del-4-perspektiv/databasadministration/
description: Fördela ansvar för behörigheter, säkerhetskopiering, återställning och säkra databasfrågor.
keywords: [databasadministration, DBA, behörighet, backup, återställning, SQL-injektion, metadata]
---

# 22. Databasadministration och säker användning

{% include chapter_guide.html %}

En databas kan vara väl modellerad och ändå bli oanvändbar om fel person kan radera den, om disken går sönder eller om ingen vet hur den ska återställas. När ett system tas i bruk tillkommer därför ett ansvar som sträcker sig längre än att skriva en korrekt fråga.

**Databasadministration** handlar om att förvalta databasen och dess omgivning så att uppgifterna är tillgängliga för rätt ändamål och skyddas mot fel. I en stor organisation kan arbetet delas mellan flera specialister. I ett mindre system kan samma person bära flera roller, men arbetsuppgifterna försvinner inte för det.

## 22.1 Vem ansvarar för vad?

Hos Nordic Brew behöver lagerpersonalen se vad som ska skickas, kundservice behöver undersöka kunders order och en tekniskt ansvarig behöver kunna återställa systemet efter ett fel. Att alla arbetar med samma verksamhet betyder inte att de behöver samma rättigheter.

| Ansvar | Exempel på frågor att kunna besvara |
| --- | --- |
| Verksamhetsansvar | Vad betyder en bekräftad order, och vilka uppgifter behövs? |
| Systemutveckling | Hur registrerar programmet en order eller leverans korrekt? |
| Databasadministration | Vem får läsa och ändra, hur tas kopior och hur hanteras driftproblem? |
| Användning | Är rätt order registrerad och behöver något korrigeras? |

Om en kopia måste återställas behöver den tekniskt ansvariga veta hur arbetet genomförs, men också vilket resultat verksamheten kan acceptera. Kundservice kan till exempel behöva identifiera de beställningar som registrerades efter kopian och därför skulle saknas efter återställningen. Ansvarsfördelningen innebär alltså inte att rollerna kan arbeta oberoende av varandra: det tekniska beslutet om återställning behöver bygga på verksamhetens bedömning av vilket arbete som måste bevaras eller återskapas.

## 22.2 Ge den åtkomst som arbetsuppgiften kräver

En läsrättighet ska inte behöva innebära rätt att förändra tabeller. **Minsta nödvändiga behörighet** betyder att varje användare eller program får de rättigheter som behövs för sin uppgift, utan att all åtkomst samlas i ett gemensamt administratörskonto.

I ett serverbaserat DBHS kan användare och roller ofta ges olika rättigheter till tabeller eller vyer. En **vy** är en sparad frågedefinition som kan presentera ett valt utsnitt, exempelvis dagens plockunderlag utan onödiga kunduppgifter. Om den används som åtkomstgräns måste de underliggande rättigheterna också vara korrekt inställda; själva namnet ”vy” ger inget automatiskt skydd.

SQLite fungerar annorlunda i våra lokala övningar. Databasen ligger i en fil och SQLite har inte samma inbyggda användar- och rollsystem som en vanlig databasserver. Filåtkomst, applikation och operativsystem blir därför viktiga delar av skyddet. Det är en skillnad i ansvarsfördelning, inte ett skäl att låtsas att alla databasprodukter administreras på samma sätt.

## 22.3 En säkerhetskopia måste gå att återställa

En **säkerhetskopia** är en kopia som ska kunna användas efter att originalet blivit förlorat eller felaktigt. Att en kopieringskörning rapporterar ”klar” visar dock inte att hela verksamheten kan komma igång igen. Återställning behöver prövas.

Tänk dig att nattens kopia finns, men att ingen har dokumenterat vilket program eller vilken schemaversion som behövs för att öppna den. Uppgifterna kan vara bevarade utan att systemet snabbt blir användbart. Därför omfattar en återställningsplan både data, nödvändiga inställningar och en praktisk arbetsgång.

Två konkreta frågor hjälper oss att precisera behovet: **Hur mycket nyligen registrerat arbete får gå förlorat? Hur länge får verksamheten vara utan systemet?** Om svaren är ”högst en timme” och ”högst en arbetsdag” ger det andra krav än om flera dagars avbrott är acceptabelt.

En kopia på samma lagringsenhet skyddar inte mot att just den enheten försvinner. Samtidigt måste kopiorna skyddas mot obehörig läsning. För en databas som används under kopieringen behövs en metod som ger en sammanhängande kopia; det är inte alltid tillräckligt att kopiera en öppen fil och hoppas att alla delar passar ihop.

<figure class="figure" id="figur-22-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 22.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/42-aterstallning.svg' | relative_url }}" alt="En tidslinje visar nattkopia klockan 02, nya order klockan 09, felaktig radering klockan 11 och upptäckt klockan 14." width="900" height="475" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 22.1.</strong> Ett äldre tillstånd kan sakna både felet och senare korrekta registreringar. Återställningsbeslutet behöver ta hänsyn till båda. <a href="{{ '/assets/images/42-aterstallning.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 22.4 <code>ROLLBACK</code> och återställning från kopia löser olika problem

Om vi upptäcker felet medan transaktionen fortfarande pågår kan `ROLLBACK` återställa dess förändringar. Efter `COMMIT` är den möjligheten däremot avslutad: en felaktig radering som godkändes klockan 11 kan inte ångras genom att vi skriver `ROLLBACK` klockan 14. Då behöver vi undersöka en annan väg, exempelvis en riktad korrigering eller återställning från en säkerhetskopia. Kopior behövs också för fel som en transaktion inte kan reparera, såsom att själva lagringsenheten går förlorad.

Även en återställning kräver eftertanke. Om gårdagens kopia återställs för att reparera en felaktig radering kan dagens korrekta registreringar saknas i kopian. I mer avancerade system kan förändringsloggar stödja återställning till en bestämd tidpunkt. Grundfrågan är densamma: vilket tillstånd återställs, och vilket arbete behöver bevaras eller återskapas?

## 22.5 Låt inmatade värden förbli värden

När ett program söker efter en kund tar det ofta emot text från användaren. Om programmet bygger SQL genom att klistra in denna text direkt i frågesträngen kan inmatningen påverka frågans struktur. Den typen av fel kallas **SQL-injektion**.

För att den inmatade texten ska förbli ett sökvärde skriver programmet först frågans struktur och lämnar därefter värdet separat genom databibliotekets stöd för parametrar. Ett apostroftecken i ett namn behandlas då som en del av namnet, i stället för att påverka var SQL-textens egna citattecken börjar och slutar. Den avgörande skillnaden är alltså att programmet anger vad frågan får göra, medan användarens inmatning anger vilket värde den ska arbeta med.

Du behöver inte skriva ett program för att följa principen. Fundera på skillnaden mellan ”sök efter detta namn” och ”låt den inmatade texten ändra vad frågan gör”. Det förra är vad sökfältet är avsett för.

<details class="extension" markdown="1">
<summary>Fördjupning: ett parameteriserat exempel i Python</summary>

Följande kod använder Pythons sqlite3-bibliotek. `connection` antas vara en redan öppnad anslutning och `entered_name` innehåller text från användaren:

```python
rows = connection.execute(
    "SELECT CustomerID FROM Customer WHERE CustomerName = ?",
    (entered_name,)
).fetchall()
```

Frågetecknet markerar platsen för ett värde. Parametern används inte för att välja tabellnamn eller skriva egna SQL-delar. Den här programmeringssyntaxen är en illustration av principen och behövs inte i bokens SQL-övningar.
</details>

## 22.6 Dokumentera det som nästa person behöver förstå

Kolumnbeskrivningar, nyckelregler och datatyper är **metadata**, data om databasens struktur och betydelse. Dokumentation bör även förklara sådant som inte kan utläsas ur schemat: om `Price` anges i kronor eller öre, vem som får ändra ett kundnummer och hur order från en äldre version ska tolkas.

I drift behöver någon dessutom följa upp fel, utrymme och frågor som blivit långsamma. Övervakning är användbar först när en observation leder till en begriplig åtgärd: vem får larmet, vad betyder det och hur undersöks orsaken? Här möts administrationen och den verksamhetsförståelse som började redan i kapitel 1.

### Registrera dagens arbete och analysera längre perioder

Kundservice behöver ofta hitta en viss order snabbt, medan en årsrapport kan behöva läsa stora delar av orderhistoriken. Det första är ett exempel på ett **transaktionellt arbete**: många avgränsade registreringar och uppslagningar. Det andra är **analytiskt arbete**, där många observationer sammanställs för jämförelser och beslut.

| Arbete | Typiskt informationsbehov | Viktig fråga inför lösningen |
| --- | --- | --- |
| Registrera leverans 1001 | Ändra några bestämda uppgifter korrekt | Hur skyddas transaktionen och samtidig åtkomst? |
| Jämföra beställningsvolym per månad | Läsa och sammanfatta många orderrader | Vilka perioder, statusvärden och historiska priser ingår? |

Samma databas kan stödja båda, särskilt i ett mindre system. Om omfattande analyser börjar störa den dagliga användningen kan separat rapportlagring vara ett alternativ. En sådan kopia väcker dock nya frågor om när den senast uppdaterades och hur definitionerna hålls samstämmiga. Det är där förvaltning och informationskvalitet möts i nästa kapitel.

## 22.7 Resonera om en återställning

Ett bibliotek upptäcker klockan 14 att en felaktig ändring godkändes klockan 11. Den senaste säkerhetskopian togs klockan 02. Sedan dess har både korrekta lån och den felaktiga ändringen registrerats.

1. Varför räcker inte <code>ROLLBACK</code> klockan 14?
2. Vilken risk finns med att omedelbart ersätta databasen med nattens kopia?
3. Vilket underlag behöver undersökas innan återställningsmetoden väljs?

<details class="answer" markdown="1">
<summary>Visa lösningsförslag</summary>

1. Ändringen är redan godkänd; dess transaktion är avslutad.
2. Även korrekta registreringar efter klockan 02 kan försvinna ur den återställda databasen.
3. Undersök exakt vilka rader som blev fel, vilka kopior och loggar som finns, vilka korrekta förändringar som måste bevaras och hur återställningen kan prövas på en separat kopia. En riktad korrigering kan ibland vara lämpligare än att ersätta allt.
</details>

## 22.8 Från programmet till databasen

När en kundservicehandläggare söker efter Mira i ett program behöver handläggaren inte själv skriva SQL. Programmet tar emot sökvärdet, använder en **anslutning** till databashanteringen och skickar en parameteriserad fråga. Svaret består av rader som programmet kan använda för att visa ett resultat. En anslutning är alltså en väg för kommunikationen, inte en ny kopia av alla kunduppgifter.

Detta ger en konkret koppling till kapitel 2: ett användargränssnitt kan förändras utan att kundtabellens betydelse ändras. Programmet behöver fortfarande använda rätt tabeller och identifierare, och det behöver hantera både tomma resultat och fel. Att sökningen ger noll rader betyder exempelvis inte i sig att anslutningen är trasig.

<figure class="figure">
  <img src="{{ '/assets/images/anslutning-och-driftform.svg' | relative_url }}" alt="Två driftformer jämförs. I ett lokalt program anropar programkoden SQLite-biblioteket, som arbetar med databasfilen. I den andra formen skickar applikationen frågor via en anslutning till ett separat serverbaserat DBHS. I båda fallen används SQL och resultat går tillbaka till programmet." width="1000" height="620" loading="lazy" decoding="async">
  <figcaption><strong>Figur 22.1.</strong> Var databashanteringen körs påverkar anslutning och driftansvar. Det ändrar inte automatiskt vad en kund, en order eller en främmande nyckel betyder.</figcaption>
</figure>

SQLite är ett bibliotek som kan köras inne i programmet. Ett serverbaserat DBHS är i stället en separat tjänst som applikationen ansluter till, lokalt eller över ett nätverk. Även ett webbprogram kan använda SQLite på sin server; det avgörande är hur programkoden når databashanteringen, inte om slutanvändaren har en webbläsare. En köpt molntjänst kan sköta delar av driften, medan verksamheten fortfarande behöver bestämma betydelser, åtkomst och acceptabel återställning.

### Följ en sökning utan att bygga ett helt system

Följande lilla program är en valbar körbar illustration i Python. Det använder en tillfällig databas i minnet och lämnar därför inga förändrade övningsfiler efter sig. Samma steg finns i andra programmeringsspråks databibliotek, även om syntaxen skiljer sig.

```python
import sqlite3

connection = sqlite3.connect(":memory:")
try:
    connection.execute(
        "CREATE TABLE Customer (CustomerID INTEGER PRIMARY KEY, CustomerName TEXT NOT NULL)"
    )
    connection.execute("INSERT INTO Customer VALUES (17, 'Mira Ek')")
    connection.commit()

    entered_name = "Mira Ek"
    rows = connection.execute(
        "SELECT CustomerID, CustomerName FROM Customer WHERE CustomerName = ?",
        (entered_name,)
    ).fetchall()
    print(rows)
finally:
    connection.close()
```

Resultatet är `[(17, 'Mira Ek')]`. Frågan bestämmer vilka kolumner och vilket villkor som används, medan `entered_name` ger parameterns värde. Om namnet byts till `Bo Lind` blir resultatet `[]`, en tom lista. Ingen sådan kund finns i det här lilla underlaget.

### När programmet förändrar flera uppgifter

En sökning och en registrering ställer olika krav. Om programmet både minskar ett lager och registrerar en leverans behöver förändringarna ingå i en avsiktlig transaktion. Vid ett fel måste programmet följa upp om transaktionen ska avbrytas; det får inte anta att varje felmeddelande automatiskt har återställt allt tidigare arbete. Kapitel 18 visar hur detta kan prövas med `COMMIT` och `ROLLBACK`.

Parametrar, behörigheter och transaktioner löser alltså olika problem. Parametrar håller inmatade värden skilda från SQL-strukturen. Behörigheterna avgör vilken åtkomst som tillåts, medan transaktionen håller ihop en förändring. En parameteriserad fråga kan fortfarande läsa fel kund om programmet använder fel identifierare, och den kan fortfarande vara olämplig för användarens arbetsuppgift.

**Resonera:** En kollega föreslår att programmet skickar hela kundtabellen till webbläsaren och bara döljer de rader användaren inte behöver se. Vilken del av problemet löser inte detta?

<details class="answer" markdown="1">
<summary>Visa resonemang om ansvar och åtkomst</summary>

Att dölja en rad i gränssnittet hindrar inte i sig att uppgiften redan har överförts till användaren. Programmet behöver begränsa vilket resultat som lämnas ut utifrån den tillåtna arbetsuppgiften. För det krävs en korrekt åtkomstbedömning i den del av systemet som användaren inte själv kan kringgå genom att ändra vyn. SQL-parametrar skyddar frågans struktur men avgör inte vem som ska få läsa varje kund.

</details>

**Vidare läsning:** [SQLite om användningsområden och driftformer](https://www.sqlite.org/whentouse.html), [Python-dokumentationens parameteriserade frågor](https://docs.python.org/3/library/sqlite3.html) och [OWASP om SQL-injektion](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

## Kontrollfrågor

1. Vad innebär minsta nödvändiga behörighet?
2. Varför ska återställning testas och inte bara säkerhetskopiering?
3. Vad skiljer en parameter från en inklistrad SQL-del?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Varje användare eller program får de rättigheter som arbetsuppgiften kräver. Lagerpersonalen kan exempelvis behöva läsa plockunderlaget utan att kunna radera kundregistret eller ändra tabellstrukturen. Genom att hålla isär rättigheterna begränsas följderna av misstag och av att ett konto används på fel sätt.

2. Målet är att kunna få tillbaka ett fungerande system med ett känt innehåll. En skapad kopia visar inte ensam att den går att öppna med rätt program, att nödvändiga inställningar finns eller att arbetet kan genomföras tillräckligt snabbt. En provad återställning ger därför ett bättre underlag för att bedöma om planen fungerar i praktiken.

3. En parameter lämnar ett värde separat till en redan bestämd SQL-struktur. Om användaren skriver ett namn med apostrof ska tecknet då förbli en del av namnet. När texten i stället klistras in som SQL riskerar den att påverka frågans uppbyggnad. Parametrar skiljer alltså det som ska sökas från instruktionen för hur sökningen får utföras.

</details>

## Sammanfattning

En användbar databas kräver tydligt ansvar för rättigheter, kopior, återställning och dokumentation. Planen behöver prövas mot konkreta händelser: vem kan rätta ett fel, vilket tillstånd kan återställas och vad händer med korrekt arbete som tillkommit senare? Samma frågor följer med när data kopieras för rapportering och analys.