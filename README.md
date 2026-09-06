# Databaskompendium 2IS007 – plattform v1

Ett GitHub Pages-kompatibelt Jekyll-repository för ett webbaserat kompendium
till **Informationssystem A: Databaser (2IS007)**.

Plattformen använder Just the Docs 0.12.0 men lägger till en egen
informationsarkitektur, användarstyrt färgtema, svensk sökkonfiguration,
ämnesord och automatiska innehålls- och SQL-kontroller.

## Lokal start

Förutsättningar: Ruby, Bundler och Python 3.

```bash
bundle install
bundle exec just-the-docs rake search:init
python3 scripts/validate_site.py
python3 scripts/validate_sql.py
node scripts/test_theme_toggle.js
bundle exec jekyll serve
```

Öppna därefter `http://localhost:4000`.

Sökindexets källfil genereras av `search:init` och behöver inte skrivas för
hand. `Gemfile.lock` ska däremot vara incheckad så att lokala byggen och
GitHub Actions använder samma versioner.

## Innehåll

- [Del I – Modeller och relationer](docs/del-1-grunder/index.md)
- [Om kompendiet](docs/om/om-kompendiet.md)
- [Användningsvillkor](LICENSE.md)

Valideringsskripten publiceras inte av Jekyll.