---
layout: default
title: 2. Varför databaser?
parent: Del I – Modeller och relationer
nav_order: 2
permalink: /docs/del-1-grunder/varfor-databaser/
description: Varför gemensamma och föränderliga data ofta behöver en databas.
keywords:
  - databas
  - database
  - DBMS
  - databashanteringssystem
  - informationssystem
  - kalkylblad
  - fil
---

# 2. Varför databaser?

Nordic Brew började med tre kalkylblad: ett för kunder, ett för produkter och
ett för beställningar. Det fungerade när en person skötte allt. När företaget
växte uppstod frågor:

- Vilken av filkopiorna är den senaste?
- Vad händer om två personer ändrar samtidigt?
- Hur förhindras en beställning för en produkt som inte finns?
- Hur hittar man alla beställningar från en viss kund?

En databas är relevant när sammanhörande data behöver delas, förändras och
kontrolleras över tid.

<div class="learning-objectives" markdown="1">
## Efter kapitlet kan du

- förklara vilket problem en databas är avsedd att lösa;
- skilja mellan databas, databashanteringssystem och applikation;
- motivera när ett kalkylblad räcker och när en databas är rimligare.
</div>

## 2.1 När flera filer beskriver samma sak

Anta att kundens e-postadress förekommer i kundfilen, i varje orderfil och i en
separat adresslista. När adressen ändras måste alla kopior hittas. Om en kopia
missas får verksamheten motstridiga uppgifter.

<figure class="figure">
  <img src="{{ '/assets/images/03-kopior-eller-gemensam-databas.svg' | relative_url }}"
       alt="Tre separata filer innehåller olika e-postadresser för samma kund och jämförs med en gemensam databas som används av tre arbetsuppgifter."
       width="1040" height="500" loading="eager" decoding="async">
  <figcaption><strong>Figur 2.1.</strong> Dubbletter är särskilt problematiska när kopiorna kan ändras oberoende av varandra.</figcaption>
</figure>

En gemensam databas innebär inte att alla problem försvinner. Någon måste
fortfarande bestämma vad ”kund” betyder och vilka regler som gäller. Databasen
ger däremot en gemensam plats där strukturen och reglerna kan upprätthållas.

## 2.2 En första definition

En **databas** är en organiserad och varaktig samling relaterade data, utformad
för ett bestämt användningsområde.

- **Organiserad** betyder att data följer en uttalad struktur.
- **Varaktig** betyder att innehållet finns kvar när programmet stängs.
- **Relaterad** betyder att olika uppgifter hör samman, som kund och order.
- **Användningsområde** betyder att strukturen har ett syfte.

En mapp med slumpmässiga dokument är därför inte automatiskt en väl utformad
databas. En liten databas med tre tabeller kan däremot vara värdefull om den
stödjer rätt frågor och regler.

## 2.3 Databasen och programmet som hanterar den

Databasen ska inte blandas ihop med programvaran som arbetar med den.

Ett **databashanteringssystem** kallas ofta **DBMS** efter engelskans *database
management system*. Ett DBMS kan skapa strukturer, lagra värden, söka,
kontrollera regler och spara ändringar.

I kursen använder vi SQLite som DBMS. En fil som `nordicbrew.sqlite` är en
databasfil. DB Browser for SQLite är en grafisk **klient** som låter dig skicka
kommandon till SQLite och se resultatet.

| Del | Exempel | Uppgift |
| --- | --- | --- |
| Databas | `nordicbrew.sqlite` | Innehåller struktur och data |
| DBMS | SQLite | Hanterar databasen |
| Klient | DB Browser for SQLite | Ger användaren ett gränssnitt |

<figure class="figure">
  <img src="{{ '/assets/images/04-databasens-delar.svg' | relative_url }}"
       alt="En användare arbetar i en klient som skickar frågor till SQLite, som i sin tur hanterar databasfilen."
       width="1040" height="430" loading="lazy" decoding="async">
  <figcaption><strong>Figur 2.2.</strong> Klienten, DBMS:et och databasen är olika delar även när de finns på samma dator.</figcaption>
</figure>

Skillnaden hjälper vid felsökning. Om knapparna har flyttats efter en
uppdatering är klienten förändrad. Om en fråga innehåller ett fel är det
kommandot eller DBMS-reglerna som behöver granskas. Om du öppnar fel fil kan
tabeller saknas trots att programmet fungerar.

## 2.4 Databasen är en del av ett informationssystem

Nordic Brews webbshop består inte bara av en databas. Kunder använder ett
gränssnitt, personalen följer arbetsrutiner och företaget har regler för bland
annat priser och leveranser. Tillsammans bildar människor, arbete, regler och
teknik ett **informationssystem**.

<figure class="figure">
  <img src="{{ '/assets/images/14-databas-i-informationssystem.svg' | relative_url }}"
       alt="Människor och arbetsprocesser använder en applikation som kommunicerar med ett DBMS och en databas. Verksamhetsregler påverkar alla delarna."
       width="1040" height="460" loading="lazy" decoding="async">
  <figcaption><strong>Figur 2.3.</strong> Databasen är en teknisk del i ett större informationssystem där människor, arbete och regler också ingår.</figcaption>
</figure>

Databasen är alltså inte hela systemet. En korrekt lagrad e-postadress hjälper
inte om personalen använder fel adressfält, och en teknisk regel kan inte på
egen hand avgöra vad verksamheten borde mena med en aktiv kund.

## 2.5 När räcker ett kalkylblad?

Kalkylblad och textfiler är inte dåliga verktyg. Ett kalkylblad kan vara bäst
för en begränsad analys som en person utför. En enkel fil kan vara bäst för
inställningar eller datautbyte.

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

En person, tjugo namn och få ändringar. Ett kalkylblad är sannolikt
tillräckligt.

### Bokningar till en vårdcentral

Många patienter, tider, yrkesroller och känsliga uppgifter. Flera personer kan
arbeta samtidigt och regler måste gälla konsekvent. En databas är rimlig, men
behöver ingå i ett betydligt större säkert informationssystem.

### Sensorvärden från ett växthus

Temperatur registreras varje minut under flera år. Datamängden och frågorna kan
motivera en databas, men lämplig databastyp beror på hur värdena ska användas.

## 2.7 Överföringsövning: studentföreningen

En studentförening har medlemslistan i ett kalkylblad, betalningar i en annan
fil och evenemangsanmälningar i formulärtjänsten.

1. Identifiera tre risker med upplägget.
2. Vilka data tycks höra samman?
3. Ge två skäl för en gemensam databas.
4. Ge ett skäl att ändå inte bygga en databas just nu.

## Kontrollfrågor

1. Vad skiljer databasen från ett DBMS?
2. Varför är databasen inte hela informationssystemet?
3. När kan ett kalkylblad vara ett bättre val?

<details class="answer">
  <summary>Korta svar</summary>
  <ol>
    <li>Databasen är den organiserade datasamlingen; DBMS:et är programvaran som hanterar den.</li>
    <li>Människor, arbetsprocesser, regler och andra program behövs också.</li>
    <li>När uppgiften är liten, avgränsad, sköts av få personer och inte kräver starka samband eller kontroller.</li>
  </ol>
</details>

## Sammanfattning

- Databaser hjälper oss att hantera gemensamma, relaterade och föränderliga data.
- Databas, DBMS och klient är olika delar.
- Databasen ingår i ett större informationssystem.
- Valet mellan fil, kalkylblad och databas måste motiveras av behovet.
