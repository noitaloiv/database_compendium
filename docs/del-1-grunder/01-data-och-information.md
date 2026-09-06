---
layout: default
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

Föreställ dig att du hittar följande anteckning:

```text
1042, 2027-01-15, 34900
```

Anteckningen innehåller data, men det är svårt att veta vad den säger. `1042`
kan vara ett ordernummer, ett postnummer eller antalet deltagare i en studie.
`34900` kan betyda 34 900 kronor, 349 kronor uttryckt i öre eller något helt
annat.

Det första kapitlet börjar därför inte med programkod. Det börjar med den mer
grundläggande frågan: **vad krävs för att lagrade värden ska gå att förstå?**

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- förklara skillnaden mellan lagrade data och tolkad information;
- visa varför ett värde behöver ett sammanhang;
- identifiera vilka förklaringar som saknas i en enkel registrering.
</div>

## 1.1 Ett värde berättar sällan hela historien

Om vi lägger till rubriker blir anteckningen lättare att läsa:

| OrderID | OrderDate | TotalAmountOre |
| ---: | --- | ---: |
| 1042 | 2027-01-15 | 34900 |

Nu kan vi tolka raden som: *beställning 1042 registrerades den 15 januari 2027
och uppgår till 349 kronor*. Rubrikerna och förklaringen av enheten gör inte
värdena större eller mer exakta. De gör dem **begripliga i ett sammanhang**.

<figure class="figure">
  <img src="{{ '/assets/images/01-data-far-betydelse.svg' | relative_url }}"
       alt="Tre värden kompletteras stegvis med rubriker, enhet och verksamhetsfråga tills de går att tolka som information."
       width="960" height="430" loading="eager" decoding="async">
  <figcaption><strong>Figur 1.1.</strong> Samma värden blir användbara först när vi vet vad de representerar.</figcaption>
</figure>

Vi använder följande enkla arbetsdefinitioner:

- **data** är representationer som kan registreras, lagras och bearbetas;
- **information** är data som någon kan tolka och använda i ett visst
  sammanhang.

Gränsen är inte absolut. Ett klockslag är information för resenären som undrar
när bussen går, men kan vara ett råvärde i ett system som beräknar
förseningar. Det viktiga är att alltid fråga: **information för vem och för
vilken fråga?**

## 1.2 Samma text kan betyda olika saker

Betrakta värdet `A12` i tre verksamheter:

| Verksamhet | Möjlig betydelse |
| --- | --- |
| Bibliotek | Hylla A12 |
| Universitet | Sal A12 |
| Lager | Plats A12 |

Tecknen är identiska, men betydelsen bestäms av verksamheten. Detta får två
konsekvenser:

1. ett datasystem behöver tydliga namn och regler;
2. den som utformar systemet måste förstå vad verksamheten försöker hålla reda
   på.

<figure class="figure">
  <img src="{{ '/assets/images/02-samma-varde-olika-betydelse.svg' | relative_url }}"
       alt="Värdet A12 kopplas till tre olika möjliga betydelser: bibliotekshylla, universitetssal och lagerplats."
       width="960" height="390" loading="lazy" decoding="async">
  <figcaption><strong>Figur 1.2.</strong> Formatet avslöjar inte ensamt vad ett värde betyder.</figcaption>
</figure>

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

Det kan också finnas data *om samma företeelse*. För en bok kan vi registrera
exempelvis titel, författare och utgivningsår. För ett lån kan vi registrera
vilken bok som lånades, av vem och när den ska lämnas tillbaka.

Vilka uppgifter som är relevanta beror på syftet. Ett bibliotek behöver
vanligen bokens titel men inte färgen på omslaget. En bokhandel kan däremot
behöva skilja mellan olika utgåvor och omslag. Det finns därför ingen
universell lista över vilka data som är ”rätt”.

### Exempel: Nordic Brew

Nordic Brew är ett fiktivt kafferosteri som återkommer genom kompendiet. För en
beställning kan företaget behöva registrera:

| Fråga | Exempel på registrerat värde |
| --- | --- |
| Vilken beställning? | `1042` |
| När gjordes den? | `2027-01-15` |
| Vilken kund? | `C-017` |
| Vilken produkt? | `COF-250` |
| Hur många? | `2` |

Listan är fortfarande inte färdig. Betyder `2` två påsar, två kilogram eller
två kartonger? Ett värde behöver både ett namn och en överenskommen betydelse.

## 1.4 Från observation till registrering

När något registreras görs alltid ett urval. En barista kan se en kund, höra en
beställning och känna igen en återkommande besökare. Systemet lagrar endast de
delar som någon har valt att representera.

<figure class="figure">
  <img src="{{ '/assets/images/13-fran-handelser-till-registrering.svg' | relative_url }}"
       alt="En händelse i verksamheten leder till ett urval av relevanta uppgifter, registrerade värden och slutligen tolkning och användning. En återkopplingspil visar att urvalet kan behöva omprövas."
       width="1040" height="420" loading="lazy" decoding="async">
  <figcaption><strong>Figur 1.3.</strong> Registrerade data är resultatet av ett urval, inte en fullständig kopia av en händelse.</figcaption>
</figure>

Processen är inte alltid linjär. Om användarna inte kan
besvara sina frågor behöver registreringen eller dess betydelse omprövas.

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

## Kontrollfrågor

1. Varför är `34900` inte tillräckligt för att förstå ett belopp?
2. Hur kan samma värde vara data i ett sammanhang och information i ett annat?
3. Varför måste den som utformar en registrering förstå dess användningsområde?

<details class="answer">
  <summary>Korta svar</summary>
  <ol>
    <li>Vi saknar bland annat enhet, valuta och vad beloppet avser.</li>
    <li>Skillnaden beror på vilken fråga som ställs och vem som tolkar värdet.</li>
    <li>Syftet avgör vilka uppgifter och förklaringar som behövs.</li>
  </ol>
</details>

## Sammanfattning

- Data kan lagras, men behöver ett sammanhang för att bli begriplig information.
- Rubriker, enheter och verksamhetsregler hjälper oss att tolka värden.
- Registrering är ett urval: allt i verkligheten blir inte data i systemet.
- Nästa kapitel visar varför sammanhörande data ofta behöver hanteras i en
  databas.
