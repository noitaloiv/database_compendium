---
layout: default
track: grundspar
prerequisites: "Kapitel 1: värden behöver ett tolkningssammanhang."
focus: "Skilj databasen från programmet som hanterar den."
title: 2. Varför databaser?
parent: Del I – Modeller och relationer
nav_order: 2
permalink: /docs/del-1-grunder/varfor-databaser/
description: Varför gemensamma och föränderliga data ofta behöver en databas.
keywords:
  - databas
  - database
  - DBHS
  - databashanteringssystem
  - informationssystem
  - kalkylblad
  - fil
---

# 2. Varför databaser?

{% include chapter_guide.html %}

Nordic Brew började med tre kalkylblad: ett för kunder, ett för produkter och
ett för beställningar. Så länge en person skötte allt fungerade upplägget
rimligt väl, men när företaget växte blev sådant som tidigare hade kunnat lösas
informellt till gemensamma problem:

- Vilken av filkopiorna är den senaste?
- Vad händer om två personer ändrar samtidigt?
- Hur förhindras en beställning för en produkt som inte finns?
- Hur hittar man alla beställningar från en viss kund?

Frågorna har olika karaktär, men pekar mot samma behov: sammanhörande data
behöver kunna delas, förändras och kontrolleras över tid. Det är i sådana
situationer som en databas blir relevant.

## 2.1 När flera filer beskriver samma sak

Anta att kundens e-postadress förekommer både i kundfilen, i varje orderfil och
i en separat adresslista. När adressen ändras måste samtliga kopior hittas och
uppdateras; om bara en av dem missas får verksamheten flera motstridiga svar på
frågan vilken adress som är den aktuella.

<figure class="figure" id="figur-2-1">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 2.1, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/03-kopior-eller-gemensam-databas.svg' | relative_url }}" alt="Tre separata filer ger motstridiga e-postadresser. En gemensam kunduppgift kan användas av kundservice, webbshop och leverans." width="1040" height="500" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 2.1.</strong> Självständigt redigerbara kopior kan ge olika besked om samma aktuella adress. <a href="{{ '/assets/images/03-kopior-eller-gemensam-databas.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

En gemensam databas gör inte att problemen försvinner av sig själva. Någon
måste fortfarande bestämma vad ”kund” betyder, vilka uppgifter som ska lagras
och vilka regler som gäller. När dessa beslut väl har fattats ger databasen
däremot en gemensam plats där både innehåll och regler kan hanteras
konsekvent.

## 2.2 En första definition

En **databas** är en organiserad och varaktig samling relaterade data, utformad
för ett bestämt användningsområde. Att samlingen är *organiserad* innebär att
dess data följer en uttalad struktur, medan *varaktig* innebär att innehållet
finns kvar när ett program stängs. Ordet *relaterade* markerar samtidigt att
olika uppgifter hör samman, exempelvis en kund och kundens beställningar. Till
sist påminner det bestämda användningsområdet om att strukturen alltid bör ha
ett tydligt syfte.

En mapp med slumpmässiga dokument är därför inte automatiskt en väl utformad
databas. En liten databas med tre tabeller kan däremot vara värdefull om den
stödjer rätt frågor och regler.

## 2.3 Databasen och programmet som hanterar den

För att förstå hur vi arbetar med en databas behöver vi skilja det lagrade innehållet från programvaran som hanterar det. Jämför gärna med ett textdokument och programmet du öppnar det i: dokumentet och programmet hör ihop i arbetet, men har olika uppgifter.

Den programvara som skapar och hanterar databasens strukturer, lagrar värden och besvarar frågor kallas ett **databashanteringssystem**, förkortat **DBHS**. På engelska används *database management system*, **DBMS**. När innehållet förändras kan programvaran också kontrollera de regler som har angetts för databasen, exempelvis att en beställning hänvisar till en befintlig kund.

I exemplen använder vi SQLite för att hantera databasen. Själva strukturen och innehållet lagras då i en fil, exempelvis `nordicbrew.sqlite`. När vi vill öppna filen, skriva en fråga och se svaret kan vi använda ett grafiskt program som DB Browser for SQLite. Ett sådant gränssnitt kallas en **klient**. Klienten skickar vårt kommando till SQLite, som arbetar med databasfilen och lämnar tillbaka resultatet; alla tre kan därför finnas på samma dator utan att vara samma sak.

| Del | Exempel | Uppgift |
| --- | --- | --- |
| Databas | `nordicbrew.sqlite` | Innehåller struktur och data |
| DBHS | SQLite | Hanterar databasen |
| Klient | DB Browser for SQLite | Ger användaren ett gränssnitt |

<figure class="figure" id="figur-2-2">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 2.2, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/04-databasens-delar.svg' | relative_url }}" alt="Användaren arbetar i en klient. Klienten skickar frågor till SQLite, som hanterar strukturen och innehållet i databasfilen." width="1040" height="430" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 2.2.</strong> Klient, DBHS och databas har olika uppgifter även när de finns på samma dator. <a href="{{ '/assets/images/04-databasens-delar.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Skillnaden blir särskilt användbar vid felsökning. Om knapparna har flyttats
efter en uppdatering är det klienten som har förändrats, medan ett felaktigt
kommando i stället behöver förstås utifrån den fråga som skickades och de
regler som DBHS:et tillämpar. Det är också möjligt att både klient och DBHS
fungerar korrekt trots att tabeller saknas, helt enkelt därför att fel
databasfil har öppnats.

## 2.4 Databasen är en del av ett informationssystem

Nordic Brews webbshop omfattar mer än själva databasen. För att en beställning ska kunna tas emot behöver kunden ett gränssnitt att använda, personalen behöver arbetsrutiner och företaget behöver regler för exempelvis priser och leveranser. Det är denna helhet av människor, arbete, regler och teknik som vi kallar ett **informationssystem**.

<figure class="figure" id="figur-2-3">
  <div class="figure-viewport" tabindex="0" role="region" aria-label="Figur 2.3, rulla vid behov i sidled" style="--figure-width: 900px">
    <img src="{{ '/assets/images/14-databas-i-informationssystem.svg' | relative_url }}" alt="Människor och arbetsprocesser, applikation, DBHS och databas ingår tillsammans i ett informationssystem med regler och ansvar." width="1040" height="460" loading="lazy" decoding="async">
  </div>
  <figcaption><strong>Figur 2.3.</strong> Databasen ingår i ett informationssystem som också omfattar människors arbete och verksamhetens regler. <a href="{{ '/assets/images/14-databas-i-informationssystem.svg' | relative_url }}">Visa figuren separat</a>.</figcaption>
</figure>

Skillnaden får praktiska följder. Om personalen använder fel e-postadressfält hjälper det inte att värdena är korrekt lagrade, och om två avdelningar menar olika saker med "aktiv kund" kan en gemensam databas inte själv avgöra vilken definition som ska gälla. För att den lagrade informationen ska bli användbar behöver människorna därför komma överens om både betydelser och arbetsrutiner.

## 2.5 När räcker ett kalkylblad?

Kalkylblad och textfiler är inte dåliga verktyg bara för att de saknar ett
databashanteringssystem. Ett kalkylblad kan vara det enklaste valet för en
begränsad analys som en person utför, medan en vanlig fil kan passa väl för
inställningar eller datautbyte. Bedömningen behöver därför utgå från uppgiften,
inte från en generell rangordning av teknikerna.

En databas blir särskilt rimlig när flera av följande påståenden stämmer:

- flera personer eller program använder samma data;
- innehållet förändras ofta;
- olika slags data måste kopplas samman;
- felaktiga hänvisningar måste förhindras;
- många olika frågor ska kunna ställas;
- historik eller ansvar är viktigt.

{: .mistake }
> ”Databas” betyder inte automatiskt ”bättre”. Verktyget är motiverat av
> informationsbehovet, inte av hur tekniskt avancerat det verkar.

## 2.6 Tre jämförelser

### Gästlista till en privat middag

Om en person hanterar tjugo namn och listan bara ändras vid några få tillfällen
är ett kalkylblad sannolikt tillräckligt. En databas skulle kunna användas, men
den extra strukturen skulle knappast lösa något viktigt problem.

### Bokningar till en vårdcentral

På en vårdcentral behöver däremot många patienter, tider, yrkesroller och
känsliga uppgifter hanteras samtidigt. Eftersom flera personer kan arbeta med
samma information och regler måste gälla konsekvent är en databas rimlig. Den
måste samtidigt ingå i ett betydligt större informationssystem med lämpliga
säkerhetsåtgärder och arbetsrutiner.

### Sensorvärden från ett växthus

När temperaturen i ett växthus registreras varje minut under flera år kan både
datamängden och de frågor som ska ställas mot den motivera en databas. Vilken
typ av databas som passar bäst går däremot inte att avgöra enbart utifrån
mängden data, utan beror också på hur värdena ska sökas, sammanställas och
bevaras.

## 2.7 Överföringsövning: studentföreningen

En studentförening har medlemslistan i ett kalkylblad, betalningar i en annan
fil och evenemangsanmälningar i formulärtjänsten.

1. Identifiera tre risker med upplägget.
2. Vilka data tycks höra samman?
3. Ge två skäl för en gemensam databas.
4. Ge ett skäl att ändå inte bygga en databas just nu.

<details class="answer" markdown="1">
<summary>Lösningsförslag till överföringsövningen</summary>

När föreningen använder flera separata filer kan samma medlemsnamn stavas olika, en betalning kopplas till fel person och en adressändring bli kvar i bara några av kopiorna. Problemen hänger ihop med att det saknas ett tillförlitligt sätt att följa samma medlem mellan filerna. Genom att identifiera medlemmen konsekvent och koppla betalningar och evenemangsanmälningar till den identifieraren kan föreningen skapa ett gemensamt underlag där uppgifterna går att kontrollera tillsammans.

Det kan ändå vara rimligt att avvakta om verksamheten är liten, bara en person uppdaterar filerna och det saknas möjlighet att förvalta ett nytt system. Då kan gemensamma identifierare och tydliga rutiner i det befintliga upplägget vara ett första steg. Databasen avgör inte själv vem som räknas som medlem eller om en betalning är korrekt: definitioner, behörigheter och arbetsrutiner behövs fortfarande.
</details>

## Innan du går vidare

Anta att ett bokningsprogram stängs. Försvinner bokningarna då? Förklara hur svaret beror på att programmet och den lagrade databasen är olika delar.

## Kontrollfrågor

1. Vad skiljer databasen från ett DBHS?
2. Varför är databasen inte hela informationssystemet?
3. När kan ett kalkylblad vara ett bättre val?

<details class="answer" markdown="1">
<summary>Svar med förklaringar</summary>

1. Databasen är det organiserade innehållet och dess struktur, medan databashanteringssystemet, DBHS:et, är programvaran som hanterar detta. I övningarna ligger databasen i en fil och SQLite läser eller förändrar den. Ett grafiskt klientprogram ger oss i sin tur ett gränssnitt till arbetet. Det är olika uppgifter även när alla delarna finns på samma dator.

2. Informationssystemet omfattar också människor, arbetsrutiner, regler och annan teknik. Databasen kan lagra att en leverans registrerats, men personalen behöver veta när och hur registreringen ska göras och vilket underlag som ska kontrolleras. En fungerande databas är därför en del av lösningen, samtidigt som verksamhetens arbete måste organiseras runt den.

3. Ett kalkylblad kan vara ett rimligt val för ett litet, avgränsat underlag som en person bearbetar och där sambanden och kontrollbehoven är enkla. Om arbetet däremot kräver många gemensamma registreringar, samtidiga ändringar och kontroller mellan olika uppgifter kan ett DBHS ge bättre stöd. Valet bör följa behovet, inte föreställningen att en databas alltid är bättre.

</details>

## Sammanfattning

En databas samlar relaterade uppgifter som behöver kunna användas och förändras över tid. För att arbeta med samlingen används ett DBHS, som hanterar innehållet, och ofta en klient, som låter användaren skicka kommandon och se resultat. Dessa tekniska delar ingår i sin tur i ett informationssystem tillsammans med människor, regler och rutiner. Ett gemensamt register behöver därför också ett gemensamt ansvar för vad som registreras och hur det används.