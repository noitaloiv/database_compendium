---
layout: default
title: 3. Konceptuell modellering
parent: Del I – Modeller och relationer
nav_order: 3
permalink: /docs/del-1-grunder/konceptuell-modellering/
keywords:
  - konceptuell modellering
  - informationsmodellering
  - ER
  - ERD
  - entitet
  - entity
  - association
  - relationship
  - kardinalitet
  - cardinality
  - multiplicitet
  - modalitet
  - crow's foot
  - kråkfot
---

# 3. Konceptuell modellering

Var hör en leveransadress hemma? I kapitel 1 såg vi att Nordic Brew kan behöva
bevara den adress som användes när en beställning gjordes, även om kunden senare
flyttar. Frågan kan inte lösas genom att leta efter rätt SQL-datatyp. Först
måste vi förstå vad verksamheten menar med *kund*, *beställning*, *adress* och
*historik*.

**Konceptuell modellering** gör ett avgränsat informationsbehov explicit utan
att först bestämma tabeller, främmande nycklar eller lagringsformat. Resultatet
är både en modell och en samling prövbara verksamhetsregler.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- avgränsa ett informationsområde och formulera relevanta verksamhetsregler;
- skilja entitetstyp, entitet, attribut, identifierare och association;
- ange och läsa minsta respektive största deltagande med `min..max`;
- modellera en M:N-association med en associativ entitetstyp när sambandet har
  egna attribut;
- skilja konceptuella identifierare från primär- och främmande nycklar;
- validera en modell med konkreta scenarier och kritisera rimliga alternativ.
</div>

## 3.1 Modellering är ett påstående om en verksamhet

En modell är en avsiktlig förenkling. Den tar med sådant som behövs för ett
bestämt syfte och lämnar annat utanför. Samma verklighet kan därför beskrivas
med flera modeller utan att alla modeller är lika lämpliga för samma uppgift.

Ett kafferosteri kan se en fysisk påse kaffe som:

- en produkt som kan beställas;
- ett lagersaldo av utbytbara enheter;
- ett individuellt spårbart parti med rostningsdatum;
- ett bokföringsvärde;
- ett objekt med ursprung och hållbarhetsinformation.

Vilka perspektiv som behöver modelleras beror på verksamhetsfrågan. En modell
för webbshoppen behöver inte automatiskt stödja spårning av varje fysisk påse.
Om en ny regel kräver återkallelse per produktionsparti måste modellen däremot
kunna skilja partier åt.

{: .important }
> En ER-modell blir inte korrekt bara för att notationens symboler är rätt.
> Varje ruta och linje måste kunna försvaras med en definition eller en
> verksamhetsregel.

## 3.2 Börja med syfte och avgränsning

Innan entitetstyper identifieras bör modellgruppen skriva två korta stycken:

1. **Syfte:** vilka beslut eller arbetsprocesser ska modellen stödja?
2. **Avgränsning:** vad ligger uttryckligen utanför modellen?

För Nordic Brews första modell:

> Modellen ska stödja registrering av kunder och beställningar samt visa vilka
> produkter, kvantiteter och avtalade priser som ingår i varje beställning.
> Lager, leveranser, betalningar, kampanjer och produktionspartier ligger tills
> vidare utanför.

Avgränsningen hindrar modellen från att växa genom fria associationer. Den kan
revideras senare, men varje tillägg ska ha ett informationsbehov.

### Frågor modellen ska kunna besvara

Komplettera syftet med exempel:

- Vem gjorde en viss beställning?
- Vilka produkter ingår i den?
- Hur många enheter beställdes?
- Vilket pris avtalades för varje produkt när ordern skapades?
- Vilka kunder har ännu inte gjort någon beställning?

Den sista frågan är viktig. Den visar att en kund får finnas utan en
beställning, vilket påverkar lägsta deltagande.

## 3.3 Verksamhetsspråk och begreppslista

Ord är inte automatiskt begrepp. Samma ord kan betyda olika saker, och olika
ord kan betyda samma sak. En **begreppslista** gör betydelsen förhandlingsbar.

| Term | Arbetsdefinition | Avgränsning/fråga |
| --- | --- | --- |
| Kund | Person eller organisation som kan göra en beställning | Är prospekt utan order kunder? Ja. |
| Beställning | Kundens åtagande att köpa minst en produkt vid en viss tidpunkt | Skiljs från betalning och leverans. |
| Produkt | Säljbar artikeltyp i sortimentet | En fysisk påse är inte en egen produktentitet. |
| Orderrad | En viss produkts kvantitet och avtalade pris i en viss beställning | Samma produkt får högst en orderrad per beställning. |

Begreppslistan och diagrammet måste säga samma sak. Om listan säger att en
beställning innehåller minst en produkt men diagrammet tillåter noll orderrader
har modellen en intern motsägelse.

## 3.4 Entitetstyp och entitet

En **entitet** är ett individuellt fenomen som modellen behöver kunna skilja
från andra, exempelvis den beställning som Nordic Brew betecknar `1042`.

En **entitetstyp** beskriver en mängd likartade entiteter med gemensam betydelse
och regler, exempelvis `BESTÄLLNING`. Namnge entitetstyper i singular:
`KUND`, inte `KUNDER`.

Det behöver inte vara ett fysiskt ting. Ett avtal, en bokning eller ett
kurstillfälle kan vara en entitet om verksamheten behöver identifiera och hålla
reda på individuella förekomster.

### Kandidat eller attribut?

Ett substantiv i en kravtext är inte automatiskt en entitetstyp. Fråga:

- Behöver individuella förekomster kunna identifieras?
- Har fenomenet egna egenskaper?
- Deltar det i associationer?
- Har det en egen livscykel eller egna regler?
- Behöver flera andra objekt hänvisa till samma förekomst?

”Färg” kan vara ett enkelt produktattribut i en modell och en egen entitetstyp
med kod, namn och tillåtna kombinationer i en annan.

## 3.5 Attribut och identifierare

Ett **attribut** beskriver en egenskap hos en entitetstyp eller, i vissa
notationer, hos en association. För `BESTÄLLNING` kan `Orderdatum` och `Status`
vara attribut.

En **identifierare** är ett eller flera attribut som verksamheten använder för
att skilja entiteter av samma typ. I den konceptuella modellen talar vi om
identifierare, inte primärnycklar. Primärnyckel är ett beslut i
relationsmodellen och implementationen.

Exempel:

```text
BESTÄLLNING
Identifierare: Ordernummer
Attribut: Orderdatum, Status
```

En identifierare behöver valideras mot verksamheten. ”Namn” räcker sällan för
personer eller produkter. Telefonnummer och e-postadresser kan ändras och är
inte alltid tillgängliga när entiteten först skapas.

### Enkla, sammansatta och härledda attribut

- Ett **enkelt attribut** behandlas som ett värde i modellen, exempelvis
  `Orderdatum`.
- Ett **sammansatt attribut** har relevanta delar, exempelvis en adress med
  gata, postnummer och land.
- Ett **härlett attribut** kan beräknas från andra uppgifter, exempelvis en
  ordertotal från orderradernas kvantitet och pris.

Härledda värden ska normalt inte lagras dubbelt utan skäl. Ibland behövs en
historisk ögonblicksbild eller prestandaoptimering, men då måste regeln för att
hålla kopiorna samstämmiga vara tydlig.

### Flervärda egenskaper

Om en kund kan ha flera telefonnummer är en avgränsad textsträng sällan ett bra
konceptuellt attribut när numren ska sökas eller märkas som exempelvis mobil och
arbete. Modellera då `TELEFONKONTAKT` som en egen entitetstyp eller använd en
flervärdesnotation som senare översätts till en egen relation.

## 3.6 Associationer

En **association** uttrycker att entiteter har ett verksamhetsmässigt samband.
Namnge den gärna med ett verb som kan läsas i en mening:

```text
KUND gör BESTÄLLNING
BESTÄLLNING innehåller ORDERRAD
ORDERRAD avser PRODUKT
```

Att två entitetstyper råkar dela ett ord eller senare får matchande värden är
inte tillräckligt. Associationen ska motsvara en definierad regel.

### Association eller händelse?

Vissa samband har egna egenskaper och en egen livscykel. En kursdeltagare
*registreras på* ett kurstillfälle, och registreringen kan ha datum, status och
betyg. Då är `REGISTRERING` ofta bättre som en associativ entitetstyp än en
namnlös linje.

## 3.7 Multiplicitet: minsta och största deltagande

För varje associationsände behöver vi fråga två saker:

1. **Min:** måste en entitet delta, eller får den stå utan samband?
2. **Max:** får den ha samband med en eller flera entiteter av den andra typen?

I kompendiet skrivs svaret `min..max`:

- `0..1`: ingen eller en;
- `1..1`: exakt en;
- `0..*`: ingen, en eller flera;
- `1..*`: minst en, möjligen flera.

Orden *kardinalitet* och *deltagande* används olika i olika böcker. Här används
**multiplicitet** för hela intervallet. När enbart förhållandet 1:1, 1:N eller
M:N anges beskriver det endast maximum och är därför ofullständigt.

<figure class="figure">
  <img src="{{ '/assets/images/05-lasa-multiplicitet.svg' | relative_url }}"
       alt="Kund gör Beställning. Vid Kund står 1..1 och vid Beställning 0..stjärna. Pilar med frågor visar att varje beställning görs av exakt en kund och att varje kund kan göra noll eller flera beställningar." />
  <figcaption><strong>Figur 3.1.</strong> Läs en ände i taget. Talet nära KUND besvarar hur många kunder en beställning hör till; talet nära BESTÄLLNING besvarar hur många beställningar en kund kan göra.</figcaption>
</figure>

### Läsmetod

För associationen i figur 3.1:

- välj en beställning och läs mot kundänden: beställningen görs av `1..1` kund;
- välj en kund och läs mot beställningsänden: kunden gör `0..*`
  beställningar.

Skriv båda meningarna. Det förebygger den vanligaste typen av spegelvänt
kardinalitetsfel.

### Frågor som avslöjar minimum

- Kan kunden registreras innan första beställningen? Då är beställningsänden
  sannolikt `0..*` för en kund.
- Kan en beställning sparas som tomt utkast? Om ja kan orderradens minimum vara
  0 i ett visst tillstånd; om nej är det 1.
- Får en produkt finnas i sortimentet utan att någonsin ha beställts? Då är
  deltagandet i orderrader valfritt för produkten.

Minimum kan bero på tid och status. Om utkast får vara tomma men bekräftade
beställningar måste ha rader behöver modellen eller kompletterande regler
uttrycka båda tillstånden.

## 3.8 Tre vanliga associationsformer

### 1:1

Varje entitet av typen A hör till högst en B och varje B till högst en A.
Exempel kan vara person och ett visst slags aktivt medlemskort. En 1:1-modell
ska ifrågasättas: är begreppen egentligen två aspekter av samma entitet, eller
behöver de skiljas på grund av olika livscykel, sekretess eller frivillighet?

Ett framtida relationsschema ska normalt inte få två ömsesidiga främmande
nycklar. Kapitel 4 visar hur en riktning väljs och skyddas med unikhet.

### 1:N

En kund kan göra flera beställningar, medan varje beställning görs av en kund.
Detta är en 1:N-association när vi endast betraktar maximum.

### M:N

En beställning kan innehålla flera produkter och en produkt kan förekomma i
flera beställningar. Sambandet har dessutom egna egenskaper: kvantitet och
avtalat pris. Det modelleras därför som den associativa entitetstypen
`ORDERRAD`.

## 3.9 Den associativa entitetstypen ORDERRAD

En orderrad existerar genom kombinationen av en beställning och en produkt, men
är mer än en teknisk koppling. Den uttrycker ett affärsfaktum:

> I beställning 1042 avtalades två enheter av produkt 501 till 12 900 öre per
> styck.

`Antal` och `AvtalatStyckpris` hör varken till produkten ensam eller
beställningen ensam. De beror på kombinationen.

Om samma produkt får förekomma högst en gång per order kan kombinationen
`Beställning + Produkt` fungera som konceptuell identifierare för
`ORDERRAD`. Om flera rader för samma produkt ska tillåtas, exempelvis med olika
rabatt eller leveransdatum, behövs en annan identifieringsregel.

{: .mistake }
> Lägg inte `Produkt1`, `Produkt2`, `Produkt3` som attribut i BESTÄLLNING. Det
> sätter ett godtyckligt tak, upprepar samma betydelse och gör frågor samt
> integritetskontroll svårare.

## 3.10 Genomarbetat exempel: Nordic Brews ordermodell

### Steg 1: källtext

> Nordic Brew registrerar kunder även innan de har handlat. Varje kund får ett
> kundnummer och anger ett namn samt en unik e-postadress. En kund kan göra
> flera beställningar, men varje beställning görs av exakt en kund. En
> beställning identifieras med ordernummer och har orderdatum samt status. En
> registrerad beställning innehåller minst en orderrad. Varje orderrad avser exakt
> en produkt och anger positiv kvantitet samt det pris som avtalades. En produkt
> kan finnas i sortimentet utan att ännu ha beställts. Samma produkt får
> förekomma högst en gång per beställning.

### Steg 2: påståenden och öppna frågor

| Påstående | Modellkonsekvens | Öppen fråga |
| --- | --- | --- |
| Kund registreras före köp | KUND deltar `0..*` i beställningar | Får e-post saknas tillfälligt? |
| Varje beställning har exakt en kund | BESTÄLLNING deltar obligatoriskt mot KUND | Kan en kund raderas med historik kvar? |
| Registrerad order har minst en rad | BESTÄLLNING deltar `1..*` mot ORDERRAD | Behöver tomma arbetsutkast lagras utanför modellen? |
| Produkt kan vara obeställd | PRODUKT deltar `0..*` i orderrader | Hur markeras utgången produkt? |
| Pris avtalas per rad | `AvtalatStyckpris` hör till ORDERRAD | Inklusive eller exklusive moms? |

En modellgrupp bör inte fylla de öppna frågorna med egna antaganden och sedan
glömma dem. Antaganden märks, verifieras med verksamhetsrepresentant och förs in
i begreppslistan.

### Steg 3: modellen

<figure class="figure">
  <img src="{{ '/assets/images/06-konceptuell-modell-nordicbrew.svg' | relative_url }}"
       alt="Konceptuell ER-modell med KUND, BESTÄLLNING, ORDERRAD och PRODUKT. En kund gör noll eller flera beställningar och varje beställning har exakt en kund. En beställning innehåller en eller flera orderrader, varje orderrad tillhör exakt en beställning. En produkt kan förekomma i noll eller flera orderrader, varje orderrad avser exakt en produkt." />
  <figcaption><strong>Figur 3.2.</strong> Konceptuell modell för orderområdet. Attribut märkta ID är verksamhetsidentifierare. Modellen innehåller inga främmande nycklar.</figcaption>
</figure>

Modellen uttrycker:

- `KUND` identifieras av `Kundnummer`;
- `BESTÄLLNING` identifieras av `Ordernummer`;
- `PRODUKT` identifieras av `Produktnummer`;
- `ORDERRAD` identifieras av kombinationen beställning och produkt;
- en kund gör `0..*` beställningar; varje beställning görs av `1..1` kund;
- en beställning innehåller `1..*` orderrader; varje orderrad hör till `1..1`
  beställning;
- en produkt förekommer i `0..*` orderrader; varje orderrad avser `1..1`
  produkt.

### Steg 4: scenariotest

Pröva modellen med konkreta händelser:

1. **Ny kund utan order:** tillåts av `0..*` vid BESTÄLLNING.
2. **Ny produkt utan försäljning:** tillåts av `0..*` vid ORDERRAD.
3. **Order utan kund:** förbjuds av `1..1` vid KUND.
4. **Registrerad order utan rader:** förbjuds av `1..*`. Om verksamheten senare
   kräver sparade tomma arbetsutkast behöver modellen utvidgas med en tydlig
   tillståndsregel.
5. **Samma produkt två gånger i en order:** förbjuds av identifieringsregeln för
   ORDERRAD.
6. **Listpriset ändras:** orderradens avtalade pris bevarar den historiska
   överenskommelsen.

Scenariotestet är en form av modellverifiering. Det visar att diagrammet följer
de skrivna reglerna. Det visar däremot inte att reglerna är de rätta för
verksamheten; det kräver validering med berörda aktörer.

## 3.11 När det finns flera rimliga modeller

### Leveransadress som attribut eller entitet

Tre möjliga lösningar:

1. `Leveransadress` är ett sammansatt attribut på BESTÄLLNING.
2. `ADRESS` är en egen entitetstyp och beställningen hänvisar till en adress.
3. Kunden har sparade adresser, men beställningen lagrar dessutom en historisk
   adressögonblicksbild.

Valet beror på krav:

- Ska samma adress återanvändas och administreras?
- Ska ändringar slå igenom på gamla beställningar?
- Behöver adressens giltighetstid eller typ hanteras?
- Finns juridiska krav på vad som ska bevaras?

Den enklaste modell som bevarar nödvändig betydelse är ofta bäst. ”Minst antal
entitetstyper” och ”mest normaliserat diagram” är inte mål i sig.

### Person eller kund?

Om bara köp är relevant kan `KUND` vara tillräckligt. Om samma person också är
anställd, kontaktperson för ett företag eller mottagare av marknadsföring kan en
mer generell `PERSON` med roller vara motiverad. Generalisering ska dock inte
införas enbart för att den verkar framtidssäker. Abstraktion utan ett känt behov
gör regler svårare att förstå.

## 3.12 Rekursiva associationer och roller

En entitetstyp kan associeras med sig själv. En anställd kan exempelvis vara
chef för andra anställda. Då behövs rollnamn:

```text
ANSTÄLLD (chef) leder (medarbetare) ANSTÄLLD
```

Frågorna blir:

- Hur många chefer kan en medarbetare ha?
- Får en anställd sakna chef?
- Hur många medarbetare kan en chef leda?
- Får en person indirekt bli sin egen chef genom en kedja?

Den sista regeln kan inte avläsas ur enkla ändmultipliciteter och behöver
dokumenteras separat.

## 3.13 En praktisk modelleringsmetod

Arbeta iterativt men lämna spår efter besluten.

### Steg A: formulera syfte och gräns

Skriv vilka processer och frågor modellen ska stödja. Lista uttryckligen vad som
inte ingår.

### Steg B: samla utsagor och exempel

Intervjuer, formulär, regler, befintliga filer och observationer kan vara
källor. Samla också motexempel och undantag. Ett tomt formulär visar möjliga
fält, inte nödvändigtvis verkliga regler.

### Steg C: bygg en begreppslista

Definiera termer med eget språk. Märk synonymer, homonymer och obesvarade
frågor. Undvik cirkulära definitioner som ”en kundorder är en order från en
kund” om varken kund eller order är definierad.

### Steg D: föreslå entitetstyper och identifierare

Motivera varje entitetstyp med informationsbehov och varje identifierare med
unikhet, stabilitet och tillgänglighet.

### Steg E: formulera associationer som två meningar

För varje association, skriv en mening åt vardera riktningen och ange min/max.
Exempel:

> En kund kan göra noll eller flera beställningar. Varje beställning görs av
> exakt en kund.

### Steg F: placera attribut

Fråga vilken entitet eller kombination som bestämmer värdet. Avtalat pris
bestäms av orderraden, inte av produkten ensam.

### Steg G: validera med CRUD och tidsfall

Pröva att skapa, läsa, ändra och avsluta/radera olika entiteter. Pröva också:

- före första associationen;
- under pågående process;
- efter statusändring;
- efter ändring av ett refererat objekt;
- vid historik och framtida planering.

### Steg H: dokumentera alternativ och beslut

För omstridda delar: skriv valt alternativ, minst ett avvisat alternativ,
argument och vilket krav som avgjorde. Detta är mer värdefullt än att göra
diagrammet visuellt perfekt utan motivering.

## 3.14 Vanliga modelleringsfel

### Främmande nycklar i den konceptuella modellen

Att skriva `KundID (FK)` i BESTÄLLNING har redan fattat ett logiskt och fysiskt
representationsbeslut. På konceptuell nivå räcker associationen och dess regler.

### Multiplicitet från dagens exempeldata

Att varje kund råkar ha en order i testfilen betyder inte `1..1`. Modellen ska
uttrycka tillåtna verksamhetstillstånd, inte bara det aktuella fotografiet.

### M:N utan sambandets egenskaper

En direkt association BESTÄLLNING–PRODUKT tappar kvantitet och avtalat pris om
dessa inte får en tydlig plats. Den associativa entitetstypen gör faktumet
synligt.

### Roller modelleras som separata personer

`KUND`, `ANSTÄLLD` och `LEVERANTÖRSKONTAKT` kan vara roller för samma person,
men behöver inte alltid sammanslås. Problemet ska analyseras, inte avgöras av
ordformen.

### Historik blandas med nuläge

`Produkt.Listpris` svarar på aktuellt pris. `Orderrad.AvtalatStyckpris` svarar
på historiskt avtalat pris. Att bara lagra det första förändrar betydelsen av
gamla ordervärden.

### Onödigt 1:1

Två entitetstyper med exakt samma livscykel och obligatorisk 1:1-association kan
vara en enda entitetstyp. De kan ändå behöva skiljas åt vid olika behörighet,
valfri del, annan livscykel eller oberoende identitet.

## 3.15 Övning A: evenemangsbokning

Ett kulturhus beskriver sitt behov:

> Kulturhuset arrangerar evenemang i salar. Ett evenemang kan ha flera
> föreställningstillfällen och varje tillfälle äger rum i exakt en sal. En sal
> kan naturligtvis användas för många tillfällen, men två tillfällen får inte
> överlappa i samma sal. Besökare kan boka en eller flera platser till ett
> tillfälle. En bokning görs av en besökare och kan omfatta flera biljetter med
> olika priskategorier. Vissa gratisevenemang kräver ingen bokning.

{: .exercise }
> 1. Skriv syfte och avgränsning i två–fyra meningar.
> 2. Skapa en begreppslista med minst sex termer och två öppna frågor.
> 3. Föreslå entitetstyper och konceptuella identifierare.
> 4. Skriv varje association som två riktningsmeningar med `min..max`.
> 5. Placera biljettens priskategori och faktiskt betalda pris. Motivera.
> 6. Förklara varför regeln om överlappande tillfällen inte uttrycks fullständigt
>    av en enkel 1:N-association mellan SAL och TILLFÄLLE.

<details class="answer">
<summary>Kontrollpunkter för egen granskning</summary>

En rimlig kärna innehåller `EVENEMANG`, `TILLFÄLLE`, `SAL`, `BESÖKARE`,
`BOKNING` och `BILJETT` eller en associativ bokningsrad. Skilj evenemanget som
programobjekt från det tidsatta tillfället. Faktiskt betalt pris behöver normalt
bevaras på biljetten/bokningsraden, medan priskategorins aktuella standardpris
kan ligga på en kategori. Texten klargör inte om numrerade sittplatser finns,
om en bokning får avse flera tillfällen eller hur avbokning fungerar; sådana
frågor ska synliggöras.

Multipliciteten SAL–TILLFÄLLE säger hur många samband som får finnas, men inte
att tidsintervall för två olika tillfällen i samma sal måste vara disjunkta.
</details>

## 3.16 Övning B: kritisera en modell

En student föreslår:

```text
KUND(KundID PK, Namn, Produkt1, Produkt2)
BESTÄLLNING(OrderID PK, KundID FK, ProduktID FK, Antal)
PRODUKT(ProduktID PK, Namn, OrderID FK)
```

{: .exercise }
> Identifiera minst sex problem, varav minst två ska vara problem på
> konceptuell nivå och minst två ska gälla att nivåer har blandats. Skriv sedan
> fyra verksamhetsfrågor som måste besvaras innan en ny modell kan fastställas.

<details class="answer">
<summary>Exempel på kritik</summary>

- Förslaget är relationsscheman, inte en konceptuell modell.
- `PK` och `FK` hör inte hemma i ett konceptuellt diagram.
- `Produkt1` och `Produkt2` upprepar samma betydelse och begränsar antalet.
- Det är oklart om en beställning får innehålla flera produkter.
- `ProduktID` direkt i BESTÄLLNING räcker inte för flera orderrader.
- `OrderID` i PRODUKT antyder felaktigt att en produkt hör till en order och
  skapar eventuellt ömsesidiga referenser.
- Avtalat pris saknas och produktens namn verkar inte skyddat från oavsiktliga
  dubletter.
- `KUND` blandar kundegenskaper med beställningsinnehåll.

Frågor bör bland annat gälla min/max i båda riktningar, om samma produkt får
förekomma flera gånger per order, vilket pris som ska bevaras och om kunder samt
produkter får finnas utan order.
</details>

## 3.17 Kontrollfrågor

1. Varför är ett substantiv i en kravtext inte automatiskt en entitetstyp?
2. Vad är skillnaden mellan en konceptuell identifierare och en primärnyckel?
3. Hur läser du `1..1` vid KUND-änden och `0..*` vid BESTÄLLNING-änden?
4. Vad går förlorat om en M:N-association mellan order och produkt saknar en
   plats för kvantitet och avtalat pris?
5. Ge ett exempel där en 1:1-association bör ifrågasättas men ändå kan vara
   motiverad.
6. Vad är skillnaden mellan att verifiera modellen mot skrivna regler och att
   validera reglerna mot verksamheten?
7. Varför måste en modell prövas över tid och inte bara mot nulägets data?

<details class="answer">
<summary>Korta svar</summary>

1. Ordet kan vara synonym, roll, attribut eller irrelevant; entitetstypen
   kräver identitet, betydelse och informationsbehov.
2. Identifieraren uttrycker verksamhetsmässig igenkänning på konceptuell nivå;
   primärnyckeln väljs i relationsdesign/implementation och kan vara
   artificiell.
3. Varje beställning hör till exakt en kund; varje kund kan göra noll eller
   flera beställningar.
4. Sambandets egna fakta saknar korrekt hemvist och historiskt pris riskerar att
   blandas med produktens aktuella pris.
5. Exempelvis separat profil för en person när profilen är valfri, har annan
   behörighet eller annan livscykel.
6. Verifiering frågar om modellen följer specifikationen; validering frågar om
   specifikationen/modellen motsvarar det verkliga behovet.
7. Identifierare, deltagande, status och historik kan förändras; dagens data
   visar inte alla tillåtna framtida tillstånd.
</details>

## 3.18 Sammanfattning

- Konceptuell modellering uttrycker ett avgränsat informationsbehov utan att
  först bestämma tabeller eller SQL.
- En modell är ett prövbart påstående om begrepp och verksamhetsregler.
- Entitetstyper beskriver slag av identifierbara fenomen; attribut beskriver
  egenskaper; associationer beskriver samband.
- Konceptuella identifierare ska inte blandas ihop med primär- och främmande
  nycklar.
- Multiplicitet måste läsas i båda riktningarna med både minimum och maximum.
- M:N-samband med egna egenskaper modelleras tydligt med en associativ
  entitetstyp.
- Begreppslista, öppna frågor, scenarioanalys och beslutslogg är lika viktiga
  som själva diagrammet.
- Flera modeller kan vara möjliga; kvalitet avgörs av syfte, betydelse,
  konsekvenser och evidens.

## Vidare läsning

- Object Management Group, [UML 2.5.1
  specification](https://www.omg.org/spec/UML/2.5.1/) (formell fördjupning;
  kompendiet använder endast en liten del av notationstänkandet).
- ISO/IEC/IEEE 42010:2022, *Architecture description* (för perspektiv på
  intressenter och modeller; inte kurskrav).
- Elmasri, R. & Navathe, S., *Fundamentals of Database Systems*, avsnitt om
  konceptuell datamodellering.
