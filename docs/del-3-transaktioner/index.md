---
layout: default
title: Del III – Transaktioner och samtidighet
nav_order: 4
has_children: true
has_toc: false
permalink: /docs/del-3-transaktioner/
description: Transaktioner, återställning och problem som kan uppstå när flera databasanslutningar arbetar samtidigt.
keywords:
  - transaktion
  - samtidighet
  - ACID
  - isolation
  - SQLite
---

# Del III – Transaktioner och samtidighet

En korrekt `UPDATE` är inte tillräcklig när en verksamhetshändelse kräver flera
sammanhängande förändringar eller när flera användare arbetar samtidigt. Den här
delen behandlar därför transaktionen som en gräns för vad som ska lyckas eller
misslyckas tillsammans. Därefter undersöks hur överlappande transaktioner kan
påverka varandras resultat.

| Kapitel | Fokus |
| --- | --- |
| [18. Transaktioner som sammanhållna enheter]({{ '/docs/del-3-transaktioner/transaktioner-som-sammanhallna-enheter/' | relative_url }}) | Låt sammanhörande ändringar lyckas eller återställas tillsammans. |
| [19. Samtidighet och transaktionsproblem]({{ '/docs/del-3-transaktioner/samtidighet-och-transaktionsproblem/' | relative_url }}) | Följ lokala läsvärden, skrivna värden och <code>COMMIT</code> var för sig. |
| [20. Samtidighetskontroll med lås]({{ '/docs/del-3-transaktioner/samtidighetskontroll-med-las/' | relative_url }}) | Visa exakt var ett lås stoppar ett felaktigt förlopp. |

Kapitlen skiljer på de generella transaktionsprinciperna och SQLite-systemets konkreta beteende. Grundövningarna använder scheman som kan följas direkt i boken. Ett valbart terminalexperiment visar SQLite-beteende utan att dess låsmekanism förväxlas med den abstrakta modellen.