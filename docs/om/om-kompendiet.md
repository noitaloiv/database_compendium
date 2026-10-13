---
layout: default
title: Om kompendiet
nav_order: 10
permalink: /docs/om/om-kompendiet/
description: Kompendiets syfte, arbetssätt, notation och versionsprinciper.
keywords:
  - om kompendiet
  - studieteknik
  - notation
  - version
---

# Om kompendiet

Kompendiet är en sammanhållen introduktion till grundläggande databasteknik. Det
ersätter **inte** praktiskt arbete eller återkoppling, utan är utformat för att
kunna läsas, prövas och repeteras i egen takt.

## Pedagogisk princip

Nordic Brew återkommer för att du ska kunna följa samma uppgifter från betydelse och modell till SQL. Andra exempel från bland annat bibliotek, vårdbokningar, föreningar och museer ger tillfällen att pröva resonemanget med nya regler. När transaktioner introduceras följer vi en avgränsad lagerregistrering hos Nordic Brew, där ett saldo och en leveranspost måste ändras tillsammans. En kontoöverföring ger därefter ett annat sammanhang att pröva samma princip i.

[Läsvägen]({{ '/docs/lasvag/' | relative_url }}) visar grundspåret och de valbara fördjupningarna. Genomgångna exempel följs av mindre kompletteringsuppgifter och mer självständiga försök. Du kan stanna i ett avsnitt tills du kan förklara mellanresultatet, innan du lägger till nästa operation.

## Konceptuell modellering före diagramsyntax

ER-diagram används som notation, men modellering handlar inte främst om att
memorera en viss uppsättning symboler. Diagrammet blir användbart först när det
gör det möjligt att:

- avgränsa ett informationsbehov
- definiera begrepp och identifierare
- formulera prövbara verksamhetsregler
- uttrycka associationer och deltagande
- jämföra modeller och diskutera deras konsekvenser

Kompendiets huvudnotation visar entitetstyper som rutor med ett begränsat urval
attribut och konceptuella identifierare, medan associationer ges verbnamn och
multiplicitet uttrycks som `0..1`, `1..1`, `0..*` eller `1..*`. Crow's foot-
notation introduceras även som en alternativ syntax.

Primärnycklar, främmande nycklar, SQL-datatyper och index hör dock inte hemma i den konceptuella modellen och introduceras därför först i samband med att modellen översätts och implementeras.

## Praktiska övningar och facit

När en övning ska köras anger den vilket installationsskript och vilket
utgångsläge som behövs. Den gemensamma
[körguiden]({{ '/docs/arbeta-praktiskt/' | relative_url }}) visar hur en lokal
SQLite-databas skapas och återställs. Uppgifter som enbart ska lösas genom
resonemang märks i stället ut som sådana.

Kontrollfrågornas svar är hopfällda, så att du kan formulera ett eget resonemang innan du jämför med förklaringen. Svaren knyter slutsatsen till ett exempel och visar vilken skillnad som är avgörande. Om ditt svar avviker kan du därför undersöka vilket steg i resonemanget som behöver ändras. Öppna
modelleringsuppgifter har lösningsprinciper eller en möjlig lösning, eftersom
notationen sällan avgör ett enda korrekt verksamhetsbeslut.

## Användning och hänvisning

Kompendiet är kostnadsfritt att läsa och använda för personliga studier. Det är däremot inte fritt licensierat: återpublicering, distribution, översättning och bearbetning kräver skriftligt tillstånd. Begränsade citat får användas i den omfattning lagen medger, med tydlig källhänvisning.

[Läs de fullständiga användningsvillkoren]({{ '/anvandningsvillkor/' | relative_url }}).