---
layout: default
track: grundspar
prerequisites: "Kapitel 17: <code>INSERT</code> och <code>UPDATE</code>."
focus: "Låt sammanhörande ändringar lyckas eller återställas tillsammans."
title: 18. Transaktioner som sammanhållna enheter
parent: Del III – Transaktioner och samtidighet
nav_order: 18
permalink: /docs/del-3-transaktioner/transaktioner-som-sammanhallna-enheter/
description: Registrera en leverans hos Nordic Brew och följ vad COMMIT och ROLLBACK gör.
keywords: [transaktion, BEGIN, COMMIT, ROLLBACK, ACID, atomicitet, Nordic Brew]
---

# 18. Transaktioner som sammanhållna enheter

{% include chapter_guide.html %}

Nordic Brew ska registrera att tio förpackningar av produkt 501 har lämnat lagret. För att uppgifterna ska beskriva samma leverans behöver företaget både minska det registrerade lagersaldot och spara en leveranspost med produkt och antal. Om bara saldot ändras går leveransen inte att följa i historiken, medan en ensam leveranspost skulle lämna det registrerade lagret tio förpackningar för högt. De två registreringarna behöver därför behandlas som delar av en gemensam händelse.

En **transaktion** ger de sammanhörande ändringarna en gemensam gräns: antingen godkänns båda, eller också återställs det arbete som gjorts inom transaktionen. För leveransen betyder det att vi inte ska behöva acceptera en lagerminskning utan dess leveranspost. Vi börjar med denna allt-eller-inget-princip i en enda databasanslutning och går i nästa kapitel vidare till situationer där flera arbetar samtidigt.

## 18.1 Utvidga fallet med en avgränsad lageruppgift

Tidigare beskrev Nordic Brew kunder, produkter och beställningar. Nu tillkommer ett nytt informationsbehov: lagersaldo och registrerade utleveranser. För att kunna koncentrera oss på transaktionen använder vi en separat, förenklad övningsdatabas med två tabeller.

| Tabell | Vad betyder en rad? | Viktiga attribut |
| --- | --- | --- |
| `Inventory` | Registrerat antal förpackningar av en produkt | `ProductID`, `Units` |
| `Shipment` | En utleverans av en produkt | `ShipmentID`, `ProductID`, `Quantity` |

En verklig leverans kan förstås omfatta flera produkter och behöva hänvisningar till order, mottagare och transportör. Här avgränsar vi varje leveranspost till en produkt. Vi återanvänder produktnumren från Nordic Brew, men den separata övningsdatabasen innehåller inte hela det tidigare orderschemat. Tabellen `Shipment` hänvisar därför till motsvarande produktpost i `Inventory`.

Produkt 501 har från början ett registrerat lager på 100 förpackningar. När tio har skickats ska både saldot `Units = 90` och leveransposten `(1001, 501, 10)` finnas sparade. Det är detta samband mellan lagerminskningen och leveranshistoriken som transaktionen ska skydda.

<figure class="diagram">
<div class="table-wrapper"><table>
<thead><tr><th scope="col">Läge i registreringen</th><th scope="col"><code>Units</code> för 501</th><th scope="col">Leverans 1001</th><th scope="col">Tolkning</th></tr></thead>
<tbody><tr><td>Före</td><td>100</td><td>Saknas</td><td>Ingen utleverans registrerad</td></tr>
<tr><td>Efter <code>UPDATE</code></td><td>90</td><td>Saknas</td><td>Ofärdigt arbete inom transaktionen</td></tr>
<tr><td>Efter <code>INSERT</code></td><td>90</td><td>10 förpackningar</td><td>Båda ändringarna utförda</td></tr>
<tr><td>Efter <code>COMMIT</code></td><td>90</td><td>10 förpackningar</td><td>Ändringarna godkända tillsammans</td></tr></tbody></table></div>
<figcaption><strong>Figur 18.1.</strong> Mellanläget behövs när ändringarna utförs, men ska inte lämnas som det godkända resultatet av registreringen.</figcaption>
</figure>

Transaktionen skyddar registreringen av leveransen, men kan inte kontrollera vilka kaffeförpackningar som faktiskt lämnade lagret. Om någon anger fel produkt eller fel antal kan därför båda ändringarna sparas tillsammans och ändå beskriva händelsen felaktigt. Allt-eller-inget-principen behöver alltså kombineras med kontroller av det som registreras.

## 18.2 Avsluta hela enheten med <code>COMMIT</code> eller <code>ROLLBACK</code>

I SQLite inleds en uttrycklig transaktion med `BEGIN`. Därefter skriver vi de satser som hör till samma enhet och avslutar med `COMMIT` när ändringarna ska godkännas:

```sql
BEGIN;
UPDATE Inventory
SET Units = Units - 10
WHERE ProductID = 501;

INSERT INTO Shipment (ShipmentID, ProductID, Quantity)
VALUES (1001, 501, 10);
COMMIT;
```

`COMMIT` gäller transaktionens samlade förändringar. Om vi upptäcker ett fel innan dess använder vi i stället `ROLLBACK`, som återställer det arbete den pågående transaktionen har gjort. Vi väljer alltså ett av avsluten; vi ska inte lägga `ROLLBACK` efter `COMMIT` och förvänta oss att en redan godkänd leverans försvinner.

Gränsen är lika viktig som kommandona. Om varje sats godkänns separat kan en misslyckad `INSERT` lämna den redan godkända lagerminskningen kvar. Båda satserna behöver därför ligga mellan samma `BEGIN` och samma avslut.

<figure class="figure" id="figur-18-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 18.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/36-transaktionens-tva-avslut.svg' | relative_url }}" alt="Samma två ändringar godkänns med COMMIT eller återställs tillsammans med ROLLBACK. Avsluten är alternativa." width="900" height="525" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 18.2.</strong> Pilarna visar alternativa avslut på den pågående transaktionen. <code>ROLLBACK</code> ska här väljas i stället för <code>COMMIT</code>, inte efteråt. <a href="{{ '/assets/images/36-transaktionens-tva-avslut.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

## 18.3 Pröva med en enda anslutning

**Verktyg och startläge:** skapa en separat SQLite-fil, exempelvis `nordicbrew-transactions.db`, enligt [Kör SQL-exemplen]({{ '/docs/arbeta-praktiskt/' | relative_url }}). Läs in [nordicbrew-transactions.sql]({{ '/assets/sql/nordicbrew-transactions.sql' | relative_url }}). Kontrollera att produkt 501 har 100 förpackningar, produkt 502 har 60 och att ingen leverans finns. Startfilen tar bort och återskapar just dessa övningstabeller; använd den inte mot en databas med värdefulla data.

Om klienten har egna osparade ändringar behöver de först avslutas med dess funktion för att spara eller återställa. I DB Browser for SQLite heter funktionerna *Write Changes* respektive *Revert Changes*. Ett fel om att en transaktion redan pågår betyder att anslutningen redan befinner sig i en sådan; öppna inte ytterligare ett `BEGIN` inuti den.

Kör följande tre block **ett i taget i samma anslutning**. Börja från startfilens läge, även om du nyss provade exemplet ovan.

```sql
BEGIN;
UPDATE Inventory SET Units = Units - 10 WHERE ProductID = 501;
SELECT ProductID, Units FROM Inventory WHERE ProductID = 501;
```

Resultatet är 90, eftersom den egna anslutningen kan läsa den ändring som just gjordes även innan den har godkänts. Leveransposten saknas fortfarande, så registreringen befinner sig nu i figurens ofärdiga mellanläge. Nästa block avbryter arbetet; försök därför förutsäga saldot efter avbrottet innan du kör det:

```sql
ROLLBACK;
SELECT ProductID, Units FROM Inventory WHERE ProductID = 501;
```

Saldot är åter 100. Nu kan vi göra ett nytt försök som omfattar båda ändringarna:

```sql
BEGIN;
UPDATE Inventory SET Units = Units - 10 WHERE ProductID = 501;
INSERT INTO Shipment (ShipmentID, ProductID, Quantity)
VALUES (1001, 501, 10);
COMMIT;
SELECT ProductID, Units FROM Inventory WHERE ProductID = 501;
SELECT ShipmentID, ProductID, Quantity FROM Shipment ORDER BY ShipmentID;
```

Efter detta block är saldot 90 och leveranstabellen innehåller `(1001, 501, 10)`. Vill du upprepa hela övningen läser du in startfilen igen, när ingen transaktion pågår. Om du bara kör sista blocket på nytt finns redan leveransnummer 1001, vilket ger ett nyckelfel och en annan övningssituation.

## 18.4 Fyra egenskaper som behöver förstås tillsammans

Allt-eller-inget-egenskapen kallas **atomicitet**. Tillsammans med konsistens, isolering och beständighet ingår den i förkortningen **<code>ACID</code>**, efter de engelska benämningarna.

| Egenskap | Vad den betyder här | Koppling till leveransen |
| --- | --- | --- |
| Atomicitet (*atomicity*) | Transaktionens ändringar godkänns tillsammans eller återställs | Lagerminskningen ska inte bli kvar ensam om registreringen avbryts |
| Konsistens (*consistency*) | En korrekt transaktion för databasen mellan tillåtna tillstånd | Nycklar och villkor ska följas, och registreringen ska motsvara verksamhetens regler |
| Isolering (*isolation*) | Samtidiga transaktioners påverkan på varandra begränsas enligt givna garantier | Två uttag ska inte skriva över varandras effekt |
| Beständighet (*durability*) | Ett godkänt resultat ska kunna bestå efter de fel systemets lagring och återhämtning är utformade för | En godkänd leverans ska inte försvinna bara för att programmet avslutas |

Konsistens förutsätter att vi har uttryckt de regler som transaktionen ska bevara och skrivit förändringarna så att reglerna följs. Ett `CHECK` kan exempelvis stoppa ett negativt lagerantal, men systemet kan inte därigenom upptäcka att personalen egentligen skickade tio förpackningar av en annan produkt. På motsvarande sätt behöver beständigheten stöd av hur databasen förvaltas: om hela lagringsenheten förloras kan säkerhetskopior behövas för att återställa ett godkänt resultat. <code>ACID</code>-egenskaperna hjälper oss alltså att resonera om transaktionernas beteende, medan korrekta verksamhetsregler och fungerande återställning fortfarande måste ordnas.

## 18.5 Ett fel i en sats behöver hanteras för hela händelsen

Anta att saldot har minskats men att en leverans med samma `ShipmentID` redan finns. Den nya leveransraden avvisas då av primärnyckeln. Det är frestande att tro att detta automatiskt återställer all tidigare SQL i transaktionen, men ett satsfel kan ha olika följder i olika DBHS och för olika feltyper.

Med standardbeteendet för detta nyckelfel i SQLite stoppas den felaktiga satsen, medan den tidigare lagerminskningen kan finnas kvar i den öppna transaktionen. Om vi då gör `COMMIT` riskerar vi att godkänna just det ofullständiga resultat vi ville undvika. När registreringen inte kan fullföljas behöver vi därför använda `ROLLBACK` och börja om från ett känt läge.

**Resonera:** Om `UPDATE` i stället råkar gälla `ProductID = 999`, som inte finns, behöver satsen inte ge något fel alls. Vilken kontroll saknas då?

<details class="answer" markdown="1">
<summary>Visa resonemang</summary>

En <code>UPDATE</code> som inte hittar någon rad kan genomföras utan att ändra något. Programmet behöver därför kontrollera att rätt lagerpost faktiskt uppdaterades, utöver att hantera felmeddelanden. I den manuella övningen kontrollerar vi produktnumret och jämför saldot med det förväntade resultatet. En transaktion skyddar enheten, men gör inte en felaktigt avgränsad ändring korrekt.
</details>

## 18.6 Överföringsövning: från lager till konton

**Arbetssätt:** börja på papper. Vill du prova SQL finns ett separat underlag, [transaction-basics.sql]({{ '/assets/sql/transaction-basics.sql' | relative_url }}), för en annan övningsfil. Det skapar `Account(AccountID, Balance)` med kontona 1 och 2 och saldona 1000 respektive 500. Beloppen är hela kronor i just detta exempel.

Tvåhundra kronor ska föras från konto 1 till konto 2. Saldona ska därefter vara 800 och 700, så att summan fortfarande är 1500.

1. Vilka ändringar behöver ingå i samma transaktion?
2. Fyll i kontonas värden efter det första respektive andra <code>UPDATE</code>-steget.
3. Vad ska göras om den andra ändringen inte kan fullföljas?

| Steg | Transaktion A | Konto 1 | Konto 2 |
| ---: | --- | ---: | ---: |
| 0 | Utgångsläge | 1000 | 500 |
| 1 | <code>BEGIN</code> | 1000 | 500 |
| 2 | Minska konto 1 med 200 | ? | ? |
| 3 | Öka konto 2 med 200 | ? | ? |
| 4 | <code>COMMIT</code> | ? | ? |

<details class="answer" markdown="1">
<summary>Lösningsförslag och valbar SQL</summary>

De två kontoförändringarna måste ligga i samma transaktion, eftersom de tillsammans representerar överföringen. Efter steg 2 är saldona 800 och 500: pengar har dragits från det första kontot men ännu inte lagts till på det andra. När steg 3 ger saldona 800 och 700 är båda delarna genomförda, och först då godkänns de tillsammans i steg 4. Om den andra ändringen inte kan genomföras används i stället `ROLLBACK`, så att även den första ändringen återställs.

```sql
BEGIN;
UPDATE Account SET Balance = Balance - 200 WHERE AccountID = 1;
UPDATE Account SET Balance = Balance + 200 WHERE AccountID = 2;
COMMIT;
SELECT AccountID, Balance FROM Account ORDER BY AccountID;
```

Kör exemplet en gång från den separata startfilen. Förväntat resultat är `(1, 800)` och `(2, 700)`. Läs in startfilen igen om du vill upprepa det. Samma princip används alltså för kaffelager och konton: identifiera först hela den händelse som ska lyckas tillsammans.
</details>

## Kontrollfrågor

1. Varför räcker det inte att godkänna varje sats separat i leveransexemplet?
2. Kan <code>ROLLBACK</code> ångra en transaktion som redan avslutats med <code>COMMIT</code>?
3. Garanterar atomicitet att rätt produkt har registrerats?
4. Vad kan bli fel om vi gör <code>COMMIT</code> efter att bara den andra satsen har avvisats?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Leveransen beskrivs av både en lagerminskning och en leveranspost. Om de godkänns var för sig kan lagersaldot bli bestående ändrat även om leveransposten aldrig går att spara. Genom att samla båda i samma transaktion kan vi i stället godkänna hela registreringen eller återställa dess ändringar, så att den ena delen inte lämnas som färdigt resultat ensam.

2. Nej. `ROLLBACK` återställer ändringarna i den transaktion som fortfarande pågår. När `COMMIT` har godkänt transaktionen är den gränsen avslutad. Ett fel som upptäcks därefter kräver en ny korrigering eller en annan återställningsmetod, där man också måste ta hänsyn till korrekt arbete som hunnit tillkomma.

3. Nej. Atomicitet håller ihop ändringarna, men avgör inte om de beskriver rätt verksamhetshändelse. Om någon anger fel produkt kan både lagerminskningen och leveransposten genomföras för den produkten och ändå vara felaktiga. Vi behöver därför kontrollera inmatningen och underlaget, utöver att placera ändringarna i en gemensam transaktion.

4. I det beskrivna SQLite-fallet avvisas den felaktiga leveransinsättningen medan den tidigare lagerminskningen kan ligga kvar i den öppna transaktionen. `COMMIT` skulle då godkänna ett ofullständigt arbete. När registreringen inte kan fullföljas behöver vi därför använda `ROLLBACK` och börja om från ett känt läge, i stället för att anta att ett satsfel alltid återställer hela transaktionen.

</details>

## Sammanfattning

För att välja en transaktions gränser behöver vi först identifiera vilka ändringar som tillsammans beskriver en verksamhetshändelse. I leveransexemplet hör lagerminskningen och leveransposten ihop och placeras därför mellan samma `BEGIN` och avslut. Med `COMMIT` godkänner vi det färdiga arbetet, medan `ROLLBACK` återställer ändringarna om den pågående transaktionen inte ska fullföljas. På så sätt kan vi undvika en halvt genomförd registrering, men vi behöver fortfarande kontrollera att rätt uppgifter ändras och att arbetet samordnas med andra transaktioner.