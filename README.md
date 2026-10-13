# Databaskompendium 2IS007

Ett GitHub Pages-kompatibelt Jekyll-repository för ett webbaserat kompendium
till **Informationssystem A: Databaser (2IS007)**.

Plattformen använder Just the Docs 0.12.0 men lägger till en egen
informationsarkitektur, användarstyrt färgtema, svensk sökkonfiguration,
ämnesord och automatiska innehålls- och SQL-kontroller.

## Lokal start

Förutsättningar: projektets Ruby-version, Bundler, Python 3 och Node.js.

```bash
bundle install
bundle exec just-the-docs rake search:init
python3 scripts/validate_site.py
python3 scripts/validate_sql.py
node scripts/test_theme_toggle.js
node scripts/test_transaction_lab.js
bundle exec jekyll clean
bundle exec jekyll serve
```

Öppna därefter `http://localhost:4000`.

Sökindexets källfil genereras av `search:init` och behöver inte skrivas för
hand. `Gemfile.lock` ska däremot vara incheckad så att lokala byggen och
GitHub Actions använder samma versioner.

## Innehåll

- [Del I – Modeller och relationer](docs/del-1-grunder/index.md)
- [Del II – Frågor och förändring](docs/del-2-fragor/index.md)
- [Del III – Transaktioner och samtidighet](docs/del-3-transaktioner/index.md)
- [Del IV – Åtkomst, ansvar och perspektiv](docs/del-4-perspektiv/index.md)
- [Kör SQL-exemplen](docs/arbeta-praktiskt.md)
- [Om kompendiet](docs/om/om-kompendiet.md)
- [Användningsvillkor](LICENSE.md)

Valideringsskripten publiceras inte av Jekyll.

Efter ett produktionsbygge kan den renderade sökfilen och sidstrukturen kontrolleras med:

```bash
bundle exec jekyll build
python3 scripts/validate_built_site.py
```

Källkontrollen validerar även lokala sidlänkar och grundläggande innehållsstruktur. SQL-kontrollen prövar startfiler, förväntade frågeresultat, integritetsvillkor och ett verkligt SQLite-förlopp med två anslutningar. Ämnesplanering och läraranteckningar förvaras separat från detta repository.