---
layout: default
title: Del II – Frågor och förändring
nav_order: 3
has_children: true
has_toc: false
permalink: /docs/del-2-fragor/
keywords: [SQL, relationsalgebra, SELECT, JOIN, integritetsvillkor, förändringar]
---

# Del II – Frågor och förändring

När databasens struktur har fått en tydlig betydelse kan den användas för att
besvara frågor och registrera förändringar. Den här delen går från ett
informationsbehov till körbar SQL och visar därefter hur tabeller skapas samt
hur data läggs till, ändras och tas bort på ett kontrollerat sätt.

| Kapitel | Fokus |
| --- | --- |
| [10. Mängder och relationer]({{ '/docs/del-2-fragor/mangder-och-relationer/' | relative_url }}) | Skilj ett värde från en hel rad och kombinera två enkla mängder. |
| [11. Operationer på relationer]({{ '/docs/del-2-fragor/fran-informationsbehov-till-databasfraga/' | relative_url }}) | Beskriv urval och projektion med både tabeller och algebra. |
| [12. Hämta data med SQL]({{ '/docs/del-2-fragor/hamta-data-med-sql/' | relative_url }}) | Skriv och kontrollera en <code>SELECT</code>-fråga mot en tabell. |
| [13. Sammanfoga tabeller med <code>JOIN</code>]({{ '/docs/del-2-fragor/sammanfoga-tabeller-med-join/' | relative_url }}) | Följ ett matchande radpar i taget innan du kombinerar flera tabeller. |
| [14. Sammanfatta och gruppera data]({{ '/docs/del-2-fragor/sammanfatta-och-gruppera-data/' | relative_url }}) | Räkna och summera först hela underlaget, sedan en grupp i taget. |
| [15. Underfrågor och mängdoperationer]({{ '/docs/del-2-fragor/underfragor-och-mangdoperationer/' | relative_url }}) | Använd ett frågeresultat i en annan fråga eller jämför två resultat. |
| [16. Skapa tabeller och integritetsvillkor]({{ '/docs/del-2-fragor/skapa-tabeller-och-integritetsvillkor/' | relative_url }}) | Bygg en enkel tabell och lägg till en regel i taget. |
| [17. Förändra data med SQL]({{ '/docs/del-2-fragor/forandra-data-med-sql/' | relative_url }}) | Kontrollera vilka rader <code>INSERT</code>, <code>UPDATE</code> och <code>DELETE</code> påverkar. |

När delen är avslutad ska du kunna härleda en SQL-fråga från ett preciserat informationsbehov, tolka resultatet och genomföra avgränsade förändringar utan att kringgå databasens integritetsvillkor.