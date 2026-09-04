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

Kompendiet är kursens sammanhållna kunskapskälla för grundläggande
databasteknik. Det ersätter **inte** praktiskt arbete eller återkoppling, utan gör det istället möjligt att förbereda, genomföra och repetera kursens moment i din egen takt.

## Pedagogisk princip

Nordic Brew används som ett återkommande fall genom kompendiet vilket gör det möjligt att följa samma informationsbehov från konceptuell modell till relationsschema, SQL, transaktioner och fysisk åtkomst.

Varje kärnkapitel innehåller dock samtidigt minst en uppgift inom en annan domän såsom exempelvis vård, kultur, föreningsliv, offentlig förvaltning, logistik och utbildning vilka alla kan ha andra regler, risker och identifieringsproblem. Tanken med det återkommande fallet är att det ska  stödja progression medan variationsfallen istället ska pröva om kunskapen går att överföra mellan domäner.

## Konceptuell modellering före diagramsyntax

ER-diagram används som notation, men kursens mål är inte att memorera en viss
uppsättning symboler. Du som student förväntas istället kunna:

- avgränsa ett informationsbehov
- definiera begrepp och identifierare
- formulera prövbara verksamhetsregler
- uttrycka associationer och deltagande
- jämföra modeller och diskutera deras konsekvenser

Kompendiets huvudnotation visar entitetstyper som rutor med ett begränsat urval
attribut och konceptuella identifierare medan associationer ges verbnamn och
multiplicitet uttrycks som `0..1`, `1..1`, `0..*` eller `1..*`. Crow's
foot notation introduceras även som en alternativ syntax.

Primärnycklar, främmande nycklar, SQL-datatyper och index hör dock inte hemma i den konceptuella modellen och introduceras därför först i samband med att modellen översätts och implementeras.

## Användning och hänvisning

Kompendiet är avsett att vara fritt tillgängligt. Slutliga licensvillkor anges
före publik lansering. Oavsett licens ska den som återger eller bearbetar
materialet tydligt ange källa och upphovsperson enligt god akademisk sed.

