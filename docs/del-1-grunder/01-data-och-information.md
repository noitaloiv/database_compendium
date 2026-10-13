---
layout: default
track: grundspar
prerequisites: "Inga tidigare databaskunskaper behövs."
focus: "Skilj ett registrerat värde från dess betydelse."
title: 1. Data och information
parent: Del I – Modeller och relationer
nav_order: 1
permalink: /docs/del-1-grunder/data-och-information/
description: En första introduktion till data, information och varför sammanhang behövs.
keywords:
  - data
  - information
  - värde
  - sammanhang
  - registrera
---

# 1. Data och information

{% include chapter_guide.html %}

Föreställ dig att du hittar följande anteckning:

```text
1042, 2027-01-15, 34700
```

Anteckningen innehåller tre registrerade värden, men det är ännu oklart vad de beskriver. Talet `1042` skulle kunna beteckna en beställning eller antalet deltagare i en studie, och `34700` skulle kunna vara ett belopp uttryckt i kronor eller i öre. För den som skrev anteckningen var betydelsen kanske självklar. När någon annan ska använda den behöver däremot den förklaringen följa med, så att läsaren slipper gissa.

För att anteckningen ska kunna hjälpa någon behöver vi besvara en grundläggande fråga: **vad krävs för att lagrade värden ska gå att förstå?**

## 1.1 Ett värde berättar sällan hela historien

Om vi lägger till rubriker blir anteckningen lättare att läsa:

| <code>OrderID</code> | <code>OrderDate</code> | <code>TotalOre</code> |
| ---: | --- | ---: |
| 1042 | 2027-01-15 | 34700 |

När rubrikerna anger vad varje värde beskriver kan vi läsa raden som att *beställning 1042 registrerades den 15 januari 2027 och uppgår till 347 kronor*. I den tolkningen spelar ändelsen `Ore` en viktig roll: den talar om att det registrerade beloppet är uttryckt i öre. Själva siffrorna är desamma som tidigare, men rubriker och enhet gör att de nu kan **förstås tillsammans**.

<figure class="figure" id="figur-1-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 1.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/01-data-far-betydelse.svg' | relative_url }}" alt="Värdena 1042, 2027-01-15 och 34700 får rubriker och enheten öre. Därmed kan de tolkas som en order den 15 januari 2027 på 347 kronor." width="960" height="430" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 1.1.</strong> Rubriker och enhet gör samma värden möjliga att tolka som en bestämd registrering. <a href="{{ '/assets/images/01-data-far-betydelse.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Skillnaden kan fångas med två enkla arbetsdefinitioner:

- **data** är representationer som kan registreras, lagras och bearbetas;
- **information** är data som någon kan tolka och använda i ett visst
  sammanhang.

Skillnaden mellan data och information beror alltså på hur värdena används. Ett klockslag på en hållplatsskylt hjälper resenären att avgöra när bussen går och fungerar därmed som information för den frågan. Samma klockslag kan samtidigt vara ett av många inmatade värden i ett program som beräknar förseningar. När vi utformar en registrering behöver vi därför fråga både **vem som ska använda värdena och vad personen behöver få veta**.

## 1.2 Samma text kan betyda olika saker

Betrakta värdet `A12` i tre verksamheter:

| Verksamhet | Möjlig betydelse |
| --- | --- |
| Bibliotek | Hylla A12 |
| Universitet | Sal A12 |
| Lager | Plats A12 |

Trots att alla tre verksamheterna använder tecknen `A12` går det inte att flytta värdet mellan deras register och förvänta sig att betydelsen följer med. En biblioteksanställd kanske letar efter en bokhylla, medan en student letar efter en undervisningssal. För att undvika sådana missförstånd behöver registreringen ange vad koden betecknar och vilka regler som gäller för den. Att datorn har sparat tecknen korrekt räcker alltså inte för att användaren ska tolka dem korrekt.



{: .mistake }
> Datorn kan lagra `A12` utan att förstå om värdet betecknar en hylla, en sal
> eller en lagerplats. Betydelsen kommer från överenskommelser, regler och
> användning.

## 1.3 Vad kan registreras?

Data kan beskriva många slags företeelser:

- en person som är medlem i en förening;
- en bok som kan lånas;
- en betalning som genomförts;
- temperaturen vid en viss tidpunkt;
- en plats som ett paket ska levereras till.

Flera uppgifter kan också beskriva *samma företeelse*. När ett bibliotek registrerar en bokutgåva kan exempelvis titel, författare och utgivningsår tillsammans beskriva den. Ett lån behöver däremot uppgifter om vilket exemplar som lånades, av vem och när det ska lämnas tillbaka. Även om uppgifterna hör samman beskriver de alltså olika saker: det som kan lånas respektive en viss utlåning.

Vilka uppgifter som är relevanta beror på syftet. Ett bibliotek behöver
vanligen bokens titel men kanske inte färgen på omslaget, medan en bokhandel
kan behöva skilja mellan olika utgåvor och omslagsvarianter. Vad som är ”rätt”
data kan därför inte avgöras oberoende av de frågor och arbetsuppgifter som
registreringen ska stödja.

### Exempel: Nordic Brew

För att följa hur informationsbehov utvecklas används det fiktiva kafferosteriet
Nordic Brew i flera exempel. När företaget registrerar en beställning kan det
bland annat behöva besvara följande frågor:

| Fråga | Exempel på registrerat värde |
| --- | --- |
| Vilken beställning? | `1042` |
| När gjordes den? | `2027-01-15` |
| Vilken kund? | `17` |
| Vilken produkt? | `501` |
| Hur många? | `2` |

Trots rubrikerna är registreringen ännu inte entydig, eftersom `2` kan avse två
påsar, två kilogram eller två kartonger. För att raden ska kunna användas utan
gissningar behövs därför både tydliga namn och en gemensamt överenskommen
betydelse. I det fortsatta Nordic Brew-exemplet betyder kvantiteten två förpackningar av produkt 501, där varje förpackning innehåller 500 gram kaffe. Varken storleken eller enheten gick att utläsa ur talet 2 ensamt.

## 1.4 Från observation till registrering

När något registreras görs alltid ett urval av det som går att uppmärksamma i situationen. En barista kan exempelvis se en kund, höra en beställning och känna igen en återkommande besökare, medan systemet bara lagrar de delar som någon har valt att representera. För att förstå registreringen behöver vi därför också förstå vad som har lämnats utanför.

<figure class="figure" id="figur-1-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 1.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/13-fran-handelser-till-registrering.svg' | relative_url }}" alt="En beställning leder till ett urval av uppgifter som registreras och sedan används för att besvara frågor. Urvalet kan behöva omprövas." width="1040" height="420" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 1.2.</strong> Det som registreras är ett urval av händelsen. Urvalet behöver räcka för de frågor som uppgifterna ska besvara. <a href="{{ '/assets/images/13-fran-handelser-till-registrering.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Anta att personalen ska packa beställningen men inte kan avgöra om ”två påsar” avser förpackningar på 250 eller 500 gram. Då blir det synligt att registreringen saknar något som arbetsuppgiften kräver. Företaget behöver återvända till definitionen av produkt och mängd och precisera vad som ska registreras. Arbetet går på det sättet fram och tillbaka mellan konkreta händelser, valda uppgifter och de frågor som uppgifterna ska besvara.

{: .important }
> Data är inte en neutral kopia av verkligheten. Att registrera något innebär
> att välja vad som ska tas med, hur det ska betecknas och vad som lämnas
> utanför.

## 1.5 Stanna upp och pröva

En träningsapp visar värdet `72`. Skriv ned minst tre möjliga betydelser. För
varje betydelse, ange vilken ytterligare förklaring som behövs.

<details class="answer">
  <summary>Jämför med ett möjligt resonemang</summary>
  <p><code>72</code> kan exempelvis vara puls i slag per minut, kroppsvikt i
  kilogram eller antalet träningspass. Vi behöver veta vad som har mätts,
  enheten, vem eller vad mätningen gäller och ofta även tidpunkten.</p>
</details>

## 1.6 Överföringsövning: en studentregistrering

Du får följande rad:

```text
20261234, 2IS007, 2026-09-04, G
```

1. Föreslå en rimlig rubrik för varje värde.
2. Lista minst fyra frågor som måste besvaras innan raden kan tolkas säkert.
3. Ge ett exempel på ett missförstånd som kan uppstå om förklaringen saknas.

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

En möjlig rubrikrad är `StudentID`, `CourseCode`, `RegistrationDate` och `Result`. Med de rubrikerna skulle raden beskriva en student, en kurs, ett registreringsdatum och ett resultat, men tolkningen är fortfarande ett förslag som behöver kontrolleras.

Börja därför med att fråga vad `20261234` identifierar och vilket kurstillfälle `2IS007` avser. Undersök sedan om datumet gäller registrering eller examination och vad `G` betyder i den aktuella kodlistan. Om ett registreringsdatum läses som examinationsdatum får mottagaren en felaktig bild, trots att datumet i sig är korrekt skrivet. Övningens poäng är att upptäcka vilka definitioner som saknas, inte att gissa fram en enda säker tolkning.
</details>

## Innan du går vidare

Skriv utan hjälp vad talet 34700 måste kompletteras med för att kunna tolkas som ett belopp. Om du spontant gissade kronor, jämför med öre: samma tecken ger olika information.

## Kontrollfrågor

1. Varför är `34700` inte tillräckligt för att förstå ett belopp?
2. Hur kan samma värde vara data i ett sammanhang och information i ett annat?
3. Varför måste den som utformar en registrering förstå dess användningsområde?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Ett belopp behöver både en enhet och ett sammanhang. Om `34700` anges i öre motsvarar det 347 kronor, men samma tal i kronor skulle beteckna ett helt annat belopp. Vi behöver dessutom veta vad beloppet gäller, exempelvis totalen för order 1042. Siffrorna ensamma avgör därför varken hur stort beloppet är eller vad det beskriver.

2. Värdet är data när vi betraktar det som en registrering som kan lagras eller bearbetas. När någon tolkar det med hjälp av ett sammanhang kan det samtidigt ge information. För den som vet att `34700` är orderns total i öre berättar registreringen vad kunden ska betala. Skillnaden beror alltså på tolkningen och användningen, inte på att siffrorna byts ut.

3. Användningsområdet avgör vilka skillnader registreringen behöver bevara. Om lagret ska packa en beställning räcker det inte med produktnamnet: även antal och förpackningsstorlek behöver kunna förstås. Den som utformar registreringen måste därför först undersöka vilka frågor uppgifterna ska besvara, så att viktiga delar av sammanhanget inte går förlorade.

</details>

## Sammanfattning

Data behöver ett sammanhang för att kunna användas som information. Rubriker, enheter och definitioner hjälper oss att förstå värdena, men de behöver väljas utifrån de frågor registreringen ska stödja. Därför börjar arbetet med en databas i verksamhetens betydelser, innan vi väljer hur uppgifterna ska lagras.