---
layout: default
title: Använd AI för att undersöka din lösning
nav_order: 1.7
permalink: /docs/ai-som-studiestod/
description: Ett arbetssätt för att använda AI som stöd för förklaring, prövning och självständig förståelse av databaser.
keywords:
  - AI
  - SQL
  - motexempel
  - lärande
  - granskning
---

# Använd AI för att undersöka din lösning

När du har skrivit en SQL-fråga kan en AI-assistent hjälpa dig att formulera ett motexempel, förklara ett felmeddelande eller jämföra två möjliga lösningar. Det kan göra arbetet lättare, men ett övertygande svar visar inte i sig att frågan är korrekt eller att du själv kan lösa nästa uppgift. För att stödet också ska bidra till lärande behöver du behålla en aktiv roll: formulera vad du vill veta, förutsäga resultatet och pröva förklaringen mot ett underlag som du förstår.

Arbetssättet nedan passar efter kapitlen om <code>JOIN</code> och gruppering. Du behöver inget AI-konto för att göra övningen; det färdiga förslaget räcker. Om du använder en tjänst väljer du själv vilken, och arbetar med bokens fiktiva data i stället för personuppgifter eller annat material som inte ska delas.

## Börja med ett eget påstående

Anta att Nordic Brew vill se **alla kunder och antalet beställningar per kund**, även när antalet är noll. Innan du skriver SQL kan du förutsäga resultatet från startdatabasen:

| <code>CustomerID</code> | <code>CustomerName</code> | <code>OrderCount</code> |
| --- | --- | ---: |
| 17 | Mira Ek | 2 |
| 24 | Samir Noor | 1 |
| 31 | Lo Chen | 0 |

En resultatrad ska alltså beskriva en kund. Vi räknar beställningar, inte orderrader eller kaffeförpackningar, och behöver därför inte lägga till `OrderLine`. Denna beskrivning blir vårt eget bedömningsunderlag när vi granskar ett förslag.

## Ett förslag som går att köra men ger fel svar

Följande är ett **konstruerat granskningsförslag**, inte ett dokumenterat svar från en viss AI-tjänst:

```sql
SELECT c.CustomerID, c.CustomerName, COUNT(*) AS OrderCount
FROM Customer AS c
LEFT JOIN SalesOrder AS so ON so.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CustomerName
ORDER BY c.CustomerID;
```

Förslaget åtföljs av förklaringen: ”<code>LEFT JOIN</code> behåller alla kunder och <code>COUNT</code> räknar deras order, så även kunder utan order får rätt antal.” Förklaringen låter rimlig, men ordet ”räknar” döljer en skillnad som vi behöver undersöka.

**Pröva i SQLite:** använd [nordicbrew-minimal.sql]({{ '/assets/sql/nordicbrew-minimal.sql' | relative_url }}) i en separat övningsdatabas enligt [körguiden]({{ '/docs/arbeta-praktiskt/' | relative_url }}). Startfilen återställer exempeldata. Förutsäg först vilken kund som kan avslöja ett fel, kör sedan frågan och jämför med tabellen ovan.

<details markdown="1">
<summary>Följ resultatet och rätta förslaget</summary>

Lo avslöjar felet. Efter `LEFT JOIN` finns en bevarad rad för henne, men `OrderID` är <code>NULL</code> eftersom ingen beställning matchar. `COUNT(*)` räknar denna resultatrad och visar därför 1, trots att antalet beställningar är 0.

Byt `COUNT(*)` mot `COUNT(so.OrderID)`. Då räknas bara de rader som har ett ordernummer, så Lo får 0 medan Mira och Samir behåller 2 respektive 1. Felet fanns alltså i vad som räknades, inte i att `LEFT JOIN` användes.

Detta visar också varför tre kunder med var sin beställning hade varit otillräckliga testdata: båda frågorna skulle ha gett rätt antal för just dem. Kunden utan beställning är ett motexempel som skiljer lösningarna åt.

</details>

## Be om hjälp som lämnar ett arbete åt dig

När du fastnar kan en avgränsad fråga ge ett mer användbart stöd än ”lös hela uppgiften”. Du kan till exempel skriva:

> Jag vill visa alla kunder och deras antal beställningar, även noll. Jag har skrivit frågan nedan. Ge mig en ledtråd till vilket datafall jag bör undersöka, men skriv inte en färdig lösning. Be mig först förklara vad en rad betyder efter <code>JOIN</code>.

En sådan instruktion garanterar inte att assistenten följer önskemålet eller ger rätt ledtråd. Den gör däremot ditt syfte tydligt och ger dig en konkret fråga att pröva. Om svaret föreslår en konstruktion som du ännu inte kan förklara kan du be om en lösning med de SQL-delar du redan arbetar med. Kontrollera sedan även den enklare lösningen.

| När du behöver stöd med … | Be om … | Kontrollera själv … |
| --- | --- | --- |
| ett felmeddelande | vilken del av satsen felet syftar på | om felet gäller namn, syntax eller frågans betydelse |
| en <code>JOIN</code> | ett litet mellanresultat med matchande radpar | vilka kombinationer som faktiskt uppstår |
| en modell | en fråga om en oklar verksamhetsregel | om svaret följer beskrivningen eller ett påhittat antagande |
| normalisering | ett möjligt motexempel till ett föreslaget beroende | om motexemplet är tillåtet i verksamheten |
| testdata | ett fall där två föreslagna lösningar skiljer sig | det förväntade resultatet innan koden körs |

## Undersök vad du kan göra efter hjälpen

När förklaringen känns begriplig stänger du den och prövar ett närliggande fall. Anta exempelvis att `Member(MemberID, MemberName)` beskriver föreningsmedlemmar och att `Loan(LoanID, MemberID)` beskriver deras lån. Nora har två lån, Bo ett och Inez inget. Skriv från början en fråga som visar varje medlem och antalet lån, och förklara varför Inez får noll.

<details markdown="1">
<summary>Lösningsförslag till det nya fallet</summary>

```sql
SELECT m.MemberID, m.MemberName, COUNT(l.LoanID) AS LoanCount
FROM Member AS m
LEFT JOIN Loan AS l ON l.MemberID = m.MemberID
GROUP BY m.MemberID, m.MemberName;
```

Medlemstabellen står till vänster för att även Inez ska behållas. Eftersom hennes bevarade rad saknar `LoanID` bidrar den inte till `COUNT(l.LoanID)`. Frågan använder samma princip som kundexemplet, men förklaringen behöver fortfarande utgå från vad ett lån och en medlem betyder i det nya fallet. Detta är en skrivövning; tabellerna ingår inte i Nordic Brew-filen.

</details>

Avsluta gärna med tre meningar: vad du först trodde, vilket exempel som fick dig att ändra eller bekräfta din uppfattning, och vad du nu kan förklara utan att läsa svaret. Då blir AI-användningen en del av undersökningen av problemet, samtidigt som du får syn på vilket steg du fortfarande behöver öva.